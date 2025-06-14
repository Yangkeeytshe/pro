// Test script to verify wishlist and logout functionality
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

// Test functions
async function testLogin() {
  console.log('🔐 Testing login functionality...');
  
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
    console.log('Login response status:', result.statusCode);
    
    // Extract session cookie
    const setCookieHeader = result.headers['set-cookie'];
    if (setCookieHeader) {
      const sessionCookie = setCookieHeader.find(cookie => cookie.startsWith('connect.sid'));
      if (sessionCookie) {
        console.log('✅ Session cookie received');
        return sessionCookie.split(';')[0]; // Return just the cookie value
      }
    }
    
    console.log('❌ No session cookie received');
    return null;
  } catch (error) {
    console.error('Login error:', error.message);
    return null;
  }
}

async function testWishlistPage(sessionCookie) {
  console.log('📋 Testing wishlist page access...');
  
  const options = {
    hostname: config.host,
    port: config.port,
    path: '/wishlist',
    method: 'GET',
    headers: {
      'Cookie': sessionCookie
    }
  };

  try {
    const result = await makeRequest(options);
    console.log('Wishlist page status:', result.statusCode);
    
    if (result.statusCode === 200) {
      console.log('✅ Wishlist page accessible');
      return true;
    } else {
      console.log('❌ Wishlist page not accessible');
      return false;
    }
  } catch (error) {
    console.error('Wishlist page error:', error.message);
    return false;
  }
}

async function testAddToWishlist(sessionCookie) {
  console.log('❤️ Testing add to wishlist...');
  
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
    console.log('Add to wishlist status:', result.statusCode);
    console.log('Response:', result.data);
    
    if (result.statusCode === 200) {
      const data = JSON.parse(result.data);
      if (data.success) {
        console.log('✅ Product added to wishlist successfully');
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

async function testLogout(sessionCookie) {
  console.log('🚪 Testing logout functionality...');
  
  const options = {
    hostname: config.host,
    port: config.port,
    path: '/logout',
    method: 'GET',
    headers: {
      'Cookie': sessionCookie
    }
  };

  try {
    const result = await makeRequest(options);
    console.log('Logout status:', result.statusCode);
    
    if (result.statusCode === 302) { // Redirect expected
      console.log('✅ Logout successful (redirect received)');
      return true;
    } else {
      console.log('❌ Logout failed');
      return false;
    }
  } catch (error) {
    console.error('Logout error:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting functionality tests...\n');
  
  try {
    // Test 1: Login
    const sessionCookie = await testLogin();
    if (!sessionCookie) {
      console.log('❌ Cannot proceed without valid session');
      return;
    }
    
    console.log('');
    
    // Test 2: Access wishlist page
    await testWishlistPage(sessionCookie);
    console.log('');
    
    // Test 3: Add to wishlist
    await testAddToWishlist(sessionCookie);
    console.log('');
    
    // Test 4: Test logout
    await testLogout(sessionCookie);
    console.log('');
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('Test suite error:', error);
  }
}

// Run tests
runTests();
