"use client";

import { PDFGenerator } from '@/components/pdf-generator';

export default function PDFDemoPage() {
  const sampleData = {
    title: "Econuru Laundry Services",
    subtitle: "Premium Laundry & Dry Cleaning Solutions",
    sections: [
      {
        title: "Welcome to Econuru",
        content: "We provide professional laundry and dry cleaning services with attention to detail and customer satisfaction. Our state-of-the-art facilities ensure your garments receive the best care possible."
      },
      {
        title: "Our Services",
        content: "🔄 Wash & Fold - Professional washing and folding service\n👔 Dry Cleaning - Expert care for delicate garments\n✨ Ironing - Crisp, professional pressing\n🛏️ Bedding & Linens - Specialized cleaning for home textiles\n⚡ Express Service - Fast turnaround for urgent needs"
      },
      {
        title: "Why Choose Us",
        content: "✅ Premium quality fabrics care\n✅ Environmentally friendly processes\n✅ Convenient pickup and delivery\n✅ Competitive pricing\n✅ 100% satisfaction guarantee"
      },
      {
        title: "Contact Information",
        content: "📞 Phone: +254 757 883 799\n✉️ Email: econuruservices@gmail.com\n📍 Location: Kenya\n💳 M-Pesa Till: 5251257"
      },
      {
        title: "Quality Assurance",
        content: "Every item we process goes through our quality control system. We use eco-friendly detergents and state-of-the-art equipment to ensure your clothes look and feel their best. Your satisfaction is our priority."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            PDF Generator Demo
          </h1>
          <p className="text-gray-600">
            Click the button below to download a beautiful PDF document
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <PDFGenerator data={sampleData} />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Preview Content</h2>
          <div className="space-y-6">
            {sampleData.sections.map((section, index) => (
              <div key={index} className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{section.title}</h3>
                <p className="text-gray-600 whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

