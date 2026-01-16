"use client";

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface PDFGeneratorProps {
  data?: {
    title?: string;
    subtitle?: string;
    sections?: Array<{
      title: string;
      content: string | React.ReactNode;
    }>;
  };
}

export function PDFGenerator({ data }: PDFGeneratorProps) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPDF = async () => {
    if (!pdfRef.current) return;

    setIsGenerating(true);
    
    try {
      // Dynamically import jsPDF and html2canvas
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      // Get the element to convert
      const element = pdfRef.current;
      
      // Convert to canvas with high quality
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      // Calculate PDF dimensions (A4: 210mm x 297mm at 72 DPI)
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 297; // A4 height in mm

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content overflows
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const fileName = data?.title 
        ? `${data.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
        : `document-${new Date().toISOString().split('T')[0]}.pdf`;
      
      pdf.save(fileName);

      toast({
        title: "PDF Downloaded",
        description: "Your document has been successfully downloaded.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full">
      {/* Download Button */}
      <div className="mb-6 flex justify-end">
        <Button
          onClick={downloadPDF}
          disabled={isGenerating}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
      </div>

      {/* PDF Content - Used for both preview and PDF generation */}
      {/* Hidden copy for PDF generation (maintains exact A4 dimensions) */}
      <div ref={pdfRef} className="pdf-content-hidden" style={{ 
        position: 'absolute', 
        left: '-9999px',
        top: 0,
        width: '210mm',
        minHeight: '297mm'
      }}>
        <PDFContent data={data} />
      </div>
      
      {/* Preview Content (visible on screen, responsive for web view) */}
      <div className="pdf-preview max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200" style={{
        maxWidth: '210mm',
        width: '100%'
      }}>
        <PDFContent data={data} />
      </div>
    </div>
  );
}

function PDFContent({ data }: PDFGeneratorProps) {
  const defaultData = {
    title: "Modern Document",
    subtitle: "Beautiful PDF generated with React & Next.js",
    sections: [
      {
        title: "Introduction",
        content: "This is a modern, colorful PDF document generated using React components, jsPDF, and html2canvas. The design features vibrant gradients, clean typography, and professional layout."
      },
      {
        title: "Features",
        content: "✨ Colorful gradient headers, 🎨 Soft card shadows, 📱 Responsive design, 🖨️ Print-friendly A4 format, 🎯 Clean typography"
      },
      {
        title: "Customization",
        content: "You can easily customize this PDF by passing custom data through the PDFGenerator component props. All styles are contained within the component for easy modification."
      }
    ],
    ...data
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerGradient}>
          <h1 style={styles.title}>{defaultData.title}</h1>
          <p style={styles.subtitle}>{defaultData.subtitle}</p>
        </div>
      </div>

      {/* Content Sections */}
      <div style={styles.content}>
        {defaultData.sections?.map((section, index) => (
          <div key={index} style={styles.card}>
            <h2 style={styles.cardTitle}>{section.title}</h2>
            <div style={styles.cardContent}>
              {typeof section.content === 'string' ? (
                <p style={styles.cardText}>{section.content}</p>
              ) : (
                section.content
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerText}>
            Generated on {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div style={styles.pageNumber} className="page-number">
            Page 1
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles object for PDF content
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '210mm',
    minHeight: '297mm',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    color: '#1a1a1a',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    boxSizing: 'border-box',
  },
  header: {
    width: '100%',
    marginBottom: '30px',
    position: 'relative',
  },
  headerGradient: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    padding: '40px 30px',
    borderRadius: '0',
    color: '#ffffff',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
  },
  title: {
    fontSize: '42px',
    fontWeight: 700,
    margin: '0 0 12px 0',
    letterSpacing: '-0.5px',
    lineHeight: '1.2',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
  },
  subtitle: {
    fontSize: '18px',
    fontWeight: 400,
    margin: '0',
    opacity: 0.95,
    letterSpacing: '0.3px',
  },
  content: {
    flex: 1,
    padding: '0 30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(102, 126, 234, 0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: 700,
    margin: '0 0 16px 0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.3px',
  },
  cardContent: {
    fontSize: '14px',
    lineHeight: '1.8',
    color: '#4a5568',
  },
  cardText: {
    margin: '0',
    lineHeight: '1.8',
  },
  footer: {
    marginTop: 'auto',
    padding: '24px 30px',
    borderTop: '2px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#64748b',
  },
  footerText: {
    fontWeight: 400,
  },
  pageNumber: {
    fontWeight: 600,
    color: '#667eea',
  },
};

