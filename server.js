require('dotenv').config(); // Moved to the top
const express = require('express');
const pool = require('./database'); // Changed client to pool
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan'); // Corrected morgan require
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcryptjs'); // Added bcryptjs

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.static('.')); // Phục vụ tệp tĩnh từ thư mục gốc
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  store: new pgSession({
    pool: pool, // Connection pool
    tableName: 'user_sessions' // Optional: customize session table name
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true, // Recommended
    // secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
  }
}));

// API endpoints
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const result = await pool.query(
      'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3) RETURNING *',
      [name, email, message]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error inserting contact:', err);
    res.status(500).json({ success: false, error: 'Could not save the message' });
  }
});

// Lấy danh sách sản phẩm
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM products';
    const params = [];
    let condition = '';

    if (category) {
      condition += 'category = $1';
      params.push(category);
    }

    if (search) {
      if (params.length > 0) condition += ' AND ';
      condition += 'name ILIKE $' + (params.length + 1);
      params.push(`%${search}%`);
    }

    if (condition) {
      query += ' WHERE ' + condition;
    }

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Could not fetch products' });
  }
});

// Lấy chi tiết sản phẩm theo ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching product details:', err);
    res.status(500).json({ error: 'Could not fetch product details' });
  }
});

// --- Authentication API Endpoints ---

// Register Endpoint
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }
  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, password_hash]
    );
    res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    req.session.userId = user.id; // Set user ID in session
    req.session.username = user.username; // Optional: store username also
    // Exclude password_hash from the returned user object
    const { password_hash, ...userWithoutPassword } = user;
    res.status(200).json({ message: 'Login successful', user: userWithoutPassword });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Logout Endpoint
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Could not log out, please try again.' });
    }
    res.clearCookie('connect.sid'); // Default cookie name for express-session, adjust if different
    res.status(200).json({ message: 'Logout successful.' });
  });
});

// Status Endpoint (to check login status)
app.get('/api/auth/status', (req, res) => {
  if (req.session.userId) {
    // Optionally, fetch fresh user details if needed, or just return stored session data
    res.status(200).json({ 
      isLoggedIn: true, 
      userId: req.session.userId,
      username: req.session.username 
    });
  } else {
    res.status(200).json({ isLoggedIn: false });
  }
});

// --- End of Authentication API Endpoints ---

// --- Cart API Endpoints ---

// Middleware to check for authenticated user
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'User not authenticated. Please log in.' });
  }
};

// POST /api/cart - Add item to cart or update quantity
app.post('/api/cart', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  const { productId, quantity } = req.body;

  if (!productId || typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ message: 'Product ID and a positive quantity are required.' });
  }

  try {
    // Use INSERT ... ON CONFLICT to handle add or update atomically.
    // This will set the quantity to the provided value if the item exists, or insert it.
    // The problem states "updates the quantity", which implies setting to the new quantity, not incrementing.
    const query = `
      INSERT INTO carts (user_id, product_id, quantity, created_at, updated_at) 
      VALUES ($1, $2, $3, NOW(), NOW()) 
      ON CONFLICT (user_id, product_id) 
      DO UPDATE SET quantity = $3, updated_at = NOW()
      RETURNING *, (xmax = 0) AS inserted;  -- xmax = 0 indicates an insert
    `;
    // Note: EXCLUDED.quantity could be used if we wanted to refer to the value that would have been inserted.
    // Here, $3 (the input quantity) is used directly for the update.

    const result = await pool.query(query, [userId, productId, quantity]);
    const cartItem = result.rows[0];
    
    if (cartItem.inserted) {
      res.status(201).json({ message: 'Item added to cart.', cartItem: { user_id: cartItem.user_id, product_id: cartItem.product_id, quantity: cartItem.quantity, created_at: cartItem.created_at, updated_at: cartItem.updated_at } });
    } else {
      res.status(200).json({ message: 'Cart item quantity updated.', cartItem: { user_id: cartItem.user_id, product_id: cartItem.product_id, quantity: cartItem.quantity, created_at: cartItem.created_at, updated_at: cartItem.updated_at } });
    }

  } catch (err) {
    console.error('Error adding/updating item in cart:', err);
    if (err.code === '23503' && err.constraint === 'carts_product_id_fkey') {
      // This check ensures the product_id exists in the products table
      return res.status(404).json({ message: 'Product not found.' });
    }
    if (err.code === '23514' && err.constraint === 'carts_quantity_check') {
      return res.status(400).json({ message: 'Quantity must be greater than 0.' });
    }
    res.status(500).json({ message: 'Server error while adding to cart.' });
  }
});

