require('../../pkg/db');

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('express-jwt');
const config = require('../../pkg/config');
const Users = require('./handlers/users');

const api = express();

api.use(bodyParser.json());
// json web token middleware checks if a jw token was sent with 
// the request in the Authorization header
api.use(jwt({
    secret: config.Get('server').jwt_key, // the secret key that we have in the config.json
    algorithms: ['HS256'] // algo used for (un)signing the token
}).unless({
    path: [ // list of routes that are not checked for jw token
        { url: '/api/v1/users', methods: ['POST', 'GET'] },
        { url: '/api/v1/users/confirm', methods: ['POST'] },
        // { url: /\/api\/v1\/users\/.*/, methods: ['GET'] },
    ]
})
);

api.post('/api/v1/users', Users.create);
api.get('/api/v1/users', Users.getAll);
api.get('/api/v1/users/:id', Users.getOne);
api.put('/api/v1/users/:id', Users.update);
api.delete('/api/v1/users/:id', Users.remove);
api.post('/api/v1/users/confirm', Users.confirm);

// check if the output is "unauthorized error"
// and if so, show the "invalid token..." text
api.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('Bad token...');
    }
});

api.listen(config.Get('services').users.port, err => {
    if (err) {
        return console.error(err);
    }
    console.log(`Server started on port ${config.Get('services').users.port}`);
});

