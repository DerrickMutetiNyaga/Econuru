# ❌ M-Pesa Error 2028 - "Request not permitted according to product assignment"

## 🔍 What This Error Means

**Error Code 2028** indicates that your M-Pesa shortcode `7092156` **does not have STK Push permissions** enabled by Safaricom. This is a **Safaricom configuration issue**, not a code problem.

## ✅ Immediate Solution: Switch to Sandbox for Testing

### Step 1: Update Environment Variables for Sandbox Testing

Update your Vercel environment variables to use sandbox:

```bash
# Change these in Vercel Dashboard:
MPESA_ENVIRONMENT=sandbox
MPESA_SHORT_CODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CONSUMER_KEY=your-sandbox-consumer-key
MPESA_CONSUMER_SECRET=your-sandbox-consumer-secret
```

### Step 2: Get Sandbox Credentials

1. Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Create/login to your account
3. Create a new app with **M-Pesa Express (STK Push)** product
4. Get your **sandbox credentials**:
   - Consumer Key
   - Consumer Secret
   - Passkey
   - Shortcode (usually `174379`)

### Step 3: Test with Sandbox

Test phone numbers for sandbox:
- **Success**: `254708374149`
- **Failure**: `254700000000`

## 🏭 Production Fix: Contact Safaricom

### Option 1: Contact M-Pesa Support

**Email**: `apisupport@safaricom.co.ke` or `M-pesabusiness@safaricom.co.ke`

**Subject**: "Request STK Push activation for Till Number 7092156"

**Message Template**:
```
Dear M-Pesa Support Team,

I am requesting activation of STK Push functionality for my Till Number: 7092156

Business Name: [Your Business Name]
Contact Person: [Your Name]
Phone Number: [Your Phone]
Email: [Your Email]

I am getting error code 2028 "The request is not permitted according to product assignment" when trying to initiate STK Push payments.

Please enable STK Push/M-Pesa Express functionality for this till number.

Thank you.
```

### Option 2: Use M-Pesa Portal

1. Login to [https://org.ke.m-pesa.com/](https://org.ke.m-pesa.com/)
2. Go to **Self Service** → **API Management**
3. Request **STK Push** activation for your till number
4. Submit required documentation if requested

### Option 3: Visit Safaricom Shop

Visit any Safaricom shop with:
- Business registration certificate
- ID copy
- Till number: `7092156`
- Request STK Push activation

## 🔧 Alternative: Use Paybill Instead of Till

If you have a **Paybill number** instead of a Till number:

```bash
# Use your paybill number
MPESA_SHORT_CODE=your-paybill-number
MPESA_PASSKEY=your-paybill-passkey
```

**Paybill vs Till differences**:
- **Till**: Good for retail/POS payments
- **Paybill**: Better for online/API payments
- **STK Push**: Works with both, but needs activation

## 🧪 Testing Steps

### Current Status Check:
1. **✅ Code is working** - STK Push request reaches M-Pesa
2. **✅ Callback URL fixed** - No more invalid URL errors
3. **❌ Shortcode permissions** - Till doesn't have STK Push enabled

### Next Steps:
1. **Switch to sandbox** for immediate testing
2. **Contact Safaricom** for production fix
3. **Test thoroughly** in sandbox first
4. **Switch back to production** once permissions granted

## 📞 Safaricom Contact Information

- **Email**: apisupport@safaricom.co.ke
- **Phone**: +254722000000 (M-Pesa helpline)
- **Portal**: https://org.ke.m-pesa.com/
- **Developer Portal**: https://developer.safaricom.co.ke/

## 💡 Pro Tips

1. **Always test in sandbox first** before going to production
2. **Keep sandbox credentials** for testing new features
3. **Document all communications** with Safaricom support
4. **Have business documents ready** for verification
5. **Be patient** - activation can take 1-3 business days

## 🎯 Expected Timeline

- **Sandbox Setup**: Immediate (today)
- **Safaricom Response**: 1-2 business days
- **STK Push Activation**: 2-5 business days
- **Testing & Go-Live**: 1 day after activation

Your integration is **working perfectly** - you just need Safaricom to enable STK Push for your till number! 🎉 