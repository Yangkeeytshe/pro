const getCartItemsFromCartObject = (cart) => {
  return new Promise((resolve, reject) => {
    const productIds = Object.keys(cart);
    if (productIds.length === 0) return resolve([]); // No products in cart

    // Prepare placeholders for SQL IN clause
    const placeholders = productIds.map(() => '?').join(',');
    const sql = `SELECT id, name, price, image FROM products WHERE id IN (${placeholders})`;

    db.query(sql, productIds, (err, products) => {
      if (err) return reject(err);

      // Map DB results to cart items with quantity from session cart
      const items = products.map(p => ({
        product_id: p.id,
        product_name: p.name,
        product_price: p.price,
        image: p.image,
        quantity: cart[p.id]
      }));

      resolve(items);
    });
  });
};

