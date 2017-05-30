const hbs = require('nodemailer-express-handlebars');
require('dotenv').config();
const nodemailer = require('nodemailer');
const cron = require('node-cron');

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
    partialsDir: 'emailer/templates/emails/partials/'
  },
  viewPath: 'emailer/templates/emails/',
  extName: '.hbs'
}
transporter.use('compile', hbs(options));

module.exports = {
  sendEmail: (date, game, to) => {
    const task = cron.schedule(`* ${date.minute()} ${date.hour()} ${date.date()} * *`, function(){
      const mail = {
        from: 'sport.tracker.canada@gmail.com',
        to,
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
  },
  sendEmailNow: (date, awayTeam, homeTeam, to) => {
    const mail = {
      from: 'sport.tracker.canada@gmail.com',
      to,
      subject: `Invitiation: ${awayTeam} vs ${homeTeam} on ${date}`,
      template: 'share',
      context: {
        awayTeam: `${awayTeam}`,
        homeTeam: `${homeTeam}`,
        date: `${date}`
      }
    }
    transporter.sendMail(mail);
  }
};
