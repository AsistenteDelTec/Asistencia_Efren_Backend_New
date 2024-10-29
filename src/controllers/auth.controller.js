const UsersService = require('../services/users.services');
const service = new UsersService();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { sendVerificationEmail, sendOTPEmail } = require('../services/email.services'); // Import email service
const OtpService = require('../services/otp.services'); 
const otpService = new OtpService();

// Serializar y deserializar usuario
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await user.findOne(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Configurar Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/v1/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await service.findOneByEmail(profile.emails[0].value);
            if (!user) {
                // Si el usuario no existe, crearlo
                user = await service.create({
                    body: {
                        username: profile.displayName,
                        fullname: profile.displayName,
                        email: profile.emails[0].value,
                        password: bcrypt.hashSync(profile.id, parseInt(authConfig.rounds)), // Hashear una contraseña genérica
                        date_joined: new Date(),
                        verified: true,
                        user_role: 'USER'
                    }
                });
            }
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }
));

module.exports = {
    signIn: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await service.findOneByEmail(email);
    
            if (!user) {
                return res.status(404).json({ success: false, msg: "No existe un usuario con este correo electrónico." });
            }
    
            const { password: hashedPassword, ...userDetails } = user;
    
            if (bcrypt.compareSync(password, hashedPassword)) {
                const token = jwt.sign({ user: userDetails }, authConfig.secret, {
                    expiresIn: authConfig.expires
                });
                return res.json({
                    success: true,
                    user: user,
                    token: token
                });
            } else {
                return res.status(401).json({
                    success: false, 
                    msg: "Contraseña incorrecta."
                });
            }
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    

    signInWithGoogle: async (req, res) => {
        passport.authenticate('google', { scope: ['profile', 'email'] });
    },

    signUp: async (req, res) => {
        try {
            const { email } = req.body;

            const existingUser = await service.findOneByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    msg: 'Ya existe un usuario con este correo electrónico.'
                });
            }
            
            const response = await service.create(req);

            let token = jwt.sign({ email: response.user.email }, authConfig.secret, {
                expiresIn: '1h'
            });

            sendVerificationEmail(response.user.email, token);

            res.json({
                success: true,
                user: response.user,
                token: response.token,
                msg: `Registro exitoso. \nSe ha enviado un correo electrónico a la dirección ${email}. \nSiga las instrucciones para terminar su proceso de registro.`
            });
        } catch (error) {
            res.status(500).send({ success: false, msg: error.message });
        }
    },

    googleCallback: async (req, res) => {
        const token = jwt.sign({ user: req.user }, authConfig.secret, { expiresIn: authConfig.expires });
        res.json({ token: token, user: req.user });
    },
    
    verifyEmail: async (req, res) => {
        const token = req.query.token;
    
        try {
            const decoded = jwt.verify(token, authConfig.secret);
            const user = await service.findOneByEmail(decoded.email);
    
            if (user) {
                await service.update(user.id, { verified: true });
                console.log('Email verificado exitosamente');
                res.send(
                    `
                    <html>
                        <body>
                            <h1>Verificación de Correo Electrónico Completada</h1>
                            <p>Estimado(a) ${user.fullname},</p>
                            <p>Nos complace informarte que tu dirección de correo electrónico ha sido verificada exitosamente.</p>
                            <p>Ahora puedes acceder a tu cuenta y disfrutar de todos los beneficios de nuestra plataforma.</p>
                            <p>Gracias por registrarte y bienvenido(a) a nuestra comunidad.</p>
                            <p>Atentamente,</p>
                            <p>El equipo de soporte.</p>
                            <p>Ya puedes cerrar esta pestaña.</p>
                        </body>
                    </html>
                    `
                );
            } else {
                console.log('Usuario no encontrado');
                res.send(
                    `
                    <html>
                        <body>
                            <h1>Verificación de Correo Electrónico Fallida</h1>
                            <p>No se encontró el usuario en la base de datos.</p>
                            <p>Por favor, solicite un nuevo enlace de verificación o comuníquese con el equipo de soporte.</p>
                        </body>
                    </html>
                    `
                );
            }
        } catch (error) {
            console.error('Error al verificar el token:', error);
            res.send(
                `
                <html>
                    <body>
                        <h1>Verificación de Correo Electrónico Fallida</h1>
                        <p>El enlace de verificación es inválido o ha expirado.</p>
                        <p>Por favor, solicite un nuevo enlace de verificación o comuníquese con el equipo de soporte.</p>
                    </body>
                </html>
                `
            );
        }
    },

    sendOtp: async (req, res) => {
        try {
            console.log(`Attempt to send OTP with email: ${req.body.email}`);
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ success: false, msg: "Se requiere un Email." });
            }
    
            const user = await service.findOneByEmail(email);
            if (!user) {
                console.log(`User not found for email: ${email}`);
                return res.status(404).json({ success: false, msg: "No existe un usuario con este correo electrónico." });
            }
    
            const otp = otpService.generateOtp();
            const saveResponse = await otpService.saveOtp(email, otp, user);
    
            if (!saveResponse.success) {
                return res.status(500).json({ msg: saveResponse.message });
            }
    
            await sendOTPEmail(email, otp);
    
            res.json({ success: true, msg: `Se ha enviado un código OTP al correo ${email}.` });
        } catch (error) {
            console.error("Error in sendOtp:", error); 
            res.status(500).json({ success: false, message: error.message });
        }
    },

    verifyOtp: async (req, res) => {
        try {
            console.log(`Attempt to verify OTP with email: ${req.body.email}`);
            const { email, otp } = req.body;
      
            if (!email || !otp) {
                return res.status(400).json({ success: false, msg: "Se requiere un Email y un OTP." });
            }
            
            const user = await service.findOneByEmail(email);
            if (!user) {
                console.log(`User not found for email: ${email}`);
                return res.status(404).json({ success: false, msg: "No existe un usuario con este correo electrónico." });
            }
            
            const otpVerification = await otpService.verifyOtp(email, otp);
            
            if (!otpVerification.success) {
                return res.status(400).json({ msg: otpVerification.message });
            }
            
            return res.json({ success: true, msg: "OTP verificado correctamente." });
      
        } catch (error) {
            console.error("Error in verifyOtp:", error);
            return res.status(500).json({ success: false, msg: error.message });
        }
    },
    resetPassword: async (req, res) => { 
        const { email } = req.body;
  
        try {
            const result = await service.resetPassword(email);
  
            if (result) {
              res.status(200).json({ success: true, message: 'Se ha restablecido la contraseña.' });
          } else {
              res.status(400).json({ success: false, message: 'Hubo un error al restablecer la contraseña.' });
          }
        } catch (error) {
            console.error('Error during password reset:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
