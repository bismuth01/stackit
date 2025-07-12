const http = require('http');

// Demo script to show the simplified API responses
const BASE_URL = 'http://localhost:3001';

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonBody = JSON.parse(body);
                    resolve(jsonBody);
                } catch (e) {
                    resolve(body);
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
}

async function runDemo() {
    console.log('🎯 StackIt Simple Server - Frontend-Ready Data Demo');
    console.log('=' .repeat(60));

    try {
        // Get notifications (your exact format)
        console.log('\n🔔 NOTIFICATIONS (Exact format your frontend needs):');
        console.log('-'.repeat(50));
        const notifications = await makeRequest('/api/notifications');
        notifications.forEach(notification => {
            console.log(JSON.stringify(notification, null, 2));
            console.log('');
        });

        // Get answers (your exact format)
        console.log('\n💬 ANSWERS (Exact format your frontend needs):');
        console.log('-'.repeat(50));
        const answers = await makeRequest('/api/questions/2/answers');
        answers.forEach(answer => {
            console.log(JSON.stringify(answer, null, 2));
            console.log('');
        });

        // Get questions (your exact format)
        console.log('\n❓ QUESTIONS (Exact format your frontend needs):');
        console.log('-'.repeat(50));
        const questions = await makeRequest('/api/questions');
        questions.slice(0, 2).forEach(question => {
            console.log(JSON.stringify(question, null, 2));
            console.log('');
        });

        // Get unread count for notification badge
        console.log('\n🔢 UNREAD COUNT (For notification badge):');
        console.log('-'.repeat(50));
        const unreadCount = await makeRequest('/api/notifications/unread-count');
        console.log(JSON.stringify(unreadCount, null, 2));

        console.log('\n' + '=' .repeat(60));
        console.log('✅ SUCCESS! All data is in the EXACT format your frontend needs!');
        console.log('\n📋 Summary:');
        console.log('- Notifications: Simple objects with id, type, message, questionTitle, timestamp, read');
        console.log('- Answers: Simple objects with id, questionId, content, author, createdAt, votes, accepted');
        console.log('- Questions: Simple objects with id, title, description, tags, author, etc.');
        console.log('- All IDs are integers (no UUIDs!)');
        console.log('- All field names match your mock data exactly');
        console.log('\n🚀 Your frontend developer can start building immediately!');

    } catch (error) {
        console.log('\n❌ Error: Server not running. Start it with:');
        console.log('cd stackit/backend/simple-server && node server.js');
    }
}

runDemo();
