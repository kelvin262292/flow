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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});