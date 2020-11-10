const fs = require('fs');
const mailgun = require('mailgun-js');
const config = require('../config');

let mg = mailgun({
    apiKey: config.Get('email').api_key,
    domain: config.Get('email').domain 
});

const templates = {
    WELCOME: {title: 'Welcome to our App!', tpl: 'welcome.html'},
    RESET_PASSWORD: {title: 'Reset your OurApp password', tpl: 'reset.html'},
};

const sendEmail = async (type, data, to) => {
    return new Promise(async (success, fail) => {
        let content = await parseTemplate(templates[type].tpl, data);
        var mail = {
            from: `${config.Get('email').email_name} <${config.Get('email').email_address}>`,
            to: to,
            subject: templates[type].title,
            html: content
        };
        mg.messages().send(mail, function (err, body) {
            if (err) {
                return fail(err);
            }
            return success(body);
        });
    });
};

const parseTemplate = (tpl, mailData) => {
    return new Promise((success, fail) => {
        fs.readFile(`./mail_templates/${tpl}`, 'utf8', (err, data) => {
            if(err) {
                return fail(err);
            }
            for(let i in mailData) {
                let rx = new RegExp(`\{\{${i}\}\}`, 'g'); // {{name}}
                data = data.replace(rx, mailData[i]); // ex. Bojan
            }
            success(data);
        });
    });
};

/*

Zdravo {{name}}
= 
Zdravo Bojan

{
    name: 'Bojan', // {{name}}
    age: 38, // {{age}}
    height: 190 // {{height}}
}

*/

module.exports = {
    sendEmail
};



