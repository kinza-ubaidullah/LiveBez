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
            try {
                const data = JSON.parse(body);
                if (data.models) {
                    console.log('Available Models:');
                    data.models.forEach(m => console.log(` - ${m.name}`));
                } else {
                    console.log('No models found or error:', body);
                }
            } catch (e) { console.log('Parse error:', body); }
        });
    });

    req.on('error', (e) => console.error(e));
    req.end();
}

listModels();
