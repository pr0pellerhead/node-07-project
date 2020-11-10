const proxy = require('express-http-proxy');
const express = require('express');
const config = require('../../pkg/config');

const app = express();

app.use('/api/v1/users', proxy(
    'http://localhost:10001', 
    { proxyReqPathResolver: (req) => `http://localhost:10001${req.path}` }
));
app.use('/api/v1/auth', proxy(
    'http://localhost:10002', 
    { proxyReqPathResolver: (req) => `http://localhost:10002${req.path}` }
));
app.use('/api/v1/files', proxy(
    'http://localhost:10003', 
    { proxyReqPathResolver: (req) => `http://localhost:10003${req.path}` }
));

app.use('/', proxy('localhost:3000'));

let port = process.env.PORT || config.Get('services').proxy.port;

app.listen(port, err => {
    if (err) {
        return console.error(err);
    }
    console.log(`Server started on port ${port}`);
});