// GET /api/cart - Retrieve all items in cart
app.get('/api/cart', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  try {
    const result = await pool.query(
      `SELECT 
         c.product_id, 
         c.quantity, 
         c.created_at AS cart_item_created_at, 
         c.updated_at AS cart_item_updated_at,
         p.name, 
         p.price, 
         p.description, 
         p.image_url, 
         p.category 
       FROM carts c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = $1 
       ORDER BY p.name ASC`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error retrieving cart:', err);
    res.status(500).json({ message: 'Server error while retrieving cart.' });
  }
});

// PUT /api/cart/item/:productId - Update quantity of a specific item
app.put('/api/cart/item/:productId', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  const { productId } = req.params;
  const { quantity } = req.body;

  if (typeof quantity !== 'number' || quantity < 0) { // Allow quantity 0 for deletion via this route
    return res.status(400).json({ message: 'A valid quantity (non-negative number) is required.' });
  }

  try {
    const productExists = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (productExists.rows.length === 0) {
        return res.status(404).json({ message: 'Product not found.' });
    }

    if (quantity === 0) {
      // Delete item if quantity is 0
      const deleteResult = await pool.query(
        'DELETE FROM carts WHERE user_id = $1 AND product_id = $2 RETURNING *',
        [userId, productId]
      );
      if (deleteResult.rowCount === 0) {
        return res.status(404).json({ message: 'Cart item not found or already removed.' });
      }
      return res.status(200).json({ message: 'Cart item removed due to quantity zero.', cartItem: deleteResult.rows[0] });
    } else {
      // Update quantity for an existing item
      // The original implementation of simple UPDATE and then checking rows.length is correct for PUT.
      // PUT should ideally update an existing resource or fail if not found.
      const result = await pool.query(
        'UPDATE carts SET quantity = $1, updated_at = NOW() WHERE user_id = $2 AND product_id = $3 RETURNING *',
        [quantity, userId, productId]
      );
      if (result.rows.length === 0) {
        // If the item was not found in the cart for this user and product, return 404.
        // This aligns with PUT semantics: update existing or fail.
        return res.status(404).json({ message: 'Cart item not found. Cannot update.' });
      }
      res.status(200).json({ message: 'Cart item quantity updated.', cartItem: result.rows[0] });
    }
  } catch (err) {
    console.error('Error updating cart item quantity:', err);
    // The carts_quantity_check constraint is (quantity > 0)
    // The code already checks for quantity < 0.
    // If quantity is 0, it's handled by the delete logic.
    // This specific check for '23514' might be redundant if quantity must be > 0 in DB,
    // but doesn't hurt as a safeguard if DB schema changes or for other check constraints.
    if (err.code === '23514' && err.constraint === 'carts_quantity_check') { 
        return res.status(400).json({ message: 'Quantity must be greater than 0. To remove, set quantity to 0 or use the DELETE endpoint.' });
    }
    // Foreign key constraint for product_id (if product_id in carts table doesn't exist in products table)
    // This is already checked by productExists query above.
    // if (err.code === '23503' && err.constraint === 'carts_product_id_fkey') {
    //     return res.status(404).json({ message: 'Product not found.' });
    // }
    res.status(500).json({ message: 'Server error while updating cart item quantity.' });
  }
});

// DELETE /api/cart/item/:productId - Remove a specific item from cart
app.delete('/api/cart/item/:productId', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  const { productId } = req.params;

  try {
    // Check if product exists (optional, but good for feedback)
    const productExists = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (productExists.rows.length === 0) {
        return res.status(404).json({ message: 'Product not found (cannot be in cart).' });
    }

    const result = await pool.query(
      'DELETE FROM carts WHERE user_id = $1 AND product_id = $2 RETURNING product_id', // Return something to check rowCount implicitly
      [userId, productId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Cart item not found or already removed.' });
    }
    res.status(200).json({ message: 'Item removed from cart successfully.' }); // 204 No Content is also an option if not returning body
  } catch (err) {
    console.error('Error removing item from cart:', err);
    res.status(500).json({ message: 'Server error while removing item from cart.' });
  }
});

// DELETE /api/cart - Clear all items from cart
app.delete('/api/cart', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  try {
    await pool.query('DELETE FROM carts WHERE user_id = $1', [userId]);
    // No need to check rowCount, if cart was empty, it's still a success (idempotent)
    res.status(200).json({ message: 'Cart cleared successfully.' }); // Or 204
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ message: 'Server error while clearing cart.' });
  }
});

// --- End of Cart API Endpoints ---

// --- Order API Endpoints ---

