async function addToCart(bookId) {
    await fetch(`/cart/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookId: bookId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message); // Show alert if there is an error (e.g., stock limit exceeded)
        } else {
            // Update the cart count
            document.getElementById('cart-count').innerText = data.cartCount;
        }
    })
    .catch(error => {
        console.error('Error adding to cart:', error);
    });
}


async function searchBooks(params) {
    const query = document.getElementById('search-input').value; // ดึงค่าจาก input
    
    
    // หากไม่มีคำค้นให้ซ่อนผลการค้นหาและแสดงรายการหนังสือทั้งหมด
    if (!query) {
        document.getElementById('results-container').style.display = 'block';
        document.getElementById('result').style.display = 'none'; // แสดงรายการหนังสือทั้งหมด
        return;
    } else {
        document.getElementById('results-container').style.display = 'none';
    }

    // ซ่อนรายการหนังสือทั้งหมด
    document.querySelector('.book-lists').style.display = 'none';

    await fetch(`/book/search?q=${encodeURIComponent(query)}`)
        .then(response => {
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return response.json();
        })
        .then(data => {
            // แสดงผลลัพธ์การค้นหา
            console.log(data);
            
            const resultsContainer = document.getElementById('result');
            resultsContainer.innerHTML = ''; // เคลียร์ผลการค้นหาเก่า

            const sectionElement = document.createElement('section');
            sectionElement.className = 'book-lists';

            const containerElement = document.createElement('div');
            containerElement.className = 'container';

            sectionElement.appendChild(containerElement)

            const headingTextDiv = document.createElement('div');
            headingTextDiv.className = 'heading-text';

            const heading = document.createElement('h2');
            heading.textContent = `Search by: ${query}`;

            headingTextDiv.appendChild(heading);

            containerElement.appendChild(headingTextDiv);

            const books = document.createElement('div');
            books.className = 'books';

            data.forEach(book => {
                const bookElement = document.createElement('div');
                bookElement.className = 'book-card';
                
                bookElement.innerHTML = `
                    <a href="/book/${book._id}"><img src="/images/books_cover/${book.imageUrl}" alt="Book cover" class="book-cover" onerror="this.onerror=null;this.src='/images/books_cover/default_cover.jpg';"></a>
                    <div class="book-info">
                        <div class="text-info">
                            <p class="book-title-card">${book.title}</p>
                            <p class="book-availability">คงเหลือ ${book.qty} เล่ม</p>
                            <p class="book-price">${book.price} บาท</p>
                        </div>
                        ${book.qty > 0 ? 
                            `<button class="add-to-cart-btn" onclick="addToCart('${book.id}')">Add to Cart</button>` : 
                            `<button class="add-to-cart-btn disable" disabled>Out of stock</button>`
                        }
                    </div>
                `;
                books.appendChild(bookElement)
            });
            containerElement.appendChild(books)

            resultsContainer.appendChild(sectionElement);

            // แสดงผลลัพธ์การค้นหา
            document.getElementById('result').style.display = 'block';
        })
        .catch(error => {
            console.error('Error searching books:', error);
        });
}

// Get DOM elements
const cartIcon = document.querySelector('.fa-shopping-cart');
const cartPopup = document.getElementById('cart-popup');
const cartPopupOverlay = document.getElementById('cart-popup-overlay');
const closeCartPopup = document.getElementById('close-cart-popup');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');

// Function to toggle the cart popup
function toggleCartPopup() {
    cartPopup.classList.toggle('active');
    cartPopupOverlay.classList.toggle('active');
}

// Open cart popup when the cart icon is clicked
cartIcon.addEventListener('click', () => {
    toggleCartPopup();
    loadCartItems();  // Load cart items into the popup when it opens
});

// Close cart popup when the close button is clicked
closeCartPopup.addEventListener('click', toggleCartPopup);

// Close the popup when clicking outside of it (overlay click)
cartPopupOverlay.addEventListener('click', toggleCartPopup);

// Load cart items into the popup
function loadCartItems() {
    fetch('/cart') // Fetch cart items from the server
        .then(response => response.json())
        .then(cart => {
            cartItemsContainer.innerHTML = ''; // Clear previous items

            // Loop through cart items and display them
            cart.items.forEach(item => {
                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('cart-item');
                cartItemElement.innerHTML = `
                    <div class="cart-item-img-container">
                        <img src="/images/books_cover/${item.book.imageUrl}" alt="${item.book.title}" class="cart-item-img" onerror="this.onerror=null;this.src='/images/books_cover/default_cover.jpg';">
                    </div>
                    <div class="cart-item-info">
                        <span class="cart-item-title">${item.book.title}</span>
                        <div class="cart-item-qty-controls">
                            <button class="qty-btn minus" onclick="updateCartItem('${item.book._id}', 'minus')">-</button>
                            <input type="number" value="${item.quantity}" class="cart-item-qty" min="1" max="${item.book.qty}" data-book-id="${item.book._id}">
                            <button class="qty-btn plus" onclick="updateCartItem('${item.book._id}', 'plus')">+</button>
                        </div>
                    </div>
                    <div class="cart-item-price">
                        <span>${item.book.price * item.quantity} บาท</span>
                        <button class="remove-btn" onclick="removeCartItem('${item.book._id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });

            // Update total price
            cartTotalPrice.textContent = `${cart.totalAmount} บาท`;
        })
        .catch(error => console.error('Error loading cart items:', error));
}

// Function to update cart item quantity
function updateCartItem(bookId, operation) {
    const currentQtyInput = document.querySelector(`.cart-item-qty[data-book-id="${bookId}"]`);
    let newQuantity = parseInt(currentQtyInput.value);

    // Increase or decrease quantity
    if (operation === 'plus') {
        newQuantity++;
    } else if (operation === 'minus' && newQuantity > 1) {
        newQuantity--;
    }

    // Update the quantity on the server
    fetch(`/cart/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookId: bookId, quantity: newQuantity }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            // If quantity exceeds stock, show alert and reset to available stock
            alert(data.message);
            currentQtyInput.value = data.availableStock;
        } else {
            loadCartItems(); // Reload the cart items and update total
        }
    })
    .catch(error => console.error('Error updating cart item:', error));
}

// Function to remove cart item
function removeCartItem(bookId) {
    fetch(`/cart/remove`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookId: bookId }),
    })
    .then(() => {
        loadCartItems(); // Reload cart items after removing one
    })
    .catch(error => console.error('Error removing cart item:', error));
}
