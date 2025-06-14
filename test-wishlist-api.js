// Test script for wishlist API
const http = require('http');

// Test data
const testData = {
  productId: 1,
  userId: 19 // From the session we saw in the logs
};

// Function to make HTTP request
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function testWishlistAPI() {
  console.log('🧪 Testing Wishlist API...\n');
  
  try {
    // Test 1: Check authentication status
    console.log('1️⃣ Testing authentication status...');
    const authOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/status',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const authResult = await makeRequest(authOptions);
    console.log('Auth Status:', authResult.statusCode, authResult.data);
    console.log('');
    
    // Test 2: Try to add to wishlist (without session)
    console.log('2️⃣ Testing add to wishlist (without session)...');
    const addOptions = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/wishlist/add/${testData.productId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const addResult = await makeRequest(addOptions);
    console.log('Add to Wishlist:', addResult.statusCode, addResult.data);
    console.log('');
    
    // Test 3: Check if product exists
    console.log('3️⃣ Testing if product exists...');
    const productOptions = {
      hostname: 'localhost',
      port: 3001,
      path: `/product/${testData.productId}`,
      method: 'GET'
    };
    
    const productResult = await makeRequest(productOptions);
    console.log('Product Check:', productResult.statusCode);
    console.log('');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWishlistAPI();
