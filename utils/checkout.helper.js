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
hbs.registerHelper('json', function(context) {
  return JSON.stringify(context);
});
