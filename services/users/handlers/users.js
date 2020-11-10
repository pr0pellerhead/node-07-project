const UserModel = require('../../../pkg/users');
const UserValidator = require('../../../pkg/users/validator');
const bcrypt = require('bcryptjs');
const mailer = require('../../../pkg/mailer');
const strings = require('../../../pkg/strings');

const create = async (req, res) => {
    // validate user sent input
    let v = await UserValidator.Validate(req.body, UserValidator.UserCreationSchema);
    if (!v) {
        console.log('validation error');
        return res.status(400).send('Bad request [invalid data]');
    }
    // check if the two passwords are the same
    if (req.body.password !== req.body.password2) {
        console.log('validation error');
        return res.status(400).send('Bad request [passwords missmatch]');
    }
    // check if user with same email already exists
    let u = await UserModel.GetOneByEmail(req.body.email);
    if (u != null) {
        console.log('user validation error');
        return res.status(400).send('Bad request [user exists]');
    }
    // bojan -> o2u3xpuqoxubpoqubcp8 = hashing (bcrypt)
    // bojan <-> osiu1hpd9ub3pxnp = encrypting
    // hash the password
    req.body.password = bcrypt.hashSync(req.body.password);
    try {
        // save user data into database
        let userData = {
            ...req.body,
            register_hash: strings.randomString(20),
            active: false
        };
        let out = await UserModel.Create(userData);
        out.__v = null;
        out.password = null;

        // send the welcome email
        let mout = await mailer.sendEmail('WELCOME', { name: req.body.full_name, hash: userData.register_hash }, req.body.email);
        console.log(mout);

        return res.status(201).send(out);
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal server error');
    }
};

const getAll = async (req, res) => {
    try {
        let us = await UserModel.GetAll();
        return res.status(200).send(us);
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal server error');
    }
};

const getOne = async (req, res) => {
    try {
        let u = await UserModel.GetOne(req.params.id);
        if (!u) {
            return res.status(404).send('Not found');
        }
        return res.status(200).send(us);
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal server error');
    }
};

const update = async (req, res) => {
    try {
        await UserModel.Update(req.params.id, req.body);
        return res.status(204).send('No content');
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal server error');
    }
};

const remove = async (req, res) => {
    try {
        await UserModel.Remove(req.params.id);
        return res.status(204).send('No content');
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal server error');
    }
};

const confirm = async (req, res) => {
    try {
        let up = await UserModel.UpdateByRegisterHash(req.body.hash, { active: true });
        if (!up.n) {
            console.log('Cannot activate user. Not found!');
            return res.status(404).send('Not Found');
        }
        return res.status(201).send('No Content');
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    create,
    getAll,
    getOne,
    update,
    remove,
    confirm
};


// encrypting
// 2 + 2 = 4 <-> 4 - 2 = 2
// 3 + 6 = 9 <-> 9 - 6 = 3

// hashing
// 2 + a = b