
const http = require('http');

const PORT = 4005;
const BASE_URL = `http://localhost:${PORT}`;

const routes = [
    '/',
    '/en',
    '/fa',
    '/ar',
    '/admin',
    '/admin/dashboard',
    '/en/leagues',
    '/en/bookmakers'
];

async function checkRoute(route) {
    return new Promise((resolve) => {
        http.get(`${BASE_URL}${route}`, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({
                    route,
                    status: res.statusCode,
                    title: data.match(/<title>(.*?)<\/title>/)?.[1] || 'No Title'
                });
            });
        }).on('error', (err) => {
            resolve({ route, status: 'ERROR', error: err.message });
        });
    });
}

async function run() {
    console.log(`Starting smoke test on ${BASE_URL}...\n`);
    for (const route of routes) {
        const result = await checkRoute(route);
        const statusColor = result.status === 200 || result.status === 307 ? '✓' : '✗';
        console.log(`${statusColor} ${route.padEnd(20)} | Status: ${result.status} | Title: ${result.title}`);
    }
}

run();
