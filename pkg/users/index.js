const mongoose = require('mongoose');

const User = mongoose.model(
    'User',
    {
        full_name: String,
        email: String,
        password: String,
        birthday: Date,
        phone: String,
        register_hash: String,
        reset_password_hash: String,
        active: Boolean
    },
    'users'
);

const Create = (data) => {
    let u = new User(data);
    return u.save();
};

const GetAll = () => {
    // return User.find({}, {password: 0}); // {password: 0} tells mongo db not to return the password field
    return User.find({}, {email: 1}); // {email: 1} tells mongo db to return ONLY the email field
};

const GetOne = (id) => {
    return User.findOne({_id: id});
};

const GetOneByEmail = (email) => {
    return User.findOne({ email: email });
};

const Update = (id, data) => {
    return User.updateOne({_id: id}, data);
};

const UpdateByResetHash = (hash, data) => {
    return User.updateOne({ reset_password_hash: hash }, data);
};

const UpdateByRegisterHash = (hash, data) => {
    return User.updateOne({ register_hash: hash }, data);
};

const Remove = (id) => {
    return User.deleteOne({_id: id});
};

module.exports = {
    Create,
    GetAll,
    GetOne,
    GetOneByEmail,
    Update,
    Remove,
    UpdateByResetHash,
    UpdateByRegisterHash
};