// POST /api/orders/checkout - Convert cart to order
app.post('/api/orders/checkout', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  const { shippingAddress } = req.body;

  if (!shippingAddress || typeof shippingAddress !== 'string' || shippingAddress.trim() === '') {
    return res.status(400).json({ message: 'Shipping address is required.' });
  }

  const client = await pool.connect(); // Get a client from the pool for transaction

  try {
    await client.query('BEGIN');

    // 1. Retrieve cart items with current product details
    const cartItemsQuery = `
      SELECT 
        c.product_id, 
        c.quantity, 
        p.price AS current_price,
        p.name AS product_name,
        p.stock_quantity
      FROM carts c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = $1;
    `;
    const cartItemsResult = await client.query(cartItemsQuery, [userId]);
    const cartItems = cartItemsResult.rows;

    if (cartItems.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Your cart is empty. Cannot proceed to checkout.' });
    }

    // 2. Calculate totalAmount and check stock
    let totalAmount = 0;
    for (const item of cartItems) {
      if (item.quantity > item.stock_quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          message: `Not enough stock for product: ${item.product_name}. Available: ${item.stock_quantity}, Requested: ${item.quantity}.`,
          productId: item.product_id
        });
      }
      totalAmount += item.current_price * item.quantity;
    }
    totalAmount = parseFloat(totalAmount.toFixed(2)); // Ensure 2 decimal places

    // 3. Create a new order in the 'orders' table
    const orderInsertQuery = `
      INSERT INTO orders (user_id, total_amount, shipping_address, status) 
      VALUES ($1, $2, $3, 'pending') 
      RETURNING id, user_id, order_date, status, total_amount, shipping_address, created_at, updated_at;
    `;
    const orderResult = await client.query(orderInsertQuery, [userId, totalAmount, shippingAddress]);
    const newOrder = orderResult.rows[0];
    const orderId = newOrder.id;

    // 4. Insert items into 'order_items' and update product stock
    for (const item of cartItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, item.current_price]
      );
      // Decrease product stock
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // 5. Clear the user's cart
    await client.query('DELETE FROM carts WHERE user_id = $1', [userId]);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Order placed successfully.', order: newOrder });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during checkout:', err);
    // Check for specific errors like out of stock during the final update (though checked before)
    if (err.code === '23514' && err.constraint === 'products_stock_quantity_check') { // Example constraint name
        return res.status(400).json({ message: 'An item in your cart went out of stock. Please review your cart.'});
    }
    res.status(500).json({ message: 'Server error during checkout.' });
  } finally {
    client.release(); // Release the client back to the pool
  }
});

// GET /api/orders - Retrieve order history for the current user
app.get('/api/orders', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  try {
    // Query to get orders and aggregate order items as JSON
    const ordersQuery = `
      SELECT 
        o.id AS order_id, 
        o.user_id, 
        o.order_date, 
        o.status, 
        o.total_amount, 
        o.shipping_address, 
        o.created_at AS order_created_at, 
        o.updated_at AS order_updated_at,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'price_at_purchase', oi.price_at_purchase,
              'name', p.name,
              'image_url', p.image_url,
              'description', p.description
            ) ORDER BY p.name ASC
          )
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = o.id),
          '[]'::json
        ) AS items
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.order_date DESC;
    `;
    const result = await pool.query(ordersQuery, [userId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error retrieving order history:', err);
    res.status(500).json({ message: 'Server error while retrieving order history.' });
  }
});

// GET /api/orders/:orderId - Retrieve details of a specific order
app.get('/api/orders/:orderId', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  const { orderId } = req.params;

  if (isNaN(parseInt(orderId))) {
      return res.status(400).json({ message: 'Invalid order ID format.' });
  }

  try {
    const orderQuery = `
      SELECT 
        o.id AS order_id, 
        o.user_id, 
        o.order_date, 
        o.status, 
        o.total_amount, 
        o.shipping_address, 
        o.created_at AS order_created_at, 
        o.updated_at AS order_updated_at,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'price_at_purchase', oi.price_at_purchase,
              'order_item_created_at', oi.created_at,
              'order_item_updated_at', oi.updated_at,
              'name', p.name,
              'description', p.description,
              'image_url', p.image_url,
              'category', p.category
            ) ORDER BY p.name ASC
          )
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = o.id),
          '[]'::json
        ) AS items
      FROM orders o
      WHERE o.id = $1 AND o.user_id = $2;
    `;
    const result = await pool.query(orderQuery, [orderId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found or you do not have permission to view it.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error retrieving order details:', err);
    res.status(500).json({ message: 'Server error while retrieving order details.' });
  }
});

// --- End of Order API Endpoints ---

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});