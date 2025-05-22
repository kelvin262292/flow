const express = require('express');
const client = require('./database');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.static('.')); // Phục vụ tệp tĩnh từ thư mục gốc
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API endpoints
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const result = await client.query(
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

    const result = await client.query(query, params);
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
    const result = await client.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching product details:', err);
    res.status(500).json({ error: 'Could not fetch product details' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});