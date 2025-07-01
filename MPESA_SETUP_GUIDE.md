# M-Pesa Integration Setup Guide

## Overview
This guide will help you configure M-Pesa payments for your Econuru laundry application when you're ready to go live.

## Prerequisites
- Safaricom M-Pesa Business Account
- Registered Business (for production access)
- Access to Safaricom Developer Portal

## Step 1: Create Safaricom Developer Account

1. Visit [https://developer.safaricom.co.ke/](https://developer.safaricom.co.ke/)
2. Click "Sign Up" and create your developer account
3. Verify your email and complete profile setup

## Step 2: Create Your App

1. Login to the developer portal
2. Click "Create App" 
3. Fill in your app details:
   - **App Name**: Econuru Laundry Services
   - **Description**: Luxury laundry payment processing
   - **Products**: Select "M-Pesa Express (STK Push)"

## Step 3: Get Your Credentials

After creating your app, you'll get:

### Sandbox Credentials (for testing)
- Consumer Key
- Consumer Secret  
- Passkey
- Short Code (usually 174379 for sandbox)

### Production Credentials (for live payments)
- Consumer Key
- Consumer Secret
- Passkey
- Your Business Short Code

## Step 4: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# M-Pesa Configuration
MPESA_CONSUMER_KEY=your-actual-consumer-key
MPESA_CONSUMER_SECRET=your-actual-consumer-secret
MPESA_PASSKEY=your-actual-passkey
MPESA_SHORT_CODE=your-actual-short-code
MPESA_ENVIRONMENT=production  # Change from 'sandbox' to 'production'

# Optional: Custom callback URL
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
```

## Step 5: Test Configuration

1. Start with sandbox environment first:
   ```bash
   MPESA_ENVIRONMENT=sandbox
   ```

2. Test payments with sandbox phone numbers:
   - `254708374149` - Success scenario
   - `254700000000` - Failure scenario

3. Once sandbox testing is successful, switch to production:
   ```bash
   MPESA_ENVIRONMENT=production
   ```

## Step 6: Production Readiness Checklist

- [ ] Business registered with Safaricom
- [ ] Production M-Pesa credentials obtained
- [ ] SSL certificate installed (HTTPS required)
- [ ] Callback URL accessible from internet
- [ ] Test with small amounts first
- [ ] Monitor transaction logs
- [ ] Set up proper error handling

## Available Features

✅ **STK Push Payment**: Customers enter phone number, receive payment prompt
✅ **Payment Status Tracking**: Real-time status updates
✅ **Transaction History**: Full payment records
✅ **Receipt Management**: M-Pesa receipt numbers stored
✅ **Error Handling**: Comprehensive error messages

## API Endpoints

- `POST /api/mpesa/initiate` - Start payment process
- `POST /api/mpesa/callback` - Handle M-Pesa callbacks
- `GET /api/mpesa/status/[checkoutRequestId]` - Check payment status

## Support

If you need help with M-Pesa integration:

1. **Safaricom Support**: support@safaricom.co.ke
2. **Developer Portal**: [https://developer.safaricom.co.ke/](https://developer.safaricom.co.ke/)
3. **Documentation**: Available in the developer portal

## Security Notes

⚠️ **Important Security Practices**:

- Never commit M-Pesa credentials to version control
- Use environment variables for all sensitive data
- Validate all callback data from M-Pesa
- Log all transactions for audit purposes
- Monitor for suspicious payment patterns

## Troubleshooting

### Common Issues:

1. **"Invalid Access Token"**
   - Check consumer key/secret are correct
   - Ensure no extra spaces in credentials

2. **"Invalid Shortcode"**
   - Verify your business shortcode
   - Ensure it matches your M-Pesa account

3. **"Callback URL not reachable"**
   - Ensure your domain has SSL certificate
   - Test callback URL accessibility

4. **"STK Push failed"**
   - Check phone number format (254...)
   - Verify customer has M-Pesa enabled

---

**Ready to go live?** Contact me with your M-Pesa credentials and I'll help you complete the setup! 🚀 