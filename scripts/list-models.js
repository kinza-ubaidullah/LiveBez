const https = require('https');
const apiKey = 'AIzaSyAGQvCIhx1OnUbi_RSuLeIEFx07EBbRzk8';

function listModels() {
    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models?key=${apiKey}`,
        method: 'GET'
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (d) => body += d);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            console.log(body);
        });
    });

    req.on('error', (e) => {
        console.error(e);
    });

    req.end();
}

listModels();
