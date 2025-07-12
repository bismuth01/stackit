const http = require('http');

// Simple test client for the StackIt Simple Server
const BASE_URL = 'http://localhost:3001';

function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonBody = JSON.parse(body);
                    resolve({ status: res.statusCode, data: jsonBody });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function runTests() {
    console.log('🧪 Starting StackIt Simple Server Tests');
    console.log('=' .repeat(50));

    try {
        // Test 1: Health Check
        console.log('\n1. Testing Health Check...');
        const health = await makeRequest('/api/health');
        console.log(`   Status: ${health.status}`);
        console.log(`   Response:`, health.data);

        if (health.status === 200) {
            console.log('   ✅ Health check passed');
        } else {
            console.log('   ❌ Health check failed');
        }

        // Test 2: Get All Questions
        console.log('\n2. Testing Get All Questions...');
        const questions = await makeRequest('/api/questions');
        console.log(`   Status: ${questions.status}`);
        console.log(`   Found ${questions.data.length} questions`);

        if (questions.status === 200 && questions.data.length > 0) {
            console.log('   ✅ Questions endpoint working');
            console.log(`   Sample question: "${questions.data[0].title}"`);
        } else {
            console.log('   ❌ Questions endpoint failed');
        }

        // Test 3: Get Single Question
        console.log('\n3. Testing Get Single Question...');
        const question = await makeRequest('/api/questions/1');
        console.log(`   Status: ${question.status}`);

        if (question.status === 200) {
            console.log('   ✅ Single question endpoint working');
            console.log(`   Question: "${question.data.title}"`);
            console.log(`   Views: ${question.data.views}`);
        } else {
            console.log('   ❌ Single question endpoint failed');
        }

        // Test 4: Get Answers for Question
        console.log('\n4. Testing Get Answers...');
        const answers = await makeRequest('/api/questions/1/answers');
        console.log(`   Status: ${answers.status}`);
        console.log(`   Found ${answers.data.length} answers`);

        if (answers.status === 200) {
            console.log('   ✅ Answers endpoint working');
            if (answers.data.length > 0) {
                console.log(`   Sample answer by: ${answers.data[0].author}`);
            }
        } else {
            console.log('   ❌ Answers endpoint failed');
        }

        // Test 5: Get Notifications
        console.log('\n5. Testing Get Notifications...');
        const notifications = await makeRequest('/api/notifications');
        console.log(`   Status: ${notifications.status}`);
        console.log(`   Found ${notifications.data.length} notifications`);

        if (notifications.status === 200) {
            console.log('   ✅ Notifications endpoint working');
            if (notifications.data.length > 0) {
                console.log(`   Sample notification: "${notifications.data[0].message}"`);
                console.log(`   Type: ${notifications.data[0].type}`);
                console.log(`   Read: ${notifications.data[0].read}`);
            }
        } else {
            console.log('   ❌ Notifications endpoint failed');
        }

        // Test 6: Get Unread Notification Count
        console.log('\n6. Testing Unread Notification Count...');
        const unreadCount = await makeRequest('/api/notifications/unread-count');
        console.log(`   Status: ${unreadCount.status}`);

        if (unreadCount.status === 200) {
            console.log('   ✅ Unread count endpoint working');
            console.log(`   Unread notifications: ${unreadCount.data.count}`);
        } else {
            console.log('   ❌ Unread count endpoint failed');
        }

        // Test 7: Get Tags
        console.log('\n7. Testing Get Tags...');
        const tags = await makeRequest('/api/tags');
        console.log(`   Status: ${tags.status}`);
        console.log(`   Found ${tags.data.length} tags`);

        if (tags.status === 200) {
            console.log('   ✅ Tags endpoint working');
            if (tags.data.length > 0) {
                console.log(`   Popular tag: ${tags.data[0].name} (${tags.data[0].count} uses)`);
            }
        } else {
            console.log('   ❌ Tags endpoint failed');
        }

        // Test 8: Search
        console.log('\n8. Testing Search...');
        const search = await makeRequest('/api/search?q=javascript');
        console.log(`   Status: ${search.status}`);
        console.log(`   Found ${search.data.length} results for "javascript"`);

        if (search.status === 200) {
            console.log('   ✅ Search endpoint working');
            if (search.data.length > 0) {
                console.log(`   Result: "${search.data[0].title}"`);
            }
        } else {
            console.log('   ❌ Search endpoint failed');
        }

        // Test 9: Create New Question
        console.log('\n9. Testing Create New Question...');
        const newQuestion = {
            title: 'Test Question from API Test',
            description: 'This is a test question created by the automated test script.',
            tags: ['test', 'api'],
            author: 'testUser'
        };

        const createResponse = await makeRequest('/api/questions', 'POST', newQuestion);
        console.log(`   Status: ${createResponse.status}`);

        if (createResponse.status === 201) {
            console.log('   ✅ Create question endpoint working');
            console.log(`   Created question ID: ${createResponse.data.id}`);
            console.log(`   Title: "${createResponse.data.title}"`);
        } else {
            console.log('   ❌ Create question endpoint failed');
        }

        // Test 10: Vote on Question
        console.log('\n10. Testing Vote on Question...');
        const voteResponse = await makeRequest('/api/questions/1/vote', 'POST', { type: 'up' });
        console.log(`   Status: ${voteResponse.status}`);

        if (voteResponse.status === 200) {
            console.log('   ✅ Vote endpoint working');
            console.log(`   New vote count: ${voteResponse.data.votes}`);
        } else {
            console.log('   ❌ Vote endpoint failed');
        }

        // Test Data Structure Validation
        console.log('\n11. Validating Data Structures...');

        // Check notification structure matches mock data
        const sampleNotification = notifications.data[0];
        const expectedNotificationFields = ['id', 'type', 'message', 'questionTitle', 'timestamp', 'read'];
        const notificationValid = expectedNotificationFields.every(field =>
            sampleNotification && sampleNotification.hasOwnProperty(field)
        );

        if (notificationValid) {
            console.log('   ✅ Notification structure matches frontend requirements');
        } else {
            console.log('   ❌ Notification structure invalid');
        }

        // Check answer structure matches mock data
        const sampleAnswer = answers.data[0];
        const expectedAnswerFields = ['id', 'questionId', 'content', 'author', 'createdAt', 'votes', 'accepted'];
        const answerValid = expectedAnswerFields.every(field =>
            sampleAnswer && sampleAnswer.hasOwnProperty(field)
        );

        if (answerValid) {
            console.log('   ✅ Answer structure matches frontend requirements');
        } else {
            console.log('   ❌ Answer structure invalid');
        }

        // Check question structure matches mock data
        const sampleQuestion = questions.data[0];
        const expectedQuestionFields = ['id', 'title', 'description', 'tags', 'author', 'createdAt', 'votes', 'answers', 'views', 'accepted'];
        const questionValid = expectedQuestionFields.every(field =>
            sampleQuestion && sampleQuestion.hasOwnProperty(field)
        );

        if (questionValid) {
            console.log('   ✅ Question structure matches frontend requirements');
        } else {
            console.log('   ❌ Question structure invalid');
        }

        console.log('\n' + '=' .repeat(50));
        console.log('🎉 Test Suite Completed!');
        console.log('\nThe server is providing data in the exact format your frontend developer needs:');
        console.log('\n📋 Sample Data Structures:');

        console.log('\n🔔 Notification:');
        console.log(JSON.stringify(sampleNotification, null, 2));

        console.log('\n💬 Answer:');
        console.log(JSON.stringify(sampleAnswer, null, 2));

        console.log('\n❓ Question:');
        console.log(JSON.stringify(sampleQuestion, null, 2));

    } catch (error) {
        console.error('\n❌ Test failed with error:', error.message);
        console.log('\nMake sure the server is running with: npm start');
    }
}

// Run tests if the server is available
console.log('Checking if server is running...');
makeRequest('/api/health')
    .then(() => {
        runTests();
    })
    .catch(() => {
        console.log('❌ Server is not running!');
        console.log('\nTo start the server:');
        console.log('1. cd stackit/backend/simple-server');
        console.log('2. npm install');
        console.log('3. npm start');
        console.log('4. Then run: npm test');
    });
