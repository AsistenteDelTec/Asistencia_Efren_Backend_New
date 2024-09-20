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
    html: 
      `
        <html>
          <body>
            <p>Estimado/a usuario/a,</p>
            <p>Gracias por registrarte en nuestra plataforma. Para completar el proceso de registro, por favor verifica tu dirección de correo electrónico.</p>
            <p>Haz clic en el siguiente enlace para verificar tu correo:</p>
            <p><a href="${url}" style="color: #1a73e8; text-decoration: none;">enlace</a></p>
            <p>Si no te has registrado en nuestra plataforma, puedes ignorar este correo.</p>
            <p>Saludos cordiales,</p>
            <p>El equipo de soporte</p>
            <p>Ya puedes cerrar esta pestaña</p>
          </body>
      </html>
      `
  }, (error, info) => {
    if (error) {
      console.error(`Error al enviar correo: ${error}`); // Log de error
    } else {
      console.log(`Correo enviado: ${info.response}`); // Log de éxito
    }
  });
};
const sendOTPEmail = (userEmail, otp) => {
  const url = `http://localhost:3000/api/v1/auth/verify-otp?otp=${otp}`;
  
  console.log(`Enviando OTP a: ${userEmail}`);
  
  transporter.sendMail({
      to: userEmail,
      subject: 'Código de Verificación',
      html: 
        `
          <html>
            <body>
              <p>Estimado/a usuario/a,</p>
              <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
              <p>Tu código de verificación es: <strong>${otp}</strong></p>
              <p>Por favor, no comparta este código con nadie.</p>
              <p>Si no solicitaste este código, por favor ignora este mensaje.</p>
              <p>Saludos cordiales,</p>
              <p>El equipo de soporte</p>
            </body>
        </html>
        `
  }, (error, info) => {
      if (error) {
          console.error(`Error al enviar correo: ${error}`); 
      } else {
          console.log(`Correo enviado: ${info.response}`); 
      }
  });
  };
  const sendNewPasswordEmail = (userEmail, newPassword) => {
    console.log(`Enviando nueva contraseña a: ${userEmail}`);
    
    transporter.sendMail({
      to: userEmail,
      subject: 'Nueva Contraseña de Tu Cuenta',
      html: 
        `
          <html>
            <body>
              <p>Estimado/a usuario/a,</p>
              <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
              <p>Tu nueva contraseña es: <strong>${newPassword}</strong></p>
              <p>Por favor, inicia sesión con esta nueva contraseña y cambia tu contraseña desde tu perfil.</p>
              <p>Si no solicitaste este cambio, por favor contacta con el soporte.</p>
              <p>Saludos cordiales,</p>
              <p>El equipo de soporte</p>
            </body>
        </html>
        `
    }, (error, info) => {
      if (error) {
        console.error(`Error al enviar correo: ${error}`); 
      } else {
        console.log(`Correo enviado: ${info.response}`); 
      }
    });
  };
module.exports = {
  sendVerificationEmail, sendOTPEmail, sendNewPasswordEmail
};