const express = require('express');
const cors = require("cors");
const path = require('path');
const session = require('express-session');
const connectDB = require('./config/db');

// Import routes
// const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const bookRoutes = require('./routes/book');
const cartRoutes = require('./routes/cart');
const userRoutes = require('./routes/user');
const checkoutRoute = require('./routes/checkout');
const orderRoute = require('./routes/order');
const authRoutes = require('./routes/auth');

const app = express();

// Connect to MongoDB
connectDB();

// Set view engine to EJS
app.set('view engine', 'ejs');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images/books_cover', express.static('public/images/books_cover'));

// Session middleware
app.use(session({
  secret: 'key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Middleware to make session available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;      // Pass user data to views
  res.locals.cartCount = req.session.cartCount || 0;  // Pass cartCount to views
  next();
});



// Use routes
app.use('/', authRoutes);
app.use('/', indexRoutes);
app.use('/book', bookRoutes);
app.use('/cart', cartRoutes);
app.use('/user', userRoutes);
app.use('/', checkoutRoute);
app.use('/', orderRoute);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
