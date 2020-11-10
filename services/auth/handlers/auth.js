const UserValidator = require('../../../pkg/users/validator');
const UserModel = require('../../../pkg/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../../pkg/config');
const strings = require('../../../pkg/strings');
const mailer = require('../../../pkg/mailer');

const login = async (req, res) => {
    let v = await UserValidator.Validate(req.body, UserValidator.UserLoginSchema);
    if (!v) {
        console.log('validation error');
        return res.status(400).send('Bad request [invalid data]');
    }
    let user = await UserModel.GetOneByEmail(req.body.email);
    if (user) {
        let pwd = bcrypt.compareSync(req.body.password, user.password);
        if (!pwd) {
            console.log('User not found');
            res.status(403).send('Forbidden');
        } else {
            // user successfully logged in
            console.log('user successfully logged in');
            // create an object that will be put inside the jw token
            let token_payload = {
                id: user._id,
                full_name: user.full_name,
                email: user.email,
                exp: new Date().getTime() / 1000 + config.Get('server').session_length
            };
            // create the token and sign it with the jwt_key from the config
            let token = jwt.sign(token_payload, config.Get('server').jwt_key);
            res.cookie('jwt', token);
            res.status(200).send({ jwt: token });
        }
    } else {
        console.log('User not found');
        res.status(404).send('Not found');
    }
};

const refreshToken = async (req, res) => {
    let token_payload = {
        id: req.user.id,
        full_name: req.user.full_name,
        email: req.user.email,
        exp: new Date().getTime() / 1000 + config.Get('server').session_length
    };
    let token = jwt.sign(token_payload, config.Get('server').jwt_key);
    res.status(200).send({ jwt: token });
};

const logout = async (req, res) => {
    res.status(200).send('ok');
};

const forgotPassword = async (req, res) => {
    try {
        let u = await UserModel.GetOneByEmail(req.body.email);
        if (!u) {
            return res.status(404).send('Not Found');
        }
        let rh = strings.randomString(30);
        await UserModel.Update(u._id, { reset_password_hash: rh });
        await mailer.sendEmail('RESET_PASSWORD', { hash: rh }, req.body.email);
        return res.status(204).send('No Content');
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
};

const resetPassword = async (req, res) => {
    let v = await UserValidator.Validate(req.body, UserValidator.ResetPasswordSchema);
    if (!v) {
        console.log('validation error');
        return res.status(400).send('Bad request [invalid data]');
    }
    if (req.body.password === req.body.password2) {
        let password = bcrypt.hashSync(req.body.password);
        await UserModel.UpdateByResetHash(req.body.hash, { password });
        try {
            return res.status(201).send('No Content');
        } catch (err) {
            console.log(err);
            return res.status(201).send('Internal Server Error');
        }
    } else {
        return res.status(400).send('Bad request [password mismatch]');
    }
};

module.exports = {
    login,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword
};