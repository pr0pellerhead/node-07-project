require('../../pkg/db');

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('express-jwt');
const config = require('../../pkg/config')
const Auth = require('./handlers/auth');

const api = express();

api.use((req, res, next) => {
    console.log(req.baseUrl);
    console.log(req.url);
    next();
});

api.use(bodyParser.json());
// json web token middleware checks if a jw token was sent with 
// the request in the Authorization header
api.use(jwt({
        secret: config.Get('server').jwt_key, // the secret key that we have in the config.json
        algorithms: ['HS256'] // algo used for (un)signing the token
    }).unless({
        path: [ // list of routes that are not checked for jw token
            { url: '/login', methods: ['POST'] },
            { url: '/forgot-password', methods: ['POST'] },
            { url: '/reset-password', methods: ['POST'] },
        ]
    })
);

api.post('/login', Auth.login);
api.get('/refresh-token', Auth.refreshToken);
api.get('/logout', Auth.logout);

api.post('/forgot-password', Auth.forgotPassword);
api.post('/reset-password', Auth.resetPassword);

// check if the output is "unauthorized error"
// and if so, show the "invalid token..." text
api.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('Bad token...');
    }
});

api.listen(config.Get('services').auth.port, err => {
    if (err) {
        return console.error(err);
    }
    console.log(`Server started on port ${config.Get('services').auth.port}`);
});

