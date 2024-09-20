const bcrypt = require('bcrypt');
const { Otp } = require('../db/models/otp.model');
const UsersService = require('../services/users.services'); // Import the UsersService

class OtpService {
  constructor() {
    this.otpValidityPeriod = 60 * 60 * 1000; // OTP valid for 1 hour
    this.saltRounds = 10; // Salt rounds for bcrypt
  }

  // Generate a plain OTP and hash it with bcrypt
  generateOtp() {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    return otp;
  }

  async saveOtp(email, otp, user) {
    try {
      const hashedOtp = await bcrypt.hash(otp, this.saltRounds);
      const expiry = Date.now() + this.otpValidityPeriod;
    
      await Otp.destroy({ where: { user_id: user.id } }); // Remove any old OTPs for the user
  
      await Otp.create({
        user_id: user.id,
        otp_code: hashedOtp,
        expiration_time: new Date(expiry),
      });
  
      console.log(`OTP successfully sent to email: ${email}`); // Log success with email
      return { success: true, message: 'OTP enviado exitosamente.' }; // Success response
    } catch (error) {
      console.log(`Error saving OTP for email: ${email}`); // Log error with email
      console.error(`Error saving OTP: ${error.message}`); // Log error details
      return { success: false, message: `Error guardando OTP: ${error.message}` }; // Error response
    }
  }

  async verifyOtp(email, otp) {
    try {
      // Find the user by email using the UsersService
      const userService = new UsersService(); // Create a new instance of UsersService
      const user = await userService.findOneByEmail(email);
      if (!user) {
        return { success: false, message: "Usuario no encontrado" };
      }

      // Fetch OTP from the database by user ID
      const otpRecord = await Otp.findOne({ where: { user_id: user.id } });
      if (!otpRecord) {
        return { success: false, message: "OTP no encontrado o expirado" };
      }

      // Check if OTP is still valid (not expired)
      const isExpired = new Date() > new Date(otpRecord.expiration_time);
      if (isExpired) {
        return { success: false, message: "El OTP ha expirado" };
      }

      // Compare the provided OTP with the stored, hashed OTP
      const isMatch = await bcrypt.compare(otp, otpRecord.otp_code);
      if (!isMatch) {
        return { success: false, message: "OTP incorrecto. Inténtalo de nuevo" };
      }

      // OTP is valid and matches
      return { success: true, message: "OTP verificado correctamente" };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return { success: false, message: "Error al verificar el OTP" };
    }
  }
}

module.exports = OtpService;
