# M-Pesa C2B Register URL Setup Guide

## 🔍 What is C2B Register URL?

**Customer to Business (C2B) Register URL** allows customers to pay **directly** to your M-Pesa paybill/till number, just like paying for KPLC, water bills, or mobile airtime. This is different from STK Push where you initiate payment from admin panel.

### **STK Push vs C2B Comparison:**

| Feature | STK Push (Current) | C2B Register URL (New) |
|---------|-------------------|----------------------|
| **Who initiates?** | Merchant/Admin | Customer |
| **Customer experience** | Gets popup on phone | Dials *334# or uses app |
| **Payment flow** | Admin → M-Pesa → Customer | Customer → Paybill → M-Pesa → Your system |
| **Use case** | POS, in-person payments | Self-service, online orders |
| **Validation** | Not needed | Optional (can reject before processing) |
| **Bill reference** | Order ID | Customer enters order number |

## 🔧 Environment Variables Setup

Add these to your `.env` file:

```env
# C2B Register URL Configuration
MPESA_C2B_VALIDATION_URL=https://econuru.co.ke/api/payments/c2b/validation
MPESA_C2B_CONFIRMATION_URL=https://econuru.co.ke/api/payments/c2b/confirmation
MPESA_C2B_RESPONSE_TYPE=Completed
MPESA_C2B_ENABLE_VALIDATION=false
```

### **Environment Variables Explained:**

- **`MPESA_C2B_VALIDATION_URL`**: Called **before** payment processing (optional)
- **`MPESA_C2B_CONFIRMATION_URL`**: Called **after** successful payment (required)
- **`MPESA_C2B_RESPONSE_TYPE`**: What happens if validation fails (`Completed` or `Cancelled`)
- **`MPESA_C2B_ENABLE_VALIDATION`**: Enable custom validation logic (`true` or `false`)

## 🏗️ Daraja API Setup Steps

