const Mailgun = require('mailgun.js');
const formData = require('form-data');
const template = require('./template');
const keys = require('../configs/keys');

const { key, domain, url } = keys.mailgun;
const mg = new Mailgun(formData);
class MailgunService {
  init() {
    try {
      return mg.client({
        username: 'api',
        key: key,
        url: url
      });
    } catch (error) {
      console.warn('Missing mailgun keys');
    }
  }
}

const mailgun = new MailgunService().init();

async function sendEmail(email, type, data) {
  try {
    const message = prepareTemplate(type, data);
    console.log(message)
    const config = {
      from: "Attorney SNS! <attorney@gmail.com>",
      to: email,
      subject: message.subject,
      text: message.text
    };

    return mailgun.messages.create(domain, config)
                  .then(msg => console.log(msg))
                  .catch(err => console.log(err))
    
  } catch (error) {
    console.log(error);
    return error;
  }
};

const prepareTemplate = (type, data) => {
  let message;

  switch (type) {
    case 'reset':
      message = template.resetEmail(data);
      break;

    case 'reset-confirmation':
      message = template.confirmResetPasswordEmail();
      break;

    case 'signup':
      message = template.signupEmail(data);
      break;

    case 'validate':
      message = template.validateOTP(data);
      break;

    case 'newModerator':
      message = template.newModerator(data);
      break;

    case 'sendOTP':
      message = template.sendOTP(data);
      break;
        
    default:
      message = '';
  }

  return message;
};

module.exports = {
  sendEmail
}
