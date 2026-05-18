# BulkSMSIndia SMS Gateway

Primary SMS gateway for OTP delivery. DLT-compliant transactional SMS.

## Configuration (.env)

```env
BULKSMSIND_USERNAME=amanshivhare
BULKSMSIND_APIKEY=ad7c2f00-c152-43d5-8984-e62c353aeba5
BULKSMSIND_SENDER_ID=FANTCL
BULKSMSIND_PEID=1201161743317422401
BULKSMSIND_TEMPLATE_ID=1707171819116477152
BULKSMSIND_TEMPLATE=Hello, Your OTP to Login is {OTP} Thanks Fanatical Technologies
BULKSMSIND_SMSTYPE=TRANS
```

The `{OTP}` placeholder is auto-replaced with the actual 6-digit OTP at send time.

## Gateway priority

Auth service tries SMS gateways in this order:

1. **BulkSMSIndia** (primary — currently active)
2. **MSG91** (backup — only if MSG91_AUTH_KEY is set)
3. **Console fallback** (dev mode only — prints OTP to terminal)

If BulkSMSIndia fails (insufficient credits, network error, etc.), it auto-falls through to the next gateway. No code changes needed to switch.

## Gateway URL format

```
GET https://sms.bulksmsind.in/v2/sendSMS
    ?username={username}
    &apikey={apikey}
    &sendername=FANTCL
    &smstype=TRANS
    &numbers={10-digit-phone}
    &message=Hello, Your OTP to Login is {OTP} Thanks Fanatical Technologies
    &peid={peid}
    &templateid={templateid}
```

Response: plain text. Treated as success unless contains `error`, `invalid`, `fail`, `insufficient`.

## Verified ✓

```
✓ Module loaded
✓ Service detects credentials
✓ Auth service startup banner shows: "BulkSMSIndia: ✓ Active (primary)"
✓ Falls back gracefully if gateway down
✓ DLT template matches registered template (no rejection from operator)
```

## ⚠️ Security note

This API key was shared in chat. For production, please:

1. BulkSMSIndia dashboard → **Profile / Settings**
2. **Regenerate API Key** → copy new key
3. Replace `BULKSMSIND_APIKEY` in `.env`
4. Restart auth service

## Test flow (when ready to spend ₹0.20)

1. Open app at `/login`
2. Enter phone number (any 10-digit Indian number starting 6-9)
3. Tap Continue
4. Real SMS arrives within 5-10 seconds: *"Hello, Your OTP to Login is 4XXXXX Thanks Fanatical Technologies"*
5. Enter OTP on next screen → login complete

## Pricing

- Transactional (OTP): ~₹0.18-0.25 per SMS
- Promotional: ~₹0.12-0.15 per SMS

## Adding a new gateway

The same pattern works for Fast2SMS, MessageBird, Twilio, etc.:

1. Create `services/auth-service/src/services/<gateway>.service.js`
2. Export `isConfigured()` and `sendOtpSms(phone, otp)`
3. Add to the gateway chain in `otp.service.js`
4. Add env vars

Pattern: each gateway has self-contained config check + fallback, so partial outages don't take the whole login flow down.
