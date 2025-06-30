const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Service model
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['dry-cleaning', 'wash-fold', 'luxury', 'business', 'home-cleaning', 'business-cleaning'],
    required: true,
  },
  price: {
    type: String,
    required: true,
    trim: true,
  },
  turnaround: {
    type: String,
    required: true,
    trim: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    default: '/placeholder.svg',
  },
  features: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);

// Sample services data
const sampleServices = [
  {
    name: "Premium Dry Cleaning",
    description: "Professional dry cleaning for delicate fabrics and formal wear",
    category: "dry-cleaning",
    price: "Ksh 1,299",
    turnaround: "2-3 days",
    active: true,
    featured: true,
    image: "/placeholder.svg",
    features: [
      "Gentle fabric care",
      "Stain removal",
      "Professional pressing",
      "Eco-friendly solvents"
    ]
  },
  {
    name: "Express Wash & Fold",
    description: "Quick and efficient laundry service for everyday clothing",
    category: "wash-fold",
    price: "Ksh 899",
    turnaround: "24 hours",
    active: true,
    featured: false,
    image: "/placeholder.svg",
    features: [
      "Same day service",
      "Fresh scent",
      "Neat folding",
      "Quality detergent"
    ]
  },
  {
    name: "Luxury Garment Care",
    description: "Specialized care for designer and luxury clothing items",
    category: "luxury",
    price: "Ksh 2,499",
    turnaround: "3-5 days",
    active: true,
    featured: true,
    image: "/placeholder.svg",
    features: [
      "Designer fabric expertise",
      "Hand finishing",
      "Premium packaging",
      "Concierge service"
    ]
  },
  {
    name: "Business Laundry",
    description: "Bulk laundry services for businesses and organizations",
    category: "business",
    price: "Ksh 699",
    turnaround: "2-3 days",
    active: true,
    featured: false,
    image: "/placeholder.svg",
    features: [
      "Bulk pricing",
      "Corporate accounts",
      "Scheduled pickup",
      "Volume discounts"
    ]
  },
  {
    name: "Home Deep Cleaning",
    description: "Comprehensive home cleaning services for residential properties",
    category: "home-cleaning",
    price: "Ksh 250",
    turnaround: "1-2 days",
    active: true,
    featured: true,
    image: "/placeholder.svg",
    features: [
      "Deep cleaning",
      "Sanitization",
      "Eco-friendly products",
      "Satisfaction guarantee"
    ]
  },
  {
    name: "Office Cleaning",
    description: "Professional cleaning services for commercial spaces",
    category: "business-cleaning",
    price: "Ksh 300",
    turnaround: "1-3 days",
    active: true,
    featured: false,
    image: "/placeholder.svg",
    features: [
      "Commercial grade cleaning",
      "Flexible scheduling",
      "Certified cleaners",
      "Insurance covered"
    ]
  }
];

async function seedServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing services
    await Service.deleteMany({});
    console.log('Cleared existing services');

    // Insert sample services
    const insertedServices = await Service.insertMany(sampleServices);
    console.log(`Inserted ${insertedServices.length} services`);

    console.log('Services seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding services:', error);
    process.exit(1);
  }
}

seedServices(); 