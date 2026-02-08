const https = require('https');
const apiKey = 'AIzaSyAGQvCIhx1OnUbi_RSuLeIEFx07EBbRzk8';

async function test(model) {
    const data = JSON.stringify({ contents: [{ parts: [{ text: 'Hello' }] }] });
    return new Promise((resolve) => {
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                console.log(`${model}: ${res.statusCode}`);
                if (res.statusCode === 200) console.log('   Success!');
                else console.log(`   Error: ${body.substring(0, 100)}`);
                resolve();
            });
        });
        req.write(data);
        req.end();
    });
}

async function run() {
    await test('gemini-2.5-flash');
    await test('gemini-2.0-flash-exp');
}
run();
