// Wishlist Manager
class WishlistManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateWishlistButtons();
        this.updateWishlistCount();
    }

    bindEvents() {
        // Handle wishlist toggle buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.wishlist-btn')) {
                e.preventDefault();
                const button = e.target.closest('.wishlist-btn');
                const productId = button.dataset.productId;
                this.toggleWishlist(productId, button);
            }
        });
    }

    async toggleWishlist(productId, button) {
        try {
            // Check if user is logged in
            const isLoggedIn = await this.checkLoginStatus();
            if (!isLoggedIn) {
                this.showNotification('Please log in to manage your wishlist', 'warning');
                window.location.href = '/login';
                return;
            }

            const isInWishlist = button.classList.contains('in-wishlist');
            const action = isInWishlist ? 'remove' : 'add';
            
            // Update button state immediately for better UX
            this.updateButtonState(button, !isInWishlist);
            
            const response = await fetch(`/api/wishlist/${action}/${productId}`, {
                method: isInWishlist ? 'DELETE' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                const message = isInWishlist ? 'Removed from wishlist' : 'Added to wishlist';
                this.showNotification(message, 'success');
                this.updateWishlistCount();
            } else {
                // Revert button state on error
                this.updateButtonState(button, isInWishlist);
                this.showNotification(data.message || 'Failed to update wishlist', 'error');
            }
        } catch (error) {
            console.error('Wishlist error:', error);
            // Revert button state on error
            this.updateButtonState(button, button.classList.contains('in-wishlist'));
            this.showNotification('An error occurred', 'error');
        }
    }

    updateButtonState(button, isInWishlist) {
        const icon = button.querySelector('i');
        const text = button.querySelector('.wishlist-text');
        
        if (isInWishlist) {
            button.classList.add('in-wishlist');
            icon.className = 'fas fa-heart';
            if (text) text.textContent = 'In Wishlist';
            button.title = 'Remove from wishlist';
        } else {
            button.classList.remove('in-wishlist');
            icon.className = 'far fa-heart';
            if (text) text.textContent = 'Add to Wishlist';
            button.title = 'Add to wishlist';
        }
    }

    async updateWishlistButtons() {
        try {
            const isLoggedIn = await this.checkLoginStatus();
            if (!isLoggedIn) return;

            const buttons = document.querySelectorAll('.wishlist-btn');
            
            for (const button of buttons) {
                const productId = button.dataset.productId;
                const response = await fetch(`/api/wishlist/check/${productId}`);
                const data = await response.json();
                
                if (data.success) {
                    this.updateButtonState(button, data.inWishlist);
                }
            }
        } catch (error) {
            console.error('Error updating wishlist buttons:', error);
        }
    }

    async updateWishlistCount() {
        try {
            const isLoggedIn = await this.checkLoginStatus();
            if (!isLoggedIn) return;

            const response = await fetch('/api/wishlist/count');
            const data = await response.json();
            
            if (data.success) {
                const countElements = document.querySelectorAll('.wishlist-count');
                countElements.forEach(element => {
                    element.textContent = data.count;
                    element.style.display = data.count > 0 ? 'inline' : 'none';
                });
            }
        } catch (error) {
            console.error('Error updating wishlist count:', error);
        }
    }

    async checkLoginStatus() {
        try {
            const response = await fetch('/api/auth/status');
            const data = await response.json();
            return data.isLoggedIn;
        } catch (error) {
            // If endpoint doesn't exist, check for user session indicator
            return document.querySelector('[data-user-logged-in]') !== null;
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.wishlist-notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `wishlist-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            max-width: 300px;
            ${this.getNotificationColor(type)}
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);

        // Add click to dismiss
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: 'background: linear-gradient(135deg, #28a745, #20c997);',
            error: 'background: linear-gradient(135deg, #dc3545, #e74c3c);',
            warning: 'background: linear-gradient(135deg, #ffc107, #f39c12);',
            info: 'background: linear-gradient(135deg, #17a2b8, #3498db);'
        };
        return colors[type] || colors.info;
    }

    // Method to add wishlist button to product cards
    static addWishlistButton(productId, containerSelector = '.pro') {
        const containers = document.querySelectorAll(containerSelector);
        
        containers.forEach(container => {
            const existingButton = container.querySelector('.wishlist-btn');
            if (existingButton) return; // Button already exists

            const button = document.createElement('button');
            button.className = 'wishlist-btn';
            button.dataset.productId = productId;
            button.innerHTML = `
                <i class="far fa-heart"></i>
                <span class="wishlist-text">Add to Wishlist</span>
            `;
            
            // Add styles
            button.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(255, 255, 255, 0.9);
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                z-index: 10;
            `;

            // Add hover effects
            button.addEventListener('mouseenter', () => {
                button.style.background = 'rgba(255, 255, 255, 1)';
                button.style.transform = 'scale(1.1)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.background = 'rgba(255, 255, 255, 0.9)';
                button.style.transform = 'scale(1)';
            });

            container.style.position = 'relative';
            container.appendChild(button);
        });
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .wishlist-btn {
        transition: all 0.3s ease !important;
    }

    .wishlist-btn.in-wishlist i {
        color: #dc3545 !important;
    }

    .wishlist-btn:not(.in-wishlist) i {
        color: #666 !important;
    }

    .wishlist-btn:hover {
        transform: scale(1.1) !important;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .wishlist-count {
        background: #dc3545;
        color: white;
        border-radius: 50%;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        font-weight: bold;
        min-width: 20px;
        text-align: center;
    }
`;
document.head.appendChild(style);

// Initialize wishlist manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.wishlistManager = new WishlistManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WishlistManager;
}
