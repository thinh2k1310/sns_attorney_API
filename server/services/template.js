
function resetEmail(user, otp){
    const message = {
      subject: 'OTP for Attorney reset password',
      text:
        `Hi ${user.firstName},\n\n`+
          `Forgot your password?\n`+
          `We receive a request to reset your password for your account.\n\n` +
          `Your OTP is: ${user.OTP}\n\n` +
          `Pleas use the OTP to complete your process. OTP is valid for 5 minutes.\n\n`+
          `If you did not make this request then please ignore this email.\n\n`+ 
          `Sincerely,\n\n` +
          `Customer Service.`
    };
  
    return message;
  };
  
  function confirmResetPasswordEmail() {
    const message = {
      subject: 'Attorney password changed',
      text:
        'You are receiving this email because you changed your password. \n\n' +
        'If you did not request this, please contact us immediately.\n\n'+ 
        `Sincerely,\n\n` +
        `Customer Service.`
    };
  
    return message;
  };
  
  function signupEmail(name){
    const message = {
      subject: 'Attorney account registration successfully!',
      text:
        `Hi ${name.firstName}!\n`+ 
        `Your account has been signed up sucessfully!\n` + 
        `Thank you for joining with us!. \n\n` + 
        `Sincerely,\n\n` +
        `Customer Service.`
    };
  
    return message;
  }

  function validateOTP(user){
    const message = {
      subject: 'Verify Your Email Address',
      text:
        `Thank you for creating an Attorney account. To complete the registrasion process, please validate your e-mail address with OTP below.\n\n`+ 
        `Your OTP is: ${user.OTP}\n\n` + 
        `Sincerely,\n\n` +
        `Customer Service.`
    };
  
    return message;
  }

  function sendOTP(user){
    const message = {
      subject: 'Verify Your OTP',
      text: 
        `Your OTP is: ${user.OTP}\n\n` + 
        `Sincerely,\n\n` +
        `Customer Service.`
    };
  
    return message;
  }

  module.exports = {
      resetEmail,
      confirmResetPasswordEmail,
      signupEmail,
      validateOTP,
      sendOTP
  }