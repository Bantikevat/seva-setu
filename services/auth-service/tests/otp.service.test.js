/**
 * OTP SERVICE TESTS
 * -------------------------------------------------
 * Har function ka test likha hai.
 *
 * Testing rules:
 * - Happy path test: Sab sahi ho toh kya hoga
 * - Error path test: Kuch galat ho toh kya hoga
 * - Edge cases:      Unusual inputs se kya hoga
 *
 * Run karo: npm test
 */

const otpService = require('../src/services/otp.service');

// Redis mock karo — real Redis ki zaroorat nahi tests mein
jest.mock('../src/config/redis', () => ({
  redisSet: jest.fn().mockResolvedValue(true),
  redisGet: jest.fn(),
  redisDel: jest.fn().mockResolvedValue(true),
  redisTtl: jest.fn().mockResolvedValue(200),
}));

jest.mock('../src/config/env', () => ({
  isDev:             true,
  otpExpireSeconds:  300,
  otpMaxAttempts:    3,
  otpBlockSeconds:   900,
}));

const { redisGet, redisSet } = require('../src/config/redis');

// ─────────────────────────────────────────
//  generateOtp() Tests
// ─────────────────────────────────────────
describe('generateOtp()', () => {
  test('6 digit OTP banana chahiye', () => {
    const otp = otpService.generateOtp();
    expect(otp).toHaveLength(6);
  });

  test('OTP sirf numbers hone chahiye', () => {
    const otp = otpService.generateOtp();
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });

  test('OTP 100000 se 999999 ke beech hona chahiye', () => {
    const otp = parseInt(otpService.generateOtp());
    expect(otp).toBeGreaterThanOrEqual(100000);
    expect(otp).toBeLessThanOrEqual(999999);
  });

  test('Har baar alag OTP aana chahiye', () => {
    const otp1 = otpService.generateOtp();
    const otp2 = otpService.generateOtp();
    const otp3 = otpService.generateOtp();
    // 1 million mein se same aana bahut mushkil hai
    const allSame = otp1 === otp2 && otp2 === otp3;
    expect(allSame).toBe(false);
  });
});

// ─────────────────────────────────────────
//  verifyOtp() Tests
// ─────────────────────────────────────────
describe('verifyOtp()', () => {
  beforeEach(() => {
    // Har test se pehle mocks reset karo
    jest.clearAllMocks();
  });

  test('Sahi OTP pe valid: true aana chahiye', async () => {
    // Redis mein OTP "123456" save hai
    redisGet
      .mockResolvedValueOnce(null)     // Block check → not blocked
      .mockResolvedValueOnce('123456') // OTP check → milega
      .mockResolvedValueOnce(null);    // Attempts check

    const result = await otpService.verifyOtp('9876543210', '123456');

    expect(result.valid).toBe(true);
  });

  test('Galat OTP pe valid: false aana chahiye', async () => {
    redisGet
      .mockResolvedValueOnce(null)     // Not blocked
      .mockResolvedValueOnce('123456') // Saved OTP
      .mockResolvedValueOnce(null);    // Attempts

    const result = await otpService.verifyOtp('9876543210', '999999');

    expect(result.valid).toBe(false);
    expect(result.code).toBe('AUTH_003');
  });

  test('Expire OTP pe valid: false aana chahiye', async () => {
    redisGet
      .mockResolvedValueOnce(null) // Not blocked
      .mockResolvedValueOnce(null) // OTP nahi mila (expire)

    const result = await otpService.verifyOtp('9876543210', '123456');

    expect(result.valid).toBe(false);
    expect(result.code).toBe('AUTH_004');
  });

  test('Blocked phone pe error aana chahiye', async () => {
    // Block key exist karta hai
    redisGet.mockResolvedValueOnce('1');

    const result = await otpService.verifyOtp('9876543210', '123456');

    expect(result.valid).toBe(false);
    expect(result.reason).toContain('minute');
  });
});
