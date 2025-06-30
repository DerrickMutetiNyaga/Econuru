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
  paymentStatus: 'unpaid' | 'paid' | 'partial';
  laundryStatus: 'to-be-picked' | 'picked' | 'in-progress' | 'ready' | 'delivered';
  status: 'pending' | 'confirmed' | 'in-progress' | 'ready' | 'delivered' | 'cancelled';
  promoCode?: string;
  promoDiscount?: number;
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
    enum: ['unpaid', 'paid', 'partial'],
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
}, {
  timestamps: true,
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema); 