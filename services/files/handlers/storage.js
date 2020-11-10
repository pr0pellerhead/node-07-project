const config = require('../../../pkg/config');

const save = (req, res) => {
    // check if the uploaded filetype is allowed
    if (!config.Get('storage').allowed_types.includes(req.files.document.mimetype)) {
        return res.status(400).send('bad file type');
    }
    let file = `${makeid(10)}_${req.files.document.name}`;
    let savepath = `${__dirname}/../../../../${config.Get('storage').dir}${req.user.id}_${file}`;
    req.files.document.mv(savepath);
    res.status(200).send({ file: file });
};

const retrieve = (req, res) => {
    let filepath = `${__dirname}/../../../../${config.Get('storage').dir}${req.user.id}_${req.params.file}`;
    let dld = req.params.file.slice(11);
    res.download(filepath, dld);
};

const makeid = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = {
    save,
    retrieve
};