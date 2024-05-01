import nodemailer from 'nodemailer';



const emailSender = async(email, subject, text) => 
{
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      service: process.env.EMAIL_SERVICE,
      port: Number(process.env.EMAIL_PORT),
      secure: Boolean(process.env.EMAIL_SECURE),
      auth:{
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });  

    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: subject,
      html: text
    });

    console.log('email sent!');
  } 
  catch (error) {
    
    console.log(error.message);
    console.log("failed on sending email (emailSender.js).");
  }

}

export default emailSender;

// emailSender.propTypes = {
//   email: String.PropTypes,
//   subject: String.PropTypes,
//   text: String.PropTypes
// }