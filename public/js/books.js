function searchBooks() {
    const query = document.getElementById('searchInput').value;
    fetch(`/book/search?query=${query}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('tbody');
            tableBody.innerHTML = '';

            if (data.length > 0) {
                data.forEach(book => {
                    tableBody.innerHTML += `
                <tr>
                    <td>${book._id}</td>
                    <td>${book.title}</td>
                    <td>${book.publisher}</td>
                    <td>${book.author}</td>
                    <td>${book.category}</td>
                    <td class="tools">
                        <a href="#" class="edit-btn" data-book-id="${book._id}"><i class="fa-solid fa-pen"></i></a>
                        <a href="#" class="delete-btn" data-book-id="${book._id}"><i class="fa-solid fa-trash"></i></a>
                    </td>
                </tr>
                `;
                });

                addEditListeners();
                addDeleteListeners();
            } else {
                tableBody.innerHTML = '<tr><td colspan="6">No books found</td></tr>';
            }
        })
        .catch(error => console.error('Error:', error));
}

// Function to add event listeners to the edit buttons
function addEditListeners() {
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const bookId = this.getAttribute('data-book-id');
            
            // Fetch book details using the book ID
            fetch(`/book/${bookId}/edit`)
                .then(response => response.json())
                .then(book => {
                    // Populate the form with the book's current data
                    document.querySelector('[name="title"]').value = book.title;
                    document.querySelector('[name="author"]').value = book.author;
                    document.querySelector('[name="publisher"]').value = book.publisher;
                    document.querySelector('[name="isbn"]').value = book.isbn;
                    document.querySelector('[name="category"]').value = book.category;
                    document.querySelector('[name="price"]').value = book.price;
                    document.querySelector('[name="qty"]').value = book.qty;
                    document.querySelector('[name="description"]').value = book.description;

                    // If there's an existing cover image, set the image preview
                    const coverPreview = document.getElementById('coverPreview');
                    if (book.imageUrl) {
                        coverPreview.src = `/images/books_cover/${book.imageUrl}`;
                    } else {
                        coverPreview.src = '';
                    }

                    // Update form action for editing the existing book
                    document.querySelector('form').setAttribute('action', `/book/${bookId}/edit`);

                    // Open the popup for editing (use openEditBook here)
                    openEditBook();
                })
                .catch(error => console.error('Error fetching book details:', error));
        });
    });
}

function addDeleteListeners() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const bookId = this.getAttribute('data-book-id');

            // Confirm if the user really wants to delete the book
            if (confirm('Are you sure you want to delete this book?')) {
                // Send a DELETE request to the server to delete the book
                fetch(`/book/${bookId}/delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Book deleted successfully') {
                        // Optionally, remove the book row from the table without refreshing the page
                        const row = button.closest('tr');
                        row.remove(); // Remove the row from the table
                    } else {
                        alert('Error deleting book');
                    }
                })
                .catch(error => console.error('Error:', error));
            }
        });
    });
}

function openEditBook() {
    // Change the header text to "Edit Book"
    document.querySelector('.from-flex h2').innerText = 'Edit Book';

    // Remove the 'required' attribute from the cover input (for editing)
    const coverInput = document.getElementById('cover');
    coverInput.removeAttribute('required');

    // Show the form popup
    const element = document.getElementById('addNewBook');
    element.classList.add('active');
}


function openAddBook() {
    // Reset the header text to "Add New Book"
    document.querySelector('.from-flex h2').innerText = 'Add New Book';

    // Set the image input as required when adding a new book
    const coverInput = document.getElementById('cover');
    coverInput.setAttribute('required', 'required');  // Ensure it's required for new book

    // Show the form popup
    const element = document.getElementById('addNewBook');
    element.classList.add('active');
}





function closePopup() {
    const element = document.getElementById('addNewBook');
    element.classList.remove('active');

    const form = document.querySelector('form');
    form.reset();  // This resets all the fields, including removing any temporary data

    const coverPreview = document.getElementById('coverPreview');
    coverPreview.src = '';  // Clear the image preview

    form.setAttribute('action', '/book/add');  // Reset form action to add a new book

    // Reset the header text to "Add New Book"
    document.querySelector('.from-flex h2').innerText = 'Add New Book';

    // Ensure that the cover image input is marked as required for adding a new book
    const coverInput = document.getElementById('cover');
    coverInput.setAttribute('required', 'required');  // Make sure it's set back for adding a new book
}




function previewImage() {
    const fileInput = document.getElementById('cover');
    const preview = document.getElementById('coverPreview');
    const file = fileInput.files[0];

    const reader = new FileReader();
    reader.onload = function (e) {
        preview.src = e.target.result; // Set the preview image to the file's content
    };

    if (file) {
        reader.readAsDataURL(file); // Read the image file as a data URL
    } else {
        preview.src = ''; // Clear the preview if no file is selected
    }
}

document.addEventListener("DOMContentLoaded", function () {
    addEditListeners();
    addDeleteListeners();
});