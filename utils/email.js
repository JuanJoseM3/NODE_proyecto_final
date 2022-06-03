const pug = require('pug');

const nodemailer = require('nodemailer');

const dotenv = require('dotenv');

const { htmlToText } = require('html-to-text');

dotenv.config({ path: './config.env' });

class Email {
    constructor() {}

    newTransport() {
        return nodemailer.createTransport({
            host: 'smtp.mailtrap.io',
            port: 2525,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS
            }
        });
    }

    async send(template, subject, emailData) {
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, emailData );
    
        await this.newTransport().sendMail({
            from: 'juanjosemosg@gmail.com',
            to: this.to,
            subject,
            html,
            text: htmlToText(html)
        });
    }

    async sendPurchaseNotice() {
        await this.send('puchaseNotice', '', {});
    }
}

module.exports = { Email };
