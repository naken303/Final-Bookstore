const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const Book = require('../models/Book');

// Set up storage engine for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/books_cover'); // Store images in 'public/uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
    }
});

// Initialize multer upload
const upload = multer({
    storage: storage,
    // limits: { fileSize: 1024 * 1024 * 5 }, // 5MB size limit for images
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
});

// Route to handle adding new book
router.post('/add', upload.single('cover'), async (req, res) => {
    try {
        const { title, author, publisher, isbn, category, price, qty, description } = req.body;

        // Check if file is uploaded and set the image URL accordingly
        const imageUrl = req.file ? `${req.file.filename}` : '';

        // Create a new book object
        const newBook = new Book({
            title,
            author,
            publisher,
            isbn,
            category,
            price,
            qty,
            description,
            imageUrl
        });

        // Save the book in the database
        await newBook.save();

        // Redirect to the book list after adding the book
        res.redirect('/book');
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).send('Server Error');
    }
});

// Route to handle editing an existing book
router.post('/:id/edit', upload.single('cover'), async (req, res) => {
    const bookId = req.params.id;

    try {
        const { title, author, publisher, isbn, category, price, qty, description } = req.body;

        // Find the book by ID
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).send('Book not found');
        }

        // Update book fields
        book.title = title;
        book.author = author;
        book.publisher = publisher;
        book.isbn = isbn;
        book.category = category;
        book.price = price;
        book.qty = qty;
        book.description = description;

        // If a new cover image is uploaded, update the imageUrl, otherwise keep the old one
        if (req.file) {
            book.imageUrl = `${req.file.filename}`;
        }

        // Save the updated book
        await book.save();

        // Redirect back to the books list after editing
        res.redirect('/book');
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).send('Server Error');
    }
});


// Route to get book details for editing
router.get('/:id/edit', async (req, res) => {
    const bookId = req.params.id;

    try {
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json(book); // Send the book data as JSON for the frontend to populate the form
    } catch (err) {
        console.error('Error fetching book:', err.message);
        res.status(500).send('Server Error');
    }
});

// Route to delete a book by ID
router.delete('/:id/delete', async (req, res) => {
    const bookId = req.params.id;
    
    try {
        // Find the book by ID and delete it
        const book = await Book.findByIdAndDelete(bookId);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Respond with a success message
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (err) {
        console.error('Error deleting book:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// Search Route
router.get('/search', async (req, res) => {
    const query = req.query.q; // This should match 'query' in the fetch request
    console.log(query);
    try {
        const books = await Book.find({ title: new RegExp(query, 'i') }); // Case-insensitive search
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get book by ID
router.get('/:id', async(req, res) => {
    const book_id = req.params.id;
    try {
        const book = await Book.findById(book_id);

        if (!book) {
            return res.status(404).send('Book not found');
        }
        
        res.render('bookDetail', { book });
    } catch (err) {
        console.error('Error fetching book:', err.message);
        res.status(500).send('Server Error');
    }
});

// Get all books
router.get('/', async(req, res) => {
    try {
        const books = await Book.find();

        if (!books) {
            return res.status(404).send('Books not found');
        }

        res.render('books', { books });
    } catch (err) {
        console.error('Error fetching books:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
