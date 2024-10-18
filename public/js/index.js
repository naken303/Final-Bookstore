
const slides = document.querySelectorAll('.banner .slide');
const slider = document.querySelector('.banner-slides');
const nextButton = document.querySelector('.next');
const prevButton = document.querySelector('.prev');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;
const totalSlides = slides.length;
let isMoving = false;  // Prevent multiple clicks during transition

// Set up the initial position
updateSlidePosition();

// Event listeners for next and prev buttons
nextButton.addEventListener('click', () => {
    if (!isMoving) {
        moveToNextSlide();
    }
});

prevButton.addEventListener('click', () => {
    if (!isMoving) {
        moveToPrevSlide();
    }
});

// Dot navigation
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        if (!isMoving) {
            currentSlide = index;
            updateSlidePosition();
            updateDots();
        }
    });
});

// Auto-slide every 5 seconds
const autoSlide = setInterval(() => {
    if (!isMoving) {
        moveToNextSlide();
    }
}, 5000);

// Function to move to the next slide
function moveToNextSlide() {
    if (!isMoving) {
        isMoving = true;
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlidePosition();
    }
}

// Function to move to the previous slide
function moveToPrevSlide() {
    if (!isMoving) {
        isMoving = true;
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlidePosition();
    }
}

// Function to update the slide position
function updateSlidePosition() {
    slider.style.transition = 'transform 0.5s ease-in-out';
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    updateDots();

    // After the transition, reset the flag
    slider.addEventListener('transitionend', () => {
        isMoving = false;
    }, { once: true });
}

// Function to update the active dot
function updateDots() {
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentSlide].classList.add('active');
}

// book slider
const bookSlider = document.querySelector('.book-slider');
let isDown = false;
let startX;
let scrollLeft;

bookSlider.addEventListener('mousedown', (e) => {
    isDown = true;
    bookSlider.classList.add('active');
    startX = e.pageX - bookSlider.offsetLeft;
    scrollLeft = bookSlider.scrollLeft;
    e.preventDefault();
});

bookSlider.addEventListener('mouseleave', () => {
    isDown = false;
    bookSlider.classList.remove('active');
});

bookSlider.addEventListener('mouseup', () => {
    isDown = false;
    bookSlider.classList.remove('active');
});

bookSlider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - bookSlider.offsetLeft;
    const walk = (x - startX) * 3;
    bookSlider.scrollLeft = scrollLeft - walk;
});


// category slider
const asdeE = document.querySelector('.category-slider');
const prevBtn = document.querySelector('.pre-category-btn');
const nextBtn = document.querySelector('.next-category-btn');

// Define the amount of scroll for each click (e.g., 300px)
const scrollAmount = 300;

// Event listener for the previous button
prevBtn.addEventListener('click', (e) => {
    asdeE.scrollLeft -= scrollAmount;
});

// Event listener for the next button
nextBtn.addEventListener('click', (e) => {
    asdeE.scrollLeft += scrollAmount;
});