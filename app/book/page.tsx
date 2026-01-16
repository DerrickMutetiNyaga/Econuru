"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaTshirt, 
  FaShoppingBag, 
  FaHashtag, 
  FaCalendarAlt, 
  FaClock, 
  FaInfoCircle,
  FaCheck,
  FaArrowRight,
  FaArrowLeft
} from "react-icons/fa";
import Select from 'react-select';
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const SERVICES = [
  "Wash & Fold",
  "Dry Cleaning",
  "Ironing",
  "Bedding & Linens",
  "Express Service",
  "Other"
];

const LAUNDRY_BAGS = [
  "I have my own laundry bag",
  "I need small laundry bag",
  "I need medium laundry bag",
  "I need large laundry bag"
];

const SPECIAL_ITEMS = [
  "Mats",
  "Carpet",
  "Duvet",
  "Blanket"
];

export default function BookPage() {
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [errors, setErrors] = useState({});
  const [isBooking, setIsBooking] = useState(false);
  
  // Promo code validation state
  const [promoValid, setPromoValid] = useState(null);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    services: [],
    date: "",
    time: "",
    notes: "",
    laundryBag: "",
    baskets: 0,
    specialItems: [],
    moreInfo: "",
    dontKnowService: false,
    promoCode: "",
  });
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [isCheckingCustomer, setIsCheckingCustomer] = useState(false);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (data.success) {
          setServices(data.services.filter((s) => s.active));
        }
      } catch (e) {
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    }
    fetchServices();
  }, []);

  // Function to lookup customer by phone
  const lookupCustomer = async (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (!cleaned || cleaned.length < 10) {
      setIsExistingCustomer(false);
      return;
    }

    setIsCheckingCustomer(true);
    try {
      const response = await fetch(`/api/customers?phone=${encodeURIComponent(phone.trim())}`);
      const data = await response.json();
      
      if (data.success && data.customers && data.customers.length > 0) {
        const customer = data.customers[0];
        setIsExistingCustomer(true);
        setForm((prev) => ({
          ...prev,
          name: customer.name || prev.name,
          email: customer.email || prev.email,
          address: customer.address || prev.address,
        }));
      } else {
        setIsExistingCustomer(false);
      }
    } catch (error) {
      console.error("Error looking up customer:", error);
      setIsExistingCustomer(false);
    } finally {
      setIsCheckingCustomer(false);
    }
  };

  // Debounced phone lookup effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (form.phone.trim().length >= 10) {
        lookupCustomer(form.phone);
      } else {
        setIsExistingCustomer(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [form.phone]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    
    if (name === "services") {
      setForm((prev) => {
        let updated = prev.services.includes(value)
          ? prev.services.filter((s) => s !== value)
          : [...prev.services, value];
        return { ...prev, services: updated, dontKnowService: false };
      });
    } else if (name === "dontKnowService") {
      setForm((prev) => ({ ...prev, dontKnowService: checked, services: checked ? [] : prev.services }));
    } else if (type === "checkbox" && name === "specialItems") {
      setForm((prev) => {
        const items = prev.specialItems.includes(value)
          ? prev.specialItems.filter((item) => item !== value)
          : [...prev.specialItems, value];
        return { ...prev, specialItems: items };
      });
    } else if (type === "number") {
      setForm((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  // Promo code validation function
  const validatePromoCode = async (code) => {
    if (!code.trim()) {
      setPromoValid(null);
      setPromoMessage("");
      return;
    }

    setPromoLoading(true);
    try {
      const response = await fetch(`/api/promotions/validate?code=${encodeURIComponent(code.trim())}`);
      const data = await response.json();
      
      if (data.success && data.promotion) {
        setPromoValid(true);
        setPromoMessage(`Valid promo code! ${data.promotion.discountType === 'percentage' ? `${data.promotion.discount}% off` : `Ksh ${data.promotion.discount} off`}`);
      } else {
        setPromoValid(false);
        setPromoMessage(data.error || "Invalid or expired promo code");
      }
    } catch (error) {
      setPromoValid(false);
      setPromoMessage("Error validating promo code");
    } finally {
      setPromoLoading(false);
    }
  };

  // Debounced promo code validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (form.promoCode.trim()) {
        validatePromoCode(form.promoCode);
      } else {
        setPromoValid(null);
        setPromoMessage("");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [form.promoCode]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (isBooking) return;
    setIsBooking(true);
    if (!validateStep3()) {
      setIsBooking(false);
      return;
    }
    
    const selectedServices = (form.dontKnowService
      ? []
      : services.filter((s) => form.services.includes(s._id)).map((s) => ({
          serviceId: s._id,
          serviceName: s.name,
          quantity: 1,
          price: s.price,
        }))
    );
    const orderData = {
      customer: {
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
      },
      services: selectedServices,
      pickupDate: form.date,
      pickupTime: form.time,
      notes: form.moreInfo,
      location: 'main-branch',
      totalAmount: 0,
      pickDropAmount: 0,
      discount: 0,
      paymentStatus: 'unpaid',
      laundryStatus: 'to-be-picked',
      status: 'pending',
      promoCode: form.promoCode.trim() || undefined,
    };
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.error || 'Failed to submit order.');
      }
    } catch (err) {
      alert('Failed to submit order. Please try again.');
    } finally {
      setIsBooking(false);
    }
  }

  function validateStep1() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateStep2() {
    const newErrors = {};
    if (!form.dontKnowService && form.services.length === 0) {
      newErrors.services = "Please select at least one service or choose 'I don't know'";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateStep3() {
    const newErrors = {};
    if (!form.date) newErrors.date = "Pickup date is required";
    if (!form.time) newErrors.time = "Pickup time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function nextStep() {
    let isValid = false;
    if (step === 1) {
      isValid = validateStep1();
    } else if (step === 2) {
      isValid = validateStep2();
    }
    
    if (isValid) {
      setStep((s) => Math.min(s + 1, 3));
      setErrors({});
    }
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
    setErrors({});
  }

  const isLaundrySelected = form.services.some((s) => {
    const service = services.find((srv) => srv._id === s);
    return service && !service.category.includes('cleaning');
  });

  const steps = [
    { number: 1, label: "Contact", icon: FaUser },
    { number: 2, label: "Services", icon: FaTshirt },
    { number: 3, label: "Schedule", icon: FaCalendarAlt },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
        <div className="container mx-auto px-4 pt-24 md:pt-28 pb-12 md:pb-16 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
              Book Your Service
            </h1>
            <p className="text-lg text-slate-600">
              Quick and easy booking in 3 simple steps
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {submitted ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Booking Confirmed!</h2>
                <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                  Thank you for your booking. We'll contact you shortly to confirm the details.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Progress Steps */}
                <div className="border-b border-slate-200 bg-slate-50/50 px-6 md:px-10 py-6">
                  <div className="flex items-center justify-between max-w-2xl mx-auto">
                    {steps.map((stepItem, idx) => {
                      const isActive = step === stepItem.number;
                      const isCompleted = step > stepItem.number;
                      const Icon = stepItem.icon;
                      
                      return (
                        <div key={stepItem.number} className="flex items-center flex-1">
                          <div className="flex flex-col items-center flex-1">
                            <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isActive 
                                ? 'bg-slate-900 text-white shadow-lg scale-110' 
                                : isCompleted
                                ? 'bg-green-600 text-white'
                                : 'bg-white border-2 border-slate-300 text-slate-400'
                            }`}>
                              {isCompleted ? (
                                <FaCheck className="w-5 h-5" />
                              ) : (
                                <Icon className="w-5 h-5" />
                              )}
                            </div>
                            <span className={`mt-2 text-xs font-semibold ${
                              isActive ? 'text-slate-900' : isCompleted ? 'text-green-600' : 'text-slate-400'
                            }`}>
                              {stepItem.label}
                            </span>
                          </div>
                          {idx < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-4 transition-colors ${
                              isCompleted ? 'bg-green-600' : 'bg-slate-200'
                            }`}></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6 md:p-10">
                  {/* Step 1: Contact Information */}
                  {step === 1 && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Contact Information</h2>
                        <p className="text-slate-600">We'll use this to reach you and confirm your booking</p>
                      </div>

                      <div className="space-y-5">
                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <FaPhone className="w-4 h-4" />
                            </div>
                            <input
                              type="tel"
                              name="phone"
                              required
                              value={form.phone}
                              onChange={handleChange}
                              className={`w-full pl-11 pr-12 py-3.5 rounded-lg border-2 transition-all ${
                                isExistingCustomer 
                                  ? 'border-green-500 bg-green-50/50' 
                                  : errors.phone
                                  ? 'border-red-300 bg-red-50/50'
                                  : 'border-slate-200 bg-white hover:border-slate-300 focus:border-slate-900'
                              } focus:outline-none focus:ring-2 focus:ring-slate-900/10`}
                              placeholder="0712 345 678"
                            />
                            {isCheckingCustomer && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                              </div>
                            )}
                            {isExistingCustomer && !isCheckingCustomer && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              </div>
                            )}
                          </div>
                          {errors.phone && (
                            <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              {errors.phone}
                            </p>
                          )}
                          {isExistingCustomer && !isCheckingCustomer && (
                            <p className="text-green-600 text-sm mt-1.5 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              Welcome back! Your details have been auto-filled.
                            </p>
                          )}
                        </div>

                        {/* Name */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <FaUser className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              name="name"
                              required
                              value={form.name}
                              onChange={handleChange}
                              className={`w-full pl-11 pr-4 py-3.5 rounded-lg border-2 transition-all ${
                                isExistingCustomer 
                                  ? 'border-green-500 bg-green-50/50' 
                                  : errors.name
                                  ? 'border-red-300 bg-red-50/50'
                                  : 'border-slate-200 bg-white hover:border-slate-300 focus:border-slate-900'
                              } focus:outline-none focus:ring-2 focus:ring-slate-900/10`}
                              placeholder="John Doe"
                            />
                          </div>
                          {errors.name && (
                            <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              {errors.name}
                            </p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Email Address <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <FaEnvelope className="w-4 h-4" />
                            </div>
                            <input
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              className={`w-full pl-11 pr-4 py-3.5 rounded-lg border-2 transition-all ${
                                isExistingCustomer 
                                  ? 'border-green-500 bg-green-50/50' 
                                  : 'border-slate-200 bg-white hover:border-slate-300 focus:border-slate-900'
                              } focus:outline-none focus:ring-2 focus:ring-slate-900/10`}
                              placeholder="john@example.com"
                            />
                          </div>
                        </div>

                        {/* Address */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Pickup Address <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <FaMapMarkerAlt className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              name="address"
                              required
                              value={form.address}
                              onChange={handleChange}
                              className={`w-full pl-11 pr-4 py-3.5 rounded-lg border-2 transition-all ${
                                isExistingCustomer 
                                  ? 'border-green-500 bg-green-50/50' 
                                  : errors.address
                                  ? 'border-red-300 bg-red-50/50'
                                  : 'border-slate-200 bg-white hover:border-slate-300 focus:border-slate-900'
                              } focus:outline-none focus:ring-2 focus:ring-slate-900/10`}
                              placeholder="123 Main Street, Nairobi"
                            />
                          </div>
                          {errors.address && (
                            <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              {errors.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Services */}
                  {step === 2 && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Services</h2>
                        <p className="text-slate-600">Choose the services you need</p>
                      </div>

                      <div className="space-y-6">
                        {/* Services Select */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Services <span className="text-red-500">*</span>
                          </label>
                          <Select
                            isMulti
                            isClearable={false}
                            isLoading={loadingServices}
                            options={[
                              ...services.map((service) => ({ value: service._id, label: service.name })),
                              { value: 'dontknow', label: "I don't know" },
                            ]}
                            value={
                              form.dontKnowService
                                ? [{ value: 'dontknow', label: "I don't know" }]
                                : services
                                    .filter((s) => form.services.includes(s._id))
                                    .map((s) => ({ value: s._id, label: s.name }))
                            }
                            onChange={(selected) => {
                              if (!selected) {
                                setForm((f) => ({ ...f, services: [], dontKnowService: false }));
                              } else if (Array.isArray(selected)) {
                                const hasDontKnow = selected.some((opt) => opt.value === 'dontknow');
                                setForm((f) => ({
                                  ...f,
                                  services: hasDontKnow ? [] : selected.map((opt) => opt.value),
                                  dontKnowService: hasDontKnow,
                                }));
                              }
                            }}
                            classNamePrefix="select"
                            placeholder="Select services..."
                            styles={{
                              control: (base, state) => ({
                                ...base,
                                borderRadius: '0.5rem',
                                borderColor: errors.services ? '#fca5a5' : state.isFocused ? '#0f172a' : '#e2e8f0',
                                borderWidth: '2px',
                                background: '#fff',
                                minHeight: '48px',
                                boxShadow: state.isFocused ? '0 0 0 3px rgba(15, 23, 42, 0.1)' : 'none',
                                '&:hover': {
                                  borderColor: errors.services ? '#fca5a5' : '#0f172a',
                                },
                              }),
                              multiValue: (base) => ({
                                ...base,
                                background: '#0f172a',
                                borderRadius: '0.375rem',
                              }),
                              multiValueLabel: (base) => ({
                                ...base,
                                color: '#fff',
                                fontWeight: 500,
                                padding: '4px 8px',
                              }),
                              multiValueRemove: (base) => ({
                                ...base,
                                color: '#fff',
                                borderRadius: '0 0.375rem 0.375rem 0',
                                ':hover': { background: '#1e293b', color: '#fff' },
                              }),
                              option: (base, state) => ({
                                ...base,
                                background: state.isSelected 
                                  ? '#0f172a' 
                                  : state.isFocused 
                                  ? '#f1f5f9' 
                                  : '#fff',
                                color: state.isSelected ? '#fff' : '#1e293b',
                                padding: '10px 14px',
                                borderRadius: '0.375rem',
                                margin: '2px 0',
                              }),
                            }}
                          />
                          {errors.services && (
                            <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              {errors.services}
                            </p>
                          )}
                        </div>

                        {/* Laundry Bag */}
                        {isLaundrySelected && (
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Laundry Bag
                            </label>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <FaShoppingBag className="w-4 h-4" />
                              </div>
                              <select
                                name="laundryBag"
                                value={form.laundryBag}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3.5 rounded-lg border-2 border-slate-200 bg-white hover:border-slate-300 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
                              >
                                <option value="">Select laundry bag option</option>
                                <option value="I have my own laundry bag">I have my own laundry bag</option>
                                <option value="I need small laundry bag">I need small laundry bag</option>
                                <option value="I need medium laundry bag">I need medium laundry bag</option>
                                <option value="I need large laundry bag">I need large laundry bag</option>
                                <option value="I don't need a laundry bag">I don't need a laundry bag</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Number of Baskets */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Number of Baskets
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <FaHashtag className="w-4 h-4" />
                            </div>
                            <input
                              type="number"
                              name="baskets"
                              min={0}
                              value={form.baskets}
                              onChange={handleChange}
                              className="w-full pl-11 pr-4 py-3.5 rounded-lg border-2 border-slate-200 bg-white hover:border-slate-300 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {/* Special Items */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Special Items
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {SPECIAL_ITEMS.map((item) => (
                              <label
                                key={item}
                                className={`flex items-center gap-2.5 p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                                  form.specialItems.includes(item)
                                    ? 'border-slate-900 bg-slate-900 text-white'
                                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  name="specialItems"
                                  value={item}
                                  checked={form.specialItems.includes(item)}
                                  onChange={handleChange}
                                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                />
                                <span className="text-sm font-medium">{item}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Schedule */}
                  {step === 3 && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Schedule Pickup</h2>
                        <p className="text-slate-600">When would you like us to pick up your laundry?</p>
                      </div>

                      <div className="space-y-5">
                        {/* Additional Notes */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Additional Notes <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-4 text-slate-400">
                              <FaInfoCircle className="w-4 h-4" />
                            </div>
                            <textarea
                              name="moreInfo"
                              value={form.moreInfo}
                              onChange={handleChange}
                              rows={4}
                              className="w-full pl-11 pr-4 py-3.5 rounded-lg border-2 border-slate-200 bg-white hover:border-slate-300 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all resize-none"
                              placeholder="Any special instructions, access codes, or additional details..."
                            />
                          </div>
                        </div>

                        {/* Promo Code */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Promo Code <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <FaHashtag className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              name="promoCode"
                              value={form.promoCode}
                              onChange={handleChange}
                              className={`w-full pl-11 pr-12 py-3.5 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 ${
                                promoValid === true 
                                  ? 'border-green-500 bg-green-50/50 focus:ring-green-500/20' 
                                  : promoValid === false 
                                  ? 'border-red-300 bg-red-50/50 focus:ring-red-500/20' 
                                  : 'border-slate-200 bg-white hover:border-slate-300 focus:border-slate-900 focus:ring-slate-900/10'
                              }`}
                              placeholder="Enter promo code"
                              autoComplete="off"
                            />
                            {promoLoading && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                              </div>
                            )}
                            {promoValid === true && !promoLoading && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              </div>
                            )}
                            {promoValid === false && !promoLoading && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <XCircle className="w-5 h-5 text-red-500" />
                              </div>
                            )}
                          </div>
                          {promoMessage && (
                            <p className={`text-sm mt-1.5 flex items-center gap-1.5 ${
                              promoValid === true ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {promoValid === true ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                              {promoMessage}
                            </p>
                          )}
                        </div>

                        {/* Date and Time */}
                        <div className="grid md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Pickup Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <FaCalendarAlt className="w-4 h-4" />
                              </div>
                              <input
                                type="date"
                                name="date"
                                required
                                value={form.date}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full pl-11 pr-4 py-3.5 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${
                                  errors.date
                                    ? 'border-red-300 bg-red-50/50'
                                    : 'border-slate-200 bg-white hover:border-slate-300 focus:border-slate-900'
                                }`}
                              />
                            </div>
                            {errors.date && (
                              <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" />
                                {errors.date}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Pickup Time <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <FaClock className="w-4 h-4" />
                              </div>
                              <input
                                type="time"
                                name="time"
                                required
                                value={form.time}
                                onChange={handleChange}
                                className={`w-full pl-11 pr-4 py-3.5 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${
                                  errors.time
                                    ? 'border-red-300 bg-red-50/50'
                                    : 'border-slate-200 bg-white hover:border-slate-300 focus:border-slate-900'
                                }`}
                              />
                            </div>
                            {errors.time && (
                              <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" />
                                {errors.time}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center pt-8 mt-8 border-t border-slate-200 px-6 md:px-10 pb-6 md:pb-10">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-700 font-semibold bg-white hover:bg-slate-50 hover:border-slate-400 transition-all"
                      >
                        <FaArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                    ) : (
                      <div></div>
                    )}
                    {step < 3 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center gap-2 px-8 py-3 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
                      >
                        Continue
                        <FaArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isBooking}
                        className="flex items-center gap-2 px-8 py-3 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isBooking ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaCheck className="w-4 h-4" />
                            Confirm Booking
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
