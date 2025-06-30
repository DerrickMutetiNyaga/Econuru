# Automatic Promotion Status Management System

This system automatically updates promotion statuses based on time constraints and usage limits to ensure promotions are always in the correct state.

## How It Works

### Automatic Status Updates

The system automatically checks and updates promotion statuses based on:

1. **Time-based Updates**:
   - `scheduled` → `active` when current time reaches `startDate`
   - `active` → `expired` when current time passes `endDate`

2. **Usage-based Updates**:
   - Any status → `expired` when `usageCount` reaches `usageLimit`

### When Status Updates Occur

Status updates are automatically triggered:

1. **When fetching promotions** (`GET /api/promotions`)
2. **When validating promo codes** (`GET /api/promotions/validate`)
3. **When applying promotions** (`POST /api/promotions/use`)
4. **When manually triggered** via the "Update Statuses" button in admin

## API Endpoints

### 1. Validate Promotion
```http
GET /api/promotions/validate?code=SAVE20
```
**Response:**
```json
{
  "success": true,
  "promotion": {
    "_id": "...",
    "promoCode": "SAVE20",
    "discount": 20,
    "discountType": "percentage",
    "minOrderAmount": 100,
    "maxDiscount": 50
  }
}
```

### 2. Use/Apply Promotion
```http
POST /api/promotions/use
Content-Type: application/json

{
  "promoCode": "SAVE20"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Promotion usage updated successfully",
  "promotion": {
    "_id": "...",
    "promoCode": "SAVE20",
    "usageCount": 15,
    "usageLimit": 100,
    "status": "active"
  }
}
```

## Admin Interface Features

### Status Indicators
- **Green with checkmark**: Active promotion
- **Blue with clock**: Scheduled promotion  
- **Gray with X**: Expired promotion
- **Orange warning**: Status needs updating

### Smart Alerts
The admin interface shows helpful indicators:
- 🚨 **"Should be [status]"** - When status needs updating
- 📊 **"85% used"** - When usage is getting high
- ⏰ **"2 days left"** - When promotion is ending soon
- 🕐 **"Starts in 3 days"** - When promotion starts soon

### Manual Status Update
- Click "Update Statuses" button to manually trigger status checks
- System will show confirmation message after updates

## Integration with Orders

When implementing order processing, use the promotion endpoint:

```javascript
// When applying a promo code to an order
async function applyPromoCode(promoCode, orderAmount) {
  try {
    // First validate the promo code
    const validateRes = await fetch(`/api/promotions/validate?code=${promoCode}`);
    const validateData = await validateRes.json();
    
    if (!validateData.success) {
      throw new Error(validateData.error);
    }
    
    const promotion = validateData.promotion;
    
    // Check minimum order amount
    if (orderAmount < promotion.minOrderAmount) {
      throw new Error(`Minimum order amount is ${promotion.minOrderAmount}`);
    }
    
    // Calculate discount
    let discountAmount;
    if (promotion.discountType === 'percentage') {
      discountAmount = Math.min(
        (orderAmount * promotion.discount) / 100,
        promotion.maxDiscount
      );
    } else {
      discountAmount = Math.min(promotion.discount, promotion.maxDiscount);
    }
    
    // Apply the promotion (increment usage)
    const useRes = await fetch('/api/promotions/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promoCode })
    });
    
    const useData = await useRes.json();
    if (!useData.success) {
      throw new Error(useData.error);
    }
    
    return {
      discountAmount,
      promotion: useData.promotion
    };
    
  } catch (error) {
    console.error('Error applying promo code:', error);
    throw error;
  }
}
```

## Utility Functions

### Server-side Utilities (`lib/promotion-utils.ts`)

```typescript
import { updatePromotionStatuses, incrementPromotionUsage, getPromotionStatusInfo } from '@/lib/promotion-utils';

// Update all promotion statuses
await updatePromotionStatuses();

// Increment usage for a specific promotion
await incrementPromotionUsage(promotionId);

// Get status info for a promotion (client-side safe)
const statusInfo = getPromotionStatusInfo(promotion);
```

### Status Info Object
```typescript
{
  currentStatus: 'active' | 'scheduled' | 'expired' | 'paused',
  suggestedStatus: 'active' | 'scheduled' | 'expired' | 'paused',
  usagePercentage: number, // 0-100
  isUsageLimitReached: boolean,
  isBeforeStart: boolean,
  isAfterEnd: boolean,
  isInTimeRange: boolean,
  daysUntilStart: number,
  daysUntilEnd: number,
  statusMismatch: boolean // true if status needs updating
}
```

## Best Practices

1. **Always validate before applying**: Use the validation endpoint before applying promotions
2. **Handle errors gracefully**: Check for expired/invalid promotions
3. **Monitor usage**: Keep track of promotion performance in admin
4. **Regular updates**: The system auto-updates, but manual triggers can be useful for immediate checks

## Troubleshooting

### Common Issues

1. **Promotion not activating**:
   - Check if start date/time is correct
   - Verify system timezone settings
   - Use "Update Statuses" button

2. **Usage not incrementing**:
   - Ensure you're calling `/api/promotions/use` endpoint
   - Check for validation errors in response

3. **Status showing as mismatch**:
   - This is normal - click "Update Statuses" to sync
   - Status mismatches indicate timing/usage based changes needed

### Logging

The system provides detailed console logs:
- `🔄 Auto-updated X promotion(s)...`
- `⏰ Promotion "Title" started/ended...`
- `📊 Promotion "Title" usage limit reached...`
- `✅ Updated promotion "Title" status...`

## Schema Changes

The Promotion model now includes:
- `updatedBy`: Tracks who last modified the promotion
- Enhanced status tracking and automatic updates

All existing promotions will work with the new system without migration. 