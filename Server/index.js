const mongoose = require('mongoose');
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const registerRoute = require('./routes/register');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart')
const orderRoutes = require('./routes/order');
const feedbackRoutes = require('./routes/feedbackRoutes')
const metaRoutes = require('./routes/productMeta')
const path = require('path');
dotenv.config();

const app = express();

// CORS Configuration
app.use(cors({
    origin: ["https://cf-nu-blush.vercel.app","http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(cookieParser());
app.use('/api', registerRoute);
app.use('/api',productRoutes);
app.use('/api',cartRoutes);
app.use('/api/order',orderRoutes)
app.use('/api',feedbackRoutes)
app.use('/api',metaRoutes)
// Start Server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

// MongoDB Connection
mongoose.connect(process.env.URL).then(() => {
    console.log("Connected to database");
}).catch(err => {
    console.error("Database connection error:", err);
});
