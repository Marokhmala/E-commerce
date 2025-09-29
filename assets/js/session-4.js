// session-4.js - Updated cart functionality for cart.html

const table = document.querySelector('.cart-main-table');

// Create a row for cart total at the bottom
const totalRow = document.createElement('tr');
totalRow.classList.add('cart-total-row');
const totalTd = document.createElement('td');
totalTd.setAttribute('colspan', 4);
totalTd.style.textAlign = 'right';
totalTd.style.fontWeight = 'bold';
totalTd.textContent = 'Total: $0';
totalRow.appendChild(totalTd);
table.appendChild(totalRow);

// Load cart IDs from localStorage
function loadCartIds() {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
        return JSON.parse(savedCart);
    }
    return [];
}

// Save updated cart to localStorage
function saveCartIds(cartIds) {
    localStorage.setItem('cartItems', JSON.stringify(cartIds));
}

// Remove item from localStorage cart
function removeFromCart(productId) {
    const cartIds = loadCartIds();
    const updatedCart = cartIds.filter(id => id !== productId);
    saveCartIds(updatedCart);
}

// Fetch products and filter by cart IDs
async function fetchAndRenderCartItems() {
    try {
        const cartIds = loadCartIds();
        
        if (cartIds.length === 0) {
            showEmptyCartMessage();
            return;
        }

        console.log('Loading cart with IDs:', cartIds);

        // Fetch all products
        const response = await fetch('https://dummyjson.com/products');
        const data = await response.json();
        
        // Filter products by cart IDs
        const cartProducts = data.products.filter(product => cartIds.includes(product.id));
        
        console.log('Found cart products:', cartProducts);

        if (cartProducts.length > 0) {
            renderCartItems(table, cartProducts);
        } else {
            showEmptyCartMessage();
        }
        
    } catch (error) {
        console.error('Error fetching cart products:', error);
        showErrorMessage();
    }
}

// Show empty cart message
function showEmptyCartMessage() {
    const emptyRow = document.createElement('tr');
    const emptyTd = document.createElement('td');
    emptyTd.setAttribute('colspan', 4);
    emptyTd.style.textAlign = 'center';
    emptyTd.style.padding = '40px';
    emptyTd.style.fontSize = '18px';
    emptyTd.textContent = 'Your cart is empty';
    emptyRow.appendChild(emptyTd);
    table.insertBefore(emptyRow, totalRow);
}

// Show error message
function showErrorMessage() {
    const errorRow = document.createElement('tr');
    const errorTd = document.createElement('td');
    errorTd.setAttribute('colspan', 4);
    errorTd.style.textAlign = 'center';
    errorTd.style.padding = '40px';
    errorTd.style.fontSize = '18px';
    errorTd.style.color = 'red';
    errorTd.textContent = 'Error loading cart items. Please try again.';
    errorRow.appendChild(errorTd);
    table.insertBefore(errorRow, totalRow);
}

function renderCartItems(target, itemsArr) {
    // Function to recalc total
    function updateCartTotal() {
        let total = 0;
        target.querySelectorAll('.cart-item').forEach(tr => {
            const sub = tr.querySelector('.sub-total').dataset.value;
            total += Number(sub);
        });
        totalTd.textContent = `Total: $${total.toFixed(2)}`;
    }

    if (itemsArr.length > 0) {
        itemsArr.forEach(product => {
            const tr = document.createElement('tr');
            tr.classList.add('cart-item');
            tr.dataset.productId = product.id; // Store product ID

            let currentQuantity = 1;

            // --- Product column ---
            const tdFirst = document.createElement('td');
            const wrapperDiv = document.createElement('div');
            wrapperDiv.className = 'flex align-center g-24';

            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'image relative';

            const productImage = document.createElement('img');
            productImage.src = product.thumbnail; // Use API image
            productImage.alt = product.title;
            productImage.style.width = '60px';
            productImage.style.height = '60px';
            productImage.style.objectFit = 'cover';

            const removeBtn = document.createElement('button');
            removeBtn.setAttribute('aria-label', 'Remove item');
            removeBtn.innerHTML = '✖';
            removeBtn.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                background: red;
                color: white;
                border: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 12px;
            `;

            removeBtn.addEventListener('click', () => {
                // Remove from localStorage
                removeFromCart(product.id);
                // Remove from DOM
                tr.remove();
                updateCartTotal();
                updateProductCount(); // Update cart count display
                
                // Check if cart is now empty
                const remainingItems = target.querySelectorAll('.cart-item');
                if (remainingItems.length === 0) {
                    showEmptyCartMessage();
                }
            });

            const titleWrapper = document.createElement('div');
            titleWrapper.className = 'title';
            const title = document.createElement('h2');
            title.textContent = product.title;
            title.style.fontSize = '14px';
            title.style.fontWeight = 'normal';
            titleWrapper.append(title);

            imageWrapper.append(productImage, removeBtn);
            wrapperDiv.append(imageWrapper, titleWrapper);
            tdFirst.append(wrapperDiv);

            // --- Price column ---
            const tdSecond = document.createElement('td');
            tdSecond.textContent = `$${product.price}`;

            // --- Quantity column ---
            const tdThird = document.createElement('td');
            const quantitySelector = document.createElement('input');
            quantitySelector.type = 'number';
            quantitySelector.min = 1;
            quantitySelector.value = 1;
            quantitySelector.style.width = '60px';

            quantitySelector.addEventListener('change', (e) => {
                const val = Number(e.target.value) || 1;
                currentQuantity = val;
                const subtotal = currentQuantity * product.price;
                subTotalWrapper.textContent = `$${subtotal.toFixed(2)}`;
                subTotalWrapper.dataset.value = subtotal;
                updateCartTotal();
            });

            tdThird.append(quantitySelector);

            // --- Subtotal column ---
            const tdFourth = document.createElement('td');
            const subTotalWrapper = document.createElement('div');
            subTotalWrapper.className = 'sub-total';
            subTotalWrapper.textContent = `$${product.price}`;
            subTotalWrapper.dataset.value = product.price;
            tdFourth.append(subTotalWrapper);

            // Append all tds
            tr.append(tdFirst, tdSecond, tdThird, tdFourth);
            target.insertBefore(tr, totalRow);
        });

        updateCartTotal();
    }
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    fetchAndRenderCartItems();
});

function updateProductCount() {
    // Get products from localStorage, or an empty array if none exist
    const products = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Select the products-count span
    const countSpan = document.querySelector('.products-count');
    
    // Update the text content with the number of products
    countSpan.textContent = products.length;
}

// Call it once on page load
updateProductCount();