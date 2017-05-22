require('dotenv').config();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
var hbs = require('nodemailer-express-handlebars');

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: process.env.NODEMAILER_PORT,
  secure: true,
  auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS
  }
});
const options = {
  viewEngine: {
     extname: '.hbs',
     layoutsDir: 'emailer/templates/emails/',
     defaultLayout : 'html',
     partialsDir : 'emailer/templates/emails/partials/'
  },
  viewPath: 'emailer/templates/emails/',
  extName: '.hbs'
}
transporter.use('compile', hbs(options));

module.exports = {
  sendEmail: (date, game, to) => {
    const task = cron.schedule(`* ${date.minute()} ${date.hour()} ${date.date()} * *`, function(){
      var mail = {
         from: 'sport.tracker.canada@gmail.com',
         to:  to,
         subject: `${game}`,
         template: 'html',
         context: {
             game: `${game}`
         }
      }
      transporter.sendMail(mail);
      task.destroy();
    }, false);
    task.start();
  }
};