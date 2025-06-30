# 🚀 ECONURU PRODUCTION SETUP GUIDE

## 🎯 Performance Optimizations Implemented

### ✅ Banner Loading Optimization
- **Priority Loading**: Banners load first with high priority
- **API Caching**: 5-minute cache for banner API responses  
- **Timeout Protection**: 8-second timeout to prevent hanging
- **Lean Queries**: Only fetch essential fields for homepage
- **Performance Logging**: Detailed timing logs for debugging

### ✅ Database Optimization
- **Connection Pooling**: `maxPoolSize=10&minPoolSize=2`
- **Lean Queries**: Use `.lean()` for better performance
- **Field Projection**: Only fetch required fields
- **Query Timeout**: 5-second timeout protection

## 🔧 Environment Configuration

### Production Environment Variables
```bash
# MongoDB (Production with optimizations)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/econuru-production?retryWrites=true&w=majority&maxPoolSize=10&minPoolSize=2

# Security
JWT_SECRET=YOUR_SUPER_SECURE_JWT_SECRET_512_BITS
NEXTAUTH_URL=https://econuru.co.ke
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET

# Cloudinary (Production)
CLOUDINARY_CLOUD_NAME=your-prod-cloud-name
CLOUDINARY_API_KEY=your-prod-api-key
CLOUDINARY_API_SECRET=your-prod-api-secret

# Domains
NEXT_PUBLIC_APP_URL=https://econuru.co.ke
NEXT_PUBLIC_API_URL=https://econuru.co.ke/api

# Kenya SMS (Zettatel)
SMS_USER_ID=your-zettatel-username
SMS_PASSWORD=your-zettatel-password
SMS_SENDER_ID=ECONURU

# WhatsApp Business
WHATSAPP_NUMBER=+254757883799

# Performance
ENABLE_API_CACHE=true
DB_QUERY_TIMEOUT=5000
MAX_FILE_SIZE=10
NODE_ENV=production
```

## 🚀 Vercel Deployment Steps

### 1. Environment Variables Setup
```bash
# In Vercel Dashboard → Project → Settings → Environment Variables
# Add all production environment variables listed above
```

### 2. Domain Configuration
```bash
# In Vercel Dashboard → Project → Settings → Domains
# Add: econuru.co.ke
# Add: www.econuru.co.ke (redirect to main)
```

### 3. Performance Settings
```bash
# In Vercel Dashboard → Project → Settings → Functions
# Region: Kenya/Africa (closest to users)
# Memory: 1024 MB (for better performance)
# Timeout: 10 seconds
```

## 📊 Performance Monitoring

### API Response Time Targets
- **Banners API**: < 2 seconds ✅ (was 8+ seconds)
- **Services API**: < 3 seconds
- **Gallery API**: < 3 seconds
- **Promotions API**: < 2 seconds

### Homepage Loading Sequence
1. **Priority 1**: Banners (immediate) 🎯
2. **Priority 2**: Services (100ms delay)
3. **Priority 3**: Testimonials & Promotions (300ms delay)
4. **Priority 4**: Gallery (500ms delay)

## 🛡️ Security Checklist

### ✅ Completed
- [x] Admin-only login API
- [x] Role-based access control
- [x] JWT token validation
- [x] Page permission system
- [x] Input validation & sanitization

### 🔒 Production Security
- [ ] Generate strong JWT secret (512-bit)
- [ ] Enable HTTPS redirect
- [ ] Set secure cookie flags
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Enable CSP headers

## 🇰🇪 Kenya-Specific Configuration

### SMS Integration (Zettatel)
```javascript
// SMS provider optimized for Kenya
SMS_SENDER_ID=ECONURU
WHATSAPP_NUMBER=+254757883799
```

### Domain Setup
```bash
# Main domain
https://econuru.co.ke

# Subdomain options
https://admin.econuru.co.ke (admin panel)
https://api.econuru.co.ke (API endpoints)
```

## 🎯 Performance Results

### Before Optimization
```
GET /api/banners?active=true 200 in 8486ms ❌
```

### After Optimization  
```
🎯 Banner API: Starting fetch...
🔗 Banner API: DB connected in 145ms
📊 Banner API: Query executed in 89ms
✅ Banner API: Total time 234ms ✅
```

**Performance Improvement: 97% faster! (8.5s → 0.2s)**

## 🚀 Deployment Commands

### Local Testing
```bash
npm run build
npm run start
```

### Production Deploy
```bash
git add .
git commit -m "Performance optimizations for econuru.co.ke"
git push origin main
# Vercel auto-deploys from main branch
```

## 📈 Monitoring & Analytics

### Performance Monitoring
- Monitor API response times in Vercel dashboard
- Set up alerts for >5 second response times
- Track user engagement metrics

### Health Check Endpoint
```bash
curl https://econuru.co.ke/api/health
```

## 🆘 Troubleshooting

### Common Issues
1. **Slow banner loading**: Check MongoDB connection pooling
2. **API timeouts**: Verify environment variables
3. **Image loading**: Confirm Cloudinary configuration
4. **SMS not working**: Test Zettatel credentials

### Debug Commands
```bash
# Check API performance
curl -w "@curl-format.txt" https://econuru.co.ke/api/banners?active=true

# Monitor logs
vercel logs --follow
```

---

**🎉 Ready for Production!** 
Econuru is now optimized for **econuru.co.ke** with Kenya-specific configurations and enterprise-grade performance! 