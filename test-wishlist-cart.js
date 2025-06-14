// Test wishlist to cart functionality
const http = require('http');
const querystring = require('querystring');

// Test configuration
const config = {
  host: 'localhost',
  port: 3001,
  testUser: {
    email: 'test@wishlist.com',
    password: 'test123'
  },
  testProductId: 1
};

// Helper function to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function login() {
  console.log('🔐 Logging in...');
  
  const postData = querystring.stringify({
    email: config.testUser.email,
    password: config.testUser.password
  });

  const options = {
    hostname: config.host,
    port: config.port,
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  try {
    const result = await makeRequest(options, postData);
    const setCookieHeader = result.headers['set-cookie'];
    if (setCookieHeader) {
      const sessionCookie = setCookieHeader.find(cookie => cookie.startsWith('connect.sid'));
      if (sessionCookie) {
        console.log('✅ Login successful');
        return sessionCookie.split(';')[0];
      }
    }
    return null;
  } catch (error) {
    console.error('Login error:', error.message);
    return null;
  }
}

async function addToWishlist(sessionCookie) {
  console.log('❤️ Adding product to wishlist...');
  
  const options = {
    hostname: config.host,
    port: config.port,
    path: `/api/wishlist/add/${config.testProductId}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
    }
  };

  try {
    const result = await makeRequest(options);
    if (result.statusCode === 200) {
      const data = JSON.parse(result.data);
      if (data.success) {
        console.log('✅ Product added to wishlist');
        return true;
      }
    }
    console.log('❌ Failed to add to wishlist');
    return false;
  } catch (error) {
    console.error('Add to wishlist error:', error.message);
    return false;
  }
}

async function testAddToCartFromWishlist(sessionCookie) {
  console.log('🛒 Testing add to cart from wishlist...');
  
  // Test the cart API endpoint that wishlist page uses
  const options = {
    hostname: config.host,
    port: config.port,
    path: `/api/cart/quick-add/${config.testProductId}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
    },
    body: JSON.stringify({ quantity: 1 })
  };

  try {
    const result = await makeRequest(options, JSON.stringify({ quantity: 1 }));
    console.log('Add to cart status:', result.statusCode);
    console.log('Response:', result.data);
    
    if (result.statusCode === 200) {
      const data = JSON.parse(result.data);
      if (data.success) {
        console.log('✅ Product added to cart from wishlist successfully');
        return true;
      }
    }
    
    console.log('❌ Failed to add to cart from wishlist');
    return false;
  } catch (error) {
    console.error('Add to cart error:', error.message);
    return false;
  }
}

async function testRemoveFromWishlist(sessionCookie) {
  console.log('🗑️ Testing remove from wishlist...');
  
  const options = {
    hostname: config.host,
    port: config.port,
    path: `/api/wishlist/remove/${config.testProductId}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
    }
  };

  try {
    const result = await makeRequest(options);
    console.log('Remove from wishlist status:', result.statusCode);
    console.log('Response:', result.data);
    
    if (result.statusCode === 200) {
      const data = JSON.parse(result.data);
      if (data.success) {
        console.log('✅ Product removed from wishlist successfully');
        return true;
      }
    }
    
    console.log('❌ Failed to remove from wishlist');
    return false;
  } catch (error) {
    console.error('Remove from wishlist error:', error.message);
    return false;
  }
}

async function testCartCount(sessionCookie) {
  console.log('📊 Testing cart count...');
  
  const options = {
    hostname: config.host,
    port: config.port,
    path: '/api/cart/count',
    method: 'GET',
    headers: {
      'Cookie': sessionCookie
    }
  };

  try {
    const result = await makeRequest(options);
    if (result.statusCode === 200) {
      const data = JSON.parse(result.data);
      console.log('✅ Cart count:', data.count || 'N/A');
      return true;
    }
    console.log('❌ Failed to get cart count');
    return false;
  } catch (error) {
    console.error('Cart count error:', error.message);
    return false;
  }
}

// Main test function
async function runWishlistCartTests() {
  console.log('🧪 Starting wishlist-cart integration tests...\n');
  
  try {
    // Step 1: Login
    const sessionCookie = await login();
    if (!sessionCookie) {
      console.log('❌ Cannot proceed without valid session');
      return;
    }
    console.log('');
    
    // Step 2: Add to wishlist
    await addToWishlist(sessionCookie);
    console.log('');
    
    // Step 3: Test add to cart from wishlist
    await testAddToCartFromWishlist(sessionCookie);
    console.log('');
    
    // Step 4: Test cart count
    await testCartCount(sessionCookie);
    console.log('');
    
    // Step 5: Test remove from wishlist
    await testRemoveFromWishlist(sessionCookie);
    console.log('');
    
    console.log('🎉 All wishlist-cart tests completed!');
    
  } catch (error) {
    console.error('Test suite error:', error);
  }
}

// Run tests
runWishlistCartTests();
