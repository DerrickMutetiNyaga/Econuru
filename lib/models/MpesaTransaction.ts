import mongoose from 'mongoose';

const MpesaTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  mpesaReceiptNumber: {
    type: String,
    required: true
  },
  transactionDate: {
    type: Date,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  transactionType: {
    type: String,
    required: true
  },
  billRefNumber: {
    type: String,
    default: ''
  },
  thirdPartyTransID: {
    type: String,
    default: ''
  },
  orgAccountBalance: {
    type: String,
    default: ''
  },
  customerName: {
    type: String,
    required: true
  },
  paymentCompletedAt: {
    type: Date,
    required: true
  },
  // Connection status
  isConnectedToOrder: {
    type: Boolean,
    default: false
  },
  connectedOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  connectedAt: {
    type: Date,
    default: null
  },
  connectedBy: {
    type: String,
    default: null
  },
  // Metadata
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
MpesaTransactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for better performance
MpesaTransactionSchema.index({ transactionId: 1 });
MpesaTransactionSchema.index({ mpesaReceiptNumber: 1 });
MpesaTransactionSchema.index({ phoneNumber: 1 });
MpesaTransactionSchema.index({ isConnectedToOrder: 1 });
MpesaTransactionSchema.index({ transactionDate: -1 });

export default mongoose.models.MpesaTransaction || mongoose.model('MpesaTransaction', MpesaTransactionSchema); 