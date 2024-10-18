const express = require('express');
const router = express.Router();

const Book = require('../models/Book');

router.get('/', async (req, res) => {
  try {

    const topBooks = await Book.find().limit(20);

    const categories = await Book.distinct('category');

    const showBook = [
      {
        categoryName: 'นิยายสืบสวน สอบสวน',
        books: await Book.find({ category: 'นิยายสืบสวน สอบสวน' }).limit(6),
      },
      {
        categoryName: 'จิตวิทยา',
        books: await Book.find({ category: 'จิตวิทยา' }).limit(6),
      },
      {
        categoryName: 'ฮีลใจ',
        books: await Book.find({ category: 'ฮีลใจ' }).limit(6),
      },
      {
        categoryName: 'หนังสืออื่น ๆ',
        books: await Book.find(),
      },
    ];

    res.render('index', {
      slideBooks: topBooks,
      categorys: categories.map((cat) => ({ name: cat })),
      showBook,
      categories: false,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Server Error');
  }
});

router.get('/category/:category', async (req, res) => {
  console.log(req.params.category);
  try {
    let books;
    if (req.params.category !== 'หนังสืออื่น ๆ') {
      books = await Book.find({ category: req.params.category });
    } else {
      books = await Book.find();
    }

    const topBooks = await Book.find().limit(20);

    const categories = await Book.distinct('category');

    // res.render('index', {showBook, cateBooks: books, categories: categories, nameCate: req.params.category, slideBooks: topBooks, categorys: categories.map((cat) => ({ name: cat }))});
    res.render('index', {cateBooks: books, nameCate: req.params.category, slideBooks: topBooks, categorys: categories.map((cat) => ({ name: cat }))});
  } catch (err) {
    console.error('Error fetching books by category:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
