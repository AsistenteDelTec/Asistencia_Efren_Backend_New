const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = (userEmail, token) => {
  const url = `http://localhost:3000/api/v1/auth/verify-email?token=${token}`;
  
  console.log(`Enviando correo de verificación a: ${userEmail}`); // Log para verificar que se llama a la función
  
  transporter.sendMail({
    to: userEmail,
    subject: 'Verificación de Email',
    html: `Haz clic en este enlace para verificar tu email: <a href="${url}">${url}</a>`
  }, (error, info) => {
    if (error) {
      console.error(`Error al enviar correo: ${error}`); // Log de error
    } else {
      console.log(`Correo enviado: ${info.response}`); // Log de éxito
    }
  });
};

module.exports = {
  sendVerificationEmail
};