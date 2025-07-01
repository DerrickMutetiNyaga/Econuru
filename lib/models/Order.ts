import mongoose from 'mongoose';

export interface IOrder extends mongoose.Document {
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  services: Array<{
    serviceId: string;
    serviceName: string;
    quantity: number;
    price: string;
  }>;
  pickupDate?: string;
  pickupTime?: string;
  notes?: string;
  location: string;
  totalAmount: number;
  pickDropAmount: number;
  discount: number;
  paymentStatus: 'unpaid' | 'paid' | 'partial' | 'pending' | 'failed';
  laundryStatus: 'to-be-picked' | 'picked' | 'in-progress' | 'ready' | 'delivered';
  status: 'pending' | 'confirmed' | 'in-progress' | 'ready' | 'delivered' | 'cancelled';
  promoCode?: string;
  promoDiscount?: number;
  promotionDetails?: {
    promotionId: string;
    promoCode: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
    minOrderAmount: number;
    maxDiscount: number;
    appliedAt: Date;
    lockedIn: boolean;
  };
  // M-Pesa payment fields (top level)
  checkoutRequestId?: string;
  mpesaReceiptNumber?: string;
  transactionDate?: Date;
  phoneNumber?: string;
  amountPaid?: number;
  resultCode?: number;
  resultDescription?: string;
  paymentInitiatedAt?: Date;
  paymentCompletedAt?: Date;
  // M-Pesa payment fields (nested - for backward compatibility)
  mpesaPayment?: {
    checkoutRequestId?: string;
    mpesaReceiptNumber?: string;
    transactionDate?: Date;
    phoneNumber?: string;
    amountPaid?: number;
    resultCode?: number;
    resultDescription?: string;
    paymentInitiatedAt?: Date;
    paymentCompletedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new mongoose.Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  services: [{
    serviceId: {
      type: String,
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: String,
      required: true,
    },
  }],
  pickupDate: {
    type: String,
  },
  pickupTime: {
    type: String,
  },
  notes: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    default: 'main-branch',
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  pickDropAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'partial', 'pending', 'failed'],
    required: true,
  },
  laundryStatus: {
    type: String,
    enum: ['to-be-picked', 'picked', 'in-progress', 'ready', 'delivered'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'ready', 'delivered', 'cancelled'],
    default: 'pending',
  },
  promoCode: {
    type: String,
    trim: true,
  },
  promoDiscount: {
    type: Number,
    min: 0,
  },
  promotionDetails: {
    promotionId: String,
    promoCode: String,
    discount: Number,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed']
    },
    minOrderAmount: Number,
    maxDiscount: Number,
    appliedAt: {
      type: Date,
      default: Date.now
    },
    lockedIn: {
      type: Boolean,
      default: false
    }
  },
  // M-Pesa payment fields (top level)
  checkoutRequestId: String,
  mpesaReceiptNumber: String,
  transactionDate: Date,
  phoneNumber: String,
  amountPaid: Number,
  resultCode: Number,
  resultDescription: String,
  paymentInitiatedAt: Date,
  paymentCompletedAt: Date,
  // M-Pesa payment fields (nested - for backward compatibility)
  mpesaPayment: {
    checkoutRequestId: String,
    mpesaReceiptNumber: String,
    transactionDate: Date,
    phoneNumber: String,
    amountPaid: Number,
    resultCode: Number,
    resultDescription: String,
    paymentInitiatedAt: Date,
    paymentCompletedAt: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema); 