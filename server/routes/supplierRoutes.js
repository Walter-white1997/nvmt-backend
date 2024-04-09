const express = require('express');
const pool = require('../db'); 
const router = express.Router();


router.get('/suppliers', async (req, res) => {
  try {
    const allSuppliers = await pool.query('SELECT * FROM suppliers');
    res.json(allSuppliers.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});


router.post('/suppliers', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const newSupplier = await pool.query(
      'INSERT INTO suppliers (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone, address]
    );
    res.status(201).json(newSupplier.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Route to get a single supplier by ID
router.get('/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    if (supplier.rows.length === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(supplier.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Route to update a supplier
router.put('/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    const updatedSupplier = await pool.query(
      'UPDATE suppliers SET name = $1, email = $2, phone = $3, address = $4 WHERE id = $5 RETURNING *',
      [name, email, phone, address, id]
    );
    if (updatedSupplier.rows.length === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(updatedSupplier.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Route to delete a supplier
router.delete('/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSupplier = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING *', [id]);
    if (deletedSupplier.rows.length === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
