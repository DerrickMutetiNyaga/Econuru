# M-Pesa Production Fix Guide

## Issues Identified and Fixed

### 1. ❌ Invalid Callback URL Format
**Error**: `Bad Request - Invalid CallBackURL`
**Root Cause**: Callback URL had invalid format: `https://abc123-45-67-89-101.ngrok-free.app -> http://localhost:3000`
**Fix**: Updated to proper production URL: `https://www.econuru.co.ke/api/mpesa/callback`

### 2. ❌ M-Pesa Status Query 500 Error
**Error**: M-Pesa status query returning 500 internal server error
**Root Cause**: Poor error handling and inconsistent field mapping
**Fix**: Improved error handling and unified field structure

## Files Modified

### 1. `ENV_CONFIG_FOR_ECONURU.env`
```diff
- MPESA_CALLBACK_URL=https://abc123-45-67-89-101.ngrok-free.app -> http://localhost:3000
+ MPESA_CALLBACK_URL=https://www.econuru.co.ke/api/mpesa/callback
```

### 2. `lib/mpesa.ts` - Enhanced querySTKStatus method
- Added comprehensive logging
- Improved error handling
- Return structured error responses instead of throwing

### 3. `app/api/mpesa/status/[checkoutRequestId]/route.ts`
- Removed try-catch wrapper around status query
- Handle structured error responses
- Better error reporting to client

### 4. `app/api/mpesa/callback/route.ts`
- Fixed order lookup to check both top-level and nested fields
- Update both field structures for compatibility
- Better payment status handling

### 5. `app/api/mpesa/initiate/route.ts`
- Added callback URL validation
- Ensure HTTPS requirement
- Improved error messages

## Environment Variables for Production

Update these in your Vercel dashboard:

```bash
NEXT_PUBLIC_BASE_URL=https://www.econuru.co.ke
MPESA_CALLBACK_URL=https://www.econuru.co.ke/api/mpesa/callback
MPESA_ENVIRONMENT=production
```

## Testing Steps

1. **Deploy to Vercel** with updated environment variables
2. **Test STK Push** from admin orders page
3. **Verify Callback** endpoint is accessible: `GET https://www.econuru.co.ke/api/mpesa/callback`
4. **Monitor Logs** in Vercel dashboard for detailed M-Pesa responses

## Expected Behavior After Fix

### ✅ STK Push Initiation
- Should return success with checkoutRequestId
- No more "Invalid CallBackURL" errors
- Proper logging of M-Pesa configuration

### ✅ Payment Status Queries
- Should handle M-Pesa API errors gracefully
- Return order status even if M-Pesa query fails
- Better error messages in logs

### ✅ Callback Processing
- Properly find orders using either field structure
- Update both top-level and nested M-Pesa fields
- Handle both successful and failed payments

## Monitoring

Check Vercel function logs for these successful patterns:

```
✅ M-Pesa Configuration: { shortCode: '7092156', environment: 'production' }
✅ Using M-Pesa callback URL: https://www.econuru.co.ke/api/mpesa/callback
✅ STK Push response: { ResponseCode: '0', CheckoutRequestID: 'ws_CO_...' }
✅ Payment successful for order: Receipt ABC123
```

## Safaricom Registration

Ensure these URLs are registered with Safaricom:
- **Callback URL**: `https://www.econuru.co.ke/api/mpesa/callback`
- **Validation URL**: `https://www.econuru.co.ke/api/payments/c2b/validation`
- **Confirmation URL**: `https://www.econuru.co.ke/api/payments/c2b/confirmation`

## Next Steps

1. Deploy the updated code
2. Update Vercel environment variables
3. Test a real M-Pesa transaction
4. Monitor logs for any remaining issues
5. Contact Safaricom if URL registration is needed

Your M-Pesa integration should now work correctly in production! 🎉 