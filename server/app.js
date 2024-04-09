// app.js

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json()); // for parsing application/json


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Routes
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const orderRoutes = require('./routes/orderRoutes'); 

app.use(authRoutes); 
app.use(inventoryRoutes); 
app.use(supplierRoutes); 
app.use(orderRoutes); 

app.get('/', (req, res) => {
    res.send('Hello, world! This is the NVMt restaurant management app backend.');
});


app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: "This is protected" });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