### **Step 1: Access Daraja Portal**
1. Go to [https://developer.safaricom.co.ke/](https://developer.safaricom.co.ke/)
2. Login with your Safaricom developer account
3. Navigate to your app dashboard

### **Step 2: Register URLs (One-time setup)**
**⚠️ IMPORTANT:** In **production**, you can only register URLs **once**. In sandbox, you can register multiple times.

#### **For Sandbox Testing:**
1. Use the admin panel: `/admin/dashboard` → M-Pesa → Register C2B URLs
2. Or make API call to: `POST /api/payments/c2b/register`

#### **For Production:**
1. **First time**: Use the admin panel or API
2. **To change URLs**: Go to Daraja portal → Self Service → URL Management → Delete old URLs → Re-register

### **Step 3: Enable External Validation (Optional)**
If you want to validate payments before accepting them:

1. Email: `apisupport@safaricom.co.ke` or `M-pesabusiness@safaricom.co.ke`
2. Request: "Please enable C2B External Validation for shortcode [YOUR_SHORTCODE]"
3. Set `MPESA_C2B_ENABLE_VALIDATION=true` in your environment

## 📱 How Customers Pay (C2B)

### **Method 1: USSD (*334#)**
1. Dial `*334#`
2. Select "Pay Bill"
3. Enter your **Business Number** (shortcode)
4. Enter **Amount**
5. Enter **Account Number** (order number/reference)
6. Enter M-Pesa PIN
7. Payment processed instantly

### **Method 2: M-Pesa App**
1. Open M-Pesa app
2. Go to "Pay Bill"
3. Enter **Business Number** (your shortcode)
4. Enter **Amount**
5. Enter **Account Number** (order number)
6. Confirm payment

### **Method 3: SIM Toolkit**
1. Go to M-Pesa menu on phone
2. Select "Pay Bill"
3. Follow prompts

## 🔄 Payment Flow Explanation

```mermaid
flowchart TD
    A[Customer dials *334#] --> B[Enters Paybill Number]
    B --> C[Enters Amount & Reference]
    C --> D[M-Pesa receives payment]
    D --> E{External Validation Enabled?}
    E -->|Yes| F[M-Pesa calls /validation endpoint]
    F --> G{Validation Response}
    G -->|Accept (0)| H[M-Pesa processes payment]
    G -->|Reject (error code)| I[M-Pesa cancels payment]
    E -->|No| H
    H --> J[M-Pesa calls /confirmation endpoint]
    J --> K[Your system updates order]
    K --> L[Customer gets SMS confirmation]
    I --> M[Customer gets rejection SMS]
```

## 🛠️ Implementation Details

### **1. Validation Endpoint** (`/api/payments/c2b/validation`)
- **Called**: Before payment processing (if enabled)
- **Purpose**: Validate payment details, reject if needed
- **Response**: `Accept (0)` or `Reject (error code)`
- **Timeout**: Must respond within 8 seconds

**Example validation scenarios:**
- Check if order exists
- Verify amount matches order total
- Ensure customer is active
- Validate minimum amount

### **2. Confirmation Endpoint** (`/api/payments/c2b/confirmation`)
- **Called**: After successful payment
- **Purpose**: Update order status, create customer records
- **Response**: Always return success
- **Action**: Update database with payment details

### **3. Register URL Endpoint** (`/api/payments/c2b/register`)
- **Purpose**: Register validation/confirmation URLs with M-Pesa
- **Access**: Admin only
- **Frequency**: Once per environment (sandbox allows multiple)

## 📊 Database Schema Updates

The system automatically handles:

### **Order Model Updates:**
```javascript
{
  paymentMethod: 'mpesa_c2b',
  paymentStatus: 'paid',
  c2bPayment: {
    transactionId: 'RKTQDM7W6S',
    mpesaReceiptNumber: 'RKTQDM7W6S',
    transactionDate: Date,
    phoneNumber: '0722000000',
    amountPaid: 1500,
    transactionType: 'Pay Bill',
    billRefNumber: 'ORDER123',
    customerName: 'John Doe',
    paymentCompletedAt: Date
  }
}
```

### **Customer Model Updates:**
```javascript
{
  name: 'John Doe',
  phone: '0722000000',
  createdViaPayment: true,
  lastPaymentDate: Date,
  lastPaymentAmount: 1500,
  lastTransactionId: 'RKTQDM7W6S'
}
```

## 🧪 Testing

### **Sandbox Testing:**
1. Register URLs via admin panel
2. Use test credentials from Daraja portal
3. Test with sandbox paybill number
4. Monitor logs for validation/confirmation calls

### **Production Testing:**
1. Register URLs once
2. Use real paybill number
3. Test with small amounts first
4. Monitor payment flow end-to-end

## 🚨 Important Notes

### **Production Considerations:**
- **URL Registration**: Only once per shortcode
- **HTTPS Required**: All URLs must be HTTPS
- **No Test URLs**: Don't use ngrok, mockbin, etc.
- **Response Time**: Validation must respond within 8 seconds
- **Always Acknowledge**: Confirmation endpoint should always return success

### **Error Handling:**
- **Validation Timeout**: Uses `MPESA_C2B_RESPONSE_TYPE` setting
- **Confirmation Failure**: Payment already processed, log error but return success
- **Network Issues**: M-Pesa retries, ensure idempotency

### **Security:**
- **No Authentication**: M-Pesa calls your endpoints without auth
- **IP Whitelisting**: Consider restricting to Safaricom IPs
- **Input Validation**: Always validate incoming data
- **Logging**: Log all requests for debugging

## 📞 Support

### **Safaricom Support:**
- **Email**: apisupport@safaricom.co.ke
- **Business**: M-pesabusiness@safaricom.co.ke
- **Portal**: https://org.ke.m-pesa.com/

### **Common Issues:**
1. **URLs not receiving callbacks**: Check firewall, HTTPS, and registration
2. **Validation timeout**: Optimize response time, check server performance
3. **Payments not updating**: Check confirmation endpoint logs
4. **Amount mismatch**: Ensure proper decimal handling

## 🎯 Next Steps

1. **Update Environment Variables**: Add C2B configuration
2. **Register URLs**: Use admin panel to register with M-Pesa
3. **Test Payment Flow**: Make test payment in sandbox
4. **Enable Validation**: If needed, request Safaricom activation
5. **Go Live**: Register production URLs and test
6. **Monitor**: Watch logs and payment reconciliation

## 💡 Customer Instructions

Provide this to your customers:

---

### **How to Pay via M-Pesa**

1. **Dial** `*334#` on your phone
2. **Select** "Pay Bill"
3. **Enter Business Number**: `[YOUR_SHORTCODE]`
4. **Enter Amount**: Amount to pay
5. **Enter Account Number**: Your order number (e.g., ORD-123)
6. **Enter M-Pesa PIN** and confirm
7. **Receive SMS** confirmation immediately

**Alternative**: Use M-Pesa app → Pay Bill → Follow same steps

--- 