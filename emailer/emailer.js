const hbs = require('nodemailer-express-handlebars');
require('dotenv').config();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const moment = require('moment');

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
  sendEmail: (date, awayTeam, homeTeam, to, startTime) => {
    // schedule to email reminder 45 minutes before game time
    const sendTime = moment(`${date} ${startTime}`, 'YYYY-MM-DD hh:mmA').subtract(45, 'minutes');

    const task = cron.schedule(`* ${sendTime.minute()} ${sendTime.hour()} ${sendTime.date()} * *`, () => {
      const mail = {
        from: 'sport.tracker.canada@gmail.com',
        to,
        subject: `Reminder: ${awayTeam} vs ${homeTeam} on ${date} at ${startTime}`,
        template: 'notify',
        context: {
          game: `Reminder: ${awayTeam} vs ${homeTeam} on ${date}. Game is starting at ${startTime}`
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
