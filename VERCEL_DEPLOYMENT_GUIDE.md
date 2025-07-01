# 🚀 **ECONURU VERCEL DEPLOYMENT GUIDE**

## **Complete Setup for econuru.co.ke with M-Pesa Integration**

### **📋 Pre-Deployment Checklist**

- [ ] GitHub repository is up to date with latest code
- [ ] MongoDB database is accessible from the internet
- [ ] You have your actual environment variable values ready
- [ ] Domain econuru.co.ke is ready to be configured

---

## **🔧 STEP 1: Vercel Deployment**

### **1.1 Deploy to Vercel**
1. **Go to:** [vercel.com](https://vercel.com)
2. **Sign in** with your GitHub account
3. **Import** your Econuru project repository
4. **Deploy** (it will fail first time - that's expected)

### **1.2 Configure Environment Variables**
Go to **Vercel Dashboard > Your Project > Settings > Environment Variables**

Add these **EXACTLY** (copy from `VERCEL_ENVIRONMENT_VARIABLES.txt`):

```env
# M-Pesa Configuration
MPESA_CONSUMER_KEY=H8pg5VVGOWplnPvJmLTQJuBgUMN2CWvG
MPESA_CONSUMER_SECRET=dEq0sW9L0zHCnfdn
MPESA_PASSKEY=16346bcbe82536b2c082f7bd00432c8984ffff24686e685ca986458196131955
MPESA_SHORT_CODE=7092156
MPESA_ENVIRONMENT=production

# Domain Configuration
NEXT_PUBLIC_BASE_URL=https://econuru.co.ke
NEXT_PUBLIC_APP_URL=https://econuru.co.ke
NEXT_PUBLIC_API_URL=https://econuru.co.ke/api

# M-Pesa Callback URL
MPESA_CALLBACK_URL=https://econuru.co.ke/api/mpesa/callback

# YOUR ACTUAL DATABASE & SECRETS (replace with real values)
MONGODB_URI=your-actual-mongodb-connection-string
JWT_SECRET=your-actual-jwt-secret
NEXTAUTH_SECRET=your-actual-nextauth-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

**IMPORTANT:** 
- Set **Environment** to "**Production**" for all variables
- Replace placeholder values with your actual credentials

---

## **🌐 STEP 2: Domain Configuration**

### **2.1 Add Custom Domain**
1. **Vercel Dashboard** > Your Project > **Settings** > **Domains**
2. **Add Domain:** `econuru.co.ke`
3. **Add Domain:** `www.econuru.co.ke` (optional)

### **2.2 Update DNS Records**
In your domain registrar (where you bought econuru.co.ke):

```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

**Or use Vercel's suggested DNS records** (they'll show you the exact values)

---

## **🔄 STEP 3: Redeploy**

1. **Vercel Dashboard** > Your Project > **Deployments**
2. **Click** the latest deployment
3. **Click** "**Redeploy**" 
4. **Wait** for deployment to complete

---

## **✅ STEP 4: Verify Everything Works**

### **4.1 Check Website**
1. **Visit:** `https://econuru.co.ke`
2. **Login** to admin: `https://econuru.co.ke/admin/login`
3. **Navigate** to orders: `https://econuru.co.ke/admin/orders`

### **4.2 Test M-Pesa Integration**
1. **Find** an unpaid order (or create a test order)
2. **Click** "Process M-Pesa Payment"
3. **Enter** your phone number: `0796030992`
4. **Click** "Send STK Push"
5. **You should receive** STK Push on your phone immediately
6. **Complete** payment with M-Pesa PIN
7. **Order should update** to "Paid" automatically within 5 seconds

### **4.3 Check Payments Dashboard**
1. **Visit:** `https://econuru.co.ke/admin/payments`
2. **Verify** your test payment appears
3. **Check** M-Pesa receipt number is shown
4. **Test** CSV export functionality

---

## **🔍 STEP 5: Production Testing**

### **5.1 Create Test Order**
1. **Visit:** `https://econuru.co.ke/book`
2. **Create** a test order for KES 50
3. **Process** M-Pesa payment from admin
4. **Verify** complete flow works

### **5.2 Verify Callback URL**
Check your Vercel logs to confirm:
```
Using M-Pesa callback URL: https://econuru.co.ke/api/mpesa/callback
```

If you see this, your callback URL is correctly configured.

---

## **🚨 TROUBLESHOOTING**

### **If STK Push Doesn't Come:**
1. **Check** phone number format: `0722123456` (not +254...)
2. **Verify** environment variables are set in Vercel
3. **Check** Vercel function logs for errors
4. **Try** different phone number

### **If Payment Doesn't Update Order:**
1. **Check** Vercel function logs for callback errors
2. **Verify** callback URL is accessible: `https://econuru.co.ke/api/mpesa/callback`
3. **Test** callback endpoint: `GET https://econuru.co.ke/api/mpesa/callback`

### **If "Invalid Callback URL" Error:**
1. **Ensure** `MPESA_CALLBACK_URL=https://econuru.co.ke/api/mpesa/callback`
2. **Redeploy** after adding environment variables
3. **Check** the URL has no extra characters or spaces

---

## **🎉 STEP 6: Go Live**

### **6.1 Update Settings**
1. **Remove** any test orders
2. **Update** admin credentials
3. **Configure** real customer data

### **6.2 Train Staff**
1. **Show** how to process M-Pesa payments
2. **Explain** payments dashboard
3. **Demonstrate** CSV export for accounting

### **6.3 Monitor**
1. **Check** payments dashboard daily
2. **Monitor** Vercel function logs
3. **Cross-reference** with M-Pesa org portal

---

## **📞 SUPPORT RESOURCES**

### **M-Pesa Support:**
- **Business Support:** M-pesabusiness@safaricom.co.ke  
- **API Support:** apisupport@safaricom.co.ke
- **Org Portal:** https://org.ke.m-pesa.com/

### **Vercel Support:**
- **Documentation:** https://vercel.com/docs
- **Support:** https://vercel.com/help

---

## **🎯 SUCCESS CRITERIA**

Your deployment is successful when:

- ✅ **Website loads:** `https://econuru.co.ke`
- ✅ **Admin login works:** `https://econuru.co.ke/admin/login`
- ✅ **STK Push sends:** Customer receives M-Pesa popup
- ✅ **Payments complete:** Orders update automatically
- ✅ **Dashboard shows data:** `https://econuru.co.ke/admin/payments`
- ✅ **CSV export works:** Download payment records

**Your Econuru laundry app is now live with full M-Pesa integration! 🚀** 