const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';

// Test data
const testUserId = 'test-user-123';
let notificationId = '';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testLogin() {
  console.log('\n=== Testing Login ===');
  try {
    const response = await axios.get(`${BASE_URL}/login/${testUserId}`);
    authToken = response.data.token;
    console.log('✅ Login successful');
    console.log('Token:', authToken.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testHealthCheck() {
  console.log('\n=== Testing Health Check ===');
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log('✅ Health check successful');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.response?.data || error.message);
    return false;
  }
}

async function testAddNotification() {
  console.log('\n=== Testing Add Notification ===');
  try {
    const notificationData = {
      userId: testUserId,
      type: 'question_answered',
      message: 'Your question about JavaScript has been answered',
      actor_user_id: 'user-456',
      question_id: 'q-789',
      answer_id: 'a-101',
      comment_id: null
    };

    const response = await axios.post(
      `${BASE_URL}/notification/add`,
      notificationData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    notificationId = response.data.notificationId;
    console.log('✅ Add notification successful');
    console.log('Response:', response.data);
    console.log('Notification ID:', notificationId);
    return true;
  } catch (error) {
    console.log('❌ Add notification failed:', error.response?.data || error.message);
    return false;
  }
}

async function testAddInvalidNotification() {
  console.log('\n=== Testing Add Invalid Notification ===');
  try {
    const invalidData = {
      // Missing required fields
      type: 'test'
    };

    const response = await axios.post(
      `${BASE_URL}/notification/add`,
      invalidData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('❌ Should have failed but succeeded:', response.data);
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid notification correctly rejected');
      console.log('Error:', error.response.data);
      return true;
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testGetNotifications() {
  console.log('\n=== Testing Get Notifications ===');
  try {
    const response = await axios.get(
      `${BASE_URL}/notification/get`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    console.log('✅ Get notifications successful');
    console.log('Response:', response.data);
    console.log('Number of notifications:', response.data.count);
    return true;
  } catch (error) {
    console.log('❌ Get notifications failed:', error.response?.data || error.message);
    return false;
  }
}

async function testMarkAsRead() {
  console.log('\n=== Testing Mark Notification as Read ===');
  try {
    const response = await axios.patch(
      `${BASE_URL}/notification/read/${notificationId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    console.log('✅ Mark as read successful');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Mark as read failed:', error.response?.data || error.message);
    return false;
  }
}

async function testDeleteNotification() {
  console.log('\n=== Testing Delete Notification ===');
  try {
    const response = await axios.delete(
      `${BASE_URL}/notification/delete/${notificationId}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    console.log('✅ Delete notification successful');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Delete notification failed:', error.response?.data || error.message);
    return false;
  }
}

async function testUnauthorizedAccess() {
  console.log('\n=== Testing Unauthorized Access ===');
  try {
    const response = await axios.get(`${BASE_URL}/notification/get`);
    console.log('❌ Should have failed but succeeded:', response.data);
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Unauthorized access correctly blocked');
      console.log('Error:', error.response.data);
      return true;
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testInvalidToken() {
  console.log('\n=== Testing Invalid Token ===');
  try {
    const response = await axios.get(
      `${BASE_URL}/notification/get`,
      {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      }
    );
    console.log('❌ Should have failed but succeeded:', response.data);
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ Invalid token correctly rejected');
      console.log('Error:', error.response.data);
      return true;
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting Notification Server Tests');
  console.log('=====================================');

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Login', fn: testLogin },
    { name: 'Unauthorized Access', fn: testUnauthorizedAccess },
    { name: 'Invalid Token', fn: testInvalidToken },
    { name: 'Add Notification', fn: testAddNotification },
    { name: 'Add Invalid Notification', fn: testAddInvalidNotification },
    { name: 'Get Notifications', fn: testGetNotifications },
    { name: 'Mark as Read', fn: testMarkAsRead },
    { name: 'Delete Notification', fn: testDeleteNotification }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ Test ${test.name} threw an error:`, error.message);
      failed++;
    }

    // Small delay between tests
    await sleep(100);
  }

  console.log('\n=====================================');
  console.log('📊 Test Results Summary');
  console.log('=====================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }
}

// Check if server is running before starting tests
async function checkServer() {
  try {
    await axios.get(BASE_URL, { timeout: 5000 });
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('Make sure the server is started with: npm run dev');
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  } else {
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

main().catch(console.error);
