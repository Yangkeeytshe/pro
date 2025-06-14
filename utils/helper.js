const hbs = require('hbs');

// Register custom helpers
hbs.registerHelper('json', function (context) {
  return JSON.stringify(context);
});

module.exports = {
  multiply: (a, b) => (a * b).toFixed(2),
  add: (a, b) => (parseFloat(a) + parseFloat(b)).toFixed(2),
  subtract: (a, b) => (parseFloat(a) - parseFloat(b)).toFixed(2),
  divide: (a, b) => (parseFloat(a) / parseFloat(b)).toFixed(2),
  eq: (a, b) => a == b,
  gt: (a, b) => a > b,
  lt: (a, b) => a < b,
  increment: value => value + 1,
  decrement: value => value - 1,

  unless: (value, options) => !value ? options.fn(this) : options.inverse(this),

  ifEquals: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  },

  range: function (start, end) {
    let range = [];
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  },

  calculateWeekly: price => (price / 10).toFixed(2),
  calculateAfterpay: price => (price / 4).toFixed(2),

  calculateTotal: cart => {
    let total = 0;
    cart.forEach(item => total += item.product_price * item.quantity);
    return total.toFixed(2);
  },

  calculateFinalTotal: function (price) {
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) return '0.00';
    const total = numericPrice < 150 ? numericPrice + 10 : numericPrice;
    return total.toFixed(2);
  },

  afterpayAmount: function (price) {
    return (price / 4).toFixed(2);
  },

  // Helper for repeating elements (like stars)
  times: function (n, options) {
    let result = '';
    for (let i = 0; i < n; i++) {
      result += options.fn(this);
    }
    return result;
  },

  // Helper for formatting currency
  currency: function (amount, currency = 'Nu') {
    return `${currency} ${parseFloat(amount).toFixed(2)}`;
  },

  // Helper for truncating text
  truncate: function (str, length = 50) {
    if (str && str.length > length) {
      return str.substring(0, length) + '...';
    }
    return str;
  },

  // Helper for checking if array/object is empty
  isEmpty: function (value) {
    if (!value) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },

  // Helper for formatting dates
  formatDate: function (date, format = 'short') {
    if (!date) return '';
    const d = new Date(date);
    if (format === 'short') {
      return d.toLocaleDateString();
    } else if (format === 'long') {
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return d.toISOString();
  },

  // Helper for generating star ratings
  starRating: function (rating, maxStars = 5) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars += '★';
    }

    if (hasHalfStar) {
      stars += '☆';
    }

    const emptyStars = maxStars - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars += '☆';
    }

    return stars;
  },
};

// Export calculation utility separately if needed
exports.calculateOrderTotals = (cart) => {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0
  );
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const shippingCost = subtotal < 150 ? 10.0 : 0.0;
  const gst = subtotal * 0.1;
  const totalAmount = subtotal + shippingCost + gst;

  return { subtotal, totalItems, shippingCost, gst, totalAmount };
};
