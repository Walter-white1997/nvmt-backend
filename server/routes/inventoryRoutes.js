const express = require('express');
const pool = require('../db');
const router = express.Router();

// Route to get all categories
router.get('/categories', async (req, res) => {
  try {
    const allCategories = await pool.query('SELECT * FROM categories');
    res.json(allCategories.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Route to add a new category
router.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;

    // Trim the name and check for case-insensitive match to be more robust in checking duplicates
    const trimmedName = name.trim();
    const existingCategory = await pool.query('SELECT * FROM categories WHERE LOWER(name) = LOWER($1)', [trimmedName]);

    if (existingCategory.rows.length > 0) {
      // Respond with a 400 status code for client-side error (Bad Request)
      return res.status(400).json({ message: 'Category already exists' });
    }

    const newCategory = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [trimmedName] // Use trimmed name for insertion
    );

    res.status(201).json(newCategory.rows[0]);
  } catch (error) {
    console.error(error.message);
    // It's good practice to differentiate between validation errors (400) and server errors (500)
    res.status(500).send('Server error');
  }
});


// Adjusted POST /inventory to include supplier_id
router.post('/inventory', async (req, res) => {
  try {
    const { name, quantity, price, category_id, threshold_quantity, unit_of_measurement, supplier_id } = req.body;

    // Normalize inputs to improve matching, e.g., trim and lowercase names.
    const trimmedName = name.trim().toLowerCase();
    
    // Check if the item already exists in the inventory
    const existingItem = await pool.query(
      'SELECT * FROM inventory WHERE LOWER(name) = $1 AND category_id = $2',
      [trimmedName, category_id]
    );

    if (existingItem.rows.length > 0) {
      // If item exists, update its quantity
      const updatedQuantity = existingItem.rows[0].quantity + quantity;
      const updateResponse = await pool.query(
        'UPDATE inventory SET quantity = $1 WHERE id = $2 RETURNING *',
        [updatedQuantity, existingItem.rows[0].id]
      );
      res.json({ message: 'Inventory updated successfully', item: updateResponse.rows[0] });
    } else {
      // Normalize the name back to its original form for insertion
      const newInventoryItem = await pool.query(
        'INSERT INTO inventory (name, quantity, price, category_id, threshold_quantity, unit_of_measurement, supplier_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [name, quantity, price, category_id, threshold_quantity, unit_of_measurement, supplier_id]
      );
      
      res.status(201).json(newInventoryItem.rows[0]);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});


// Adjusted GET /inventory to join with the suppliers table and include supplier information
router.get('/inventory', async (req, res) => {
  try {
    const allInventoryItems = await pool.query(
      `SELECT inventory.id, inventory.name, inventory.quantity, inventory.price, inventory.category_id, inventory.threshold_quantity, inventory.unit_of_measurement, inventory.supplier_id, categories.name AS category_name, suppliers.name AS supplier_name
      FROM inventory
      INNER JOIN categories ON inventory.category_id = categories.id
      LEFT JOIN suppliers ON inventory.supplier_id = suppliers.id`
    );
    res.json(allInventoryItems.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
