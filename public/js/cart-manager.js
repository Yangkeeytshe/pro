/**
 * Cart Manager - Handles cart operations and UI updates
 */
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.cartDropdown = document.getElementById('cart-dropdown');
        this.cartToggle = document.getElementById('cart-toggle');
        this.cartCount = document.getElementById('cart-count');
        this.cartTotal = document.getElementById('cart-total');
        this.cartItems = document.getElementById('cart-dropdown-items');
        
        this.init();
    }

    init() {
        this.updateCartUI();
        this.bindEvents();
    }

    bindEvents() {
        // Toggle cart dropdown
        if (this.cartToggle) {
            this.cartToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCartDropdown();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.cart-dropdown-container')) {
                this.hideCartDropdown();
            }
        });

        // Bind add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart')) {
                e.preventDefault();
                const button = e.target.closest('.add-to-cart');
                const productId = button.dataset.productId;
                const productName = button.dataset.productName;
                const productPrice = parseFloat(button.dataset.productPrice);
                const productImage = button.dataset.productImage;
                
                this.addToCart(productId, productName, productPrice, productImage);
            }
        });

        // Bind remove from cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cart-item-remove')) {
                e.preventDefault();
                const button = e.target.closest('.cart-item-remove');
                const productId = button.dataset.productId;
                this.removeFromCart(productId);
            }
        });
    }

    loadCart() {
        const saved = localStorage.getItem('momsart_cart');
        return saved ? JSON.parse(saved) : {};
    }

    saveCart() {
        localStorage.setItem('momsart_cart', JSON.stringify(this.cart));
    }

    addToCart(productId, productName, productPrice, productImage, quantity = 1) {
        if (this.cart[productId]) {
            this.cart[productId].quantity += quantity;
        } else {
            this.cart[productId] = {
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: quantity
            };
        }

        this.saveCart();
        this.updateCartUI();
        this.showNotification(`${productName} added to cart!`, 'success');
        
        // Send to server
        this.syncWithServer('add', productId, quantity);
    }

    removeFromCart(productId) {
        if (this.cart[productId]) {
            const productName = this.cart[productId].name;
            delete this.cart[productId];
            this.saveCart();
            this.updateCartUI();
            this.showNotification(`${productName} removed from cart!`, 'info');
            
            // Send to server
            this.syncWithServer('remove', productId);
        }
    }

    updateQuantity(productId, quantity) {
        if (this.cart[productId] && quantity > 0) {
            this.cart[productId].quantity = quantity;
            this.saveCart();
            this.updateCartUI();
            
            // Send to server
            this.syncWithServer('update', productId, quantity);
        } else if (quantity <= 0) {
            this.removeFromCart(productId);
        }
    }

    getCartCount() {
        return Object.values(this.cart).reduce((total, item) => total + item.quantity, 0);
    }

    getCartTotal() {
        return Object.values(this.cart).reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    updateCartUI() {
        // Update cart count
        const count = this.getCartCount();
        if (this.cartCount) {
            this.cartCount.textContent = count;
            this.cartCount.style.display = count > 0 ? 'flex' : 'none';
        }

        // Update cart total
        const total = this.getCartTotal();
        if (this.cartTotal) {
            this.cartTotal.textContent = total.toFixed(2);
        }

        // Update cart items
        this.renderCartItems();
    }

    renderCartItems() {
        if (!this.cartItems) return;

        const items = Object.values(this.cart);
        
        if (items.length === 0) {
            this.cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            return;
        }

        const itemsHTML = items.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
                </div>
                <button class="cart-item-remove" data-product-id="${item.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        this.cartItems.innerHTML = itemsHTML;
    }

    toggleCartDropdown() {
        if (this.cartDropdown) {
            this.cartDropdown.classList.toggle('show');
        }
    }

    hideCartDropdown() {
        if (this.cartDropdown) {
            this.cartDropdown.classList.remove('show');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    async syncWithServer(action, productId, quantity = 1) {
        try {
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action,
                    productId,
                    quantity
                })
            });

            if (!response.ok) {
                console.warn('Failed to sync cart with server');
            }
        } catch (error) {
            console.warn('Cart sync error:', error);
        }
    }
}

// Initialize cart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});
