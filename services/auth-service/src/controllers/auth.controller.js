/**
 * AUTH CONTROLLER
 * -------------------------------------------------
 * Controller ek "traffic police" ki tarah kaam karta hai.
 *
 * Kya karta hai:
 * 1. Request aati hai (phone, otp etc.)
 * 2. Service ko bulata hai (OTP, JWT, User)
 * 3. Response deta hai
 *
 * Controller mein SIRF yeh hona chahiye:
 * ✅ Service call karo
 * ✅ Response bhejo
 * ✅ Error handle karo
 *
 * Controller mein NAHI hona chahiye:
 * ❌ DB queries (user.service mein rakho)
 * ❌ OTP logic (otp.service mein rakho)
 * ❌ Validation (validator middleware mein rakho)
 */

const otpService  = require('../services/otp.service');
const jwtService  = require('../services/jwt.service');
const userService = require('../services/user.service');
const response    = require('../utils/response');
const logger      = require('../utils/logger');

const authController = {
  /**
   * OTP BHEJO
   * -------------------------------------------------
   * POST /auth/send-otp
   * Body: { phone: "9876543210" }
   *
   * Flow:
   * 1. OTP generate karo
   * 2. Redis mein save karo
   * 3. SMS bhejo
   * 4. Success response do
   */
  sendOtp: async (req, res) => {
    // Validator ne already phone validate kar diya hai
    const { phone } = req.body;

    try {
      // OTP banao
      const otp = otpService.generateOtp();

      // Redis mein save karo (5 min ke liye)
      await otpService.saveOtp(phone, otp);

      // SMS bhejo
      const smsSent = await otpService.sendOtp(phone, otp);

      if (!smsSent) {
        return response.error(res, 'SMS send nahi ho saka. Dobara try karo.', 'AUTH_002', 500);
      }

      // Success — phone mask karke dikhao (security)
      const maskedPhone = `${phone.substring(0, 2)}XXXXXXXX`;

      return response.success(res, `OTP ${maskedPhone} pe bhej diya gaya`, {
        phone: maskedPhone,
        expiresIn: '5 minutes',
      });

    } catch (error) {
      logger.error('sendOtp error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * OTP VERIFY KARO
   * -------------------------------------------------
   * POST /auth/verify-otp
   * Body: { phone: "9876543210", otp: "123456" }
   *
   * Flow:
   * 1. OTP verify karo
   * 2. User dhundho ya banao
   * 3. JWT token generate karo
   * 4. Token + user data return karo
   */
  verifyOtp: async (req, res) => {
    const { phone, otp } = req.body;

    try {
      // Step 1: OTP verify karo
      const otpResult = await otpService.verifyOtp(phone, otp);

      if (!otpResult.valid) {
        return response.error(res, otpResult.reason, otpResult.code, 400);
      }

      // Step 2: User dhundho ya banao
      const { user, isNewUser } = await userService.findOrCreate(phone);

      // Inactive user — banned account
      if (!user.is_active) {
        return response.error(res, 'Yeh account suspend hai.', 'AUTH_007', 403);
      }

      // Step 3: JWT token banao
      const token = await jwtService.generateToken({
        userId: user.id,
        phone:  user.phone,
        role:   'user',
      });

      logger.info(`User logged in: ${user.id}`);

      // Step 4: Success response
      return response.success(res, 'Login ho gaye!', {
        token,
        user: {
          id:           user.id,
          phone:        user.phone,
          name:         user.name,
          profilePhoto: user.profile_photo,
        },
        isNewUser, // Frontend decide karega onboarding dikhana hai ya nahi
      });

    } catch (error) {
      logger.error('verifyOtp error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * LOGOUT
   * -------------------------------------------------
   * POST /auth/logout
   * Header: Authorization: Bearer <token>
   *
   * Token ko Redis se delete karo — ab kaam nahi karega.
   */
  logout: async (req, res) => {
    try {
      // req.user auth middleware ne set kiya tha
      const { userId, tokenId } = req.user;

      await jwtService.invalidateToken(userId, tokenId);

      return response.success(res, 'Logout ho gaye. Phir milenge!');

    } catch (error) {
      logger.error('logout error:', error.message);
      return response.serverError(res);
    }
  },

  /**
   * MERA PROFILE
   * -------------------------------------------------
   * GET /auth/me
   * Header: Authorization: Bearer <token>
   *
   * Logged in user ka apna profile dekho.
   */
  getMe: async (req, res) => {
    try {
      const { userId } = req.user;

      const user = await userService.findByPhone(req.user.phone);

      if (!user) {
        return response.notFound(res, 'User nahi mila');
      }

      return response.success(res, 'Profile mila', {
        id:           user.id,
        phone:        user.phone,
        name:         user.name,
        email:        user.email,
        profilePhoto: user.profile_photo,
        createdAt:    user.created_at,
      });

    } catch (error) {
      logger.error('getMe error:', error.message);
      return response.serverError(res);
    }
  },
};

module.exports = authController;
