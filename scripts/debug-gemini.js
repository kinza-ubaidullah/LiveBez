const https = require('https');

const apiKey = 'AIzaSyAGQvCIhx1OnUbi_RSuLeIEFx07EBbRzk8';
const data = JSON.stringify({
    contents: [{ parts: [{ text: 'Hello' }] }]
});

const versions = ['v1', 'v1beta'];
const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

async function test(version, model) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 4004, // This is incorrect, should be 443. Let's fix.
            path: `/${version}/models/${model}:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        // Correcting port to 443
        options.port = 443;

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                console.log(`${version} - ${model}: ${res.statusCode}`);
                if (res.statusCode !== 200) {
                    try {
                        const err = JSON.parse(body);
                        console.log(`   Error: ${err.error?.message || body.substring(0, 100)}`);
                    } catch (e) { console.log(`   Raw: ${body.substring(0, 100)}`); }
                } else {
                    console.log(`   Success!`);
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.log(`${version} - ${model}: Network Error ${e.message}`);
            resolve();
        });

        req.write(data);
        req.end();
    });
}

async function run() {
    for (const v of versions) {
        for (const m of models) {
            await test(v, m);
        }
    }
}

run();
