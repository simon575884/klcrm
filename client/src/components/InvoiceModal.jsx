import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';

function InvoiceModal({ repairId, onClose }) {
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    fetchInvoice();
  }, [repairId]);

  const fetchInvoice = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`/api/invoices/${repairId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoiceData(response.data);
    } catch (error) {
      console.error('Failed to fetch invoice', error);
    }
  };

  const generatePDF = () => {
    if (!invoiceData) return;

    const doc = new jsPDF();
    const { invoice, repairJob } = invoiceData;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(10, 26, 60);
    doc.text('K&L 24 HOUR MOBILE TIRE', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('& ROADSIDE SERVICE', 105, 28, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('1470 Bella Vista Dr, Columbia, SC 29223', 105, 36, { align: 'center' });
    doc.text('Phone: 803-477-1467', 105, 42, { align: 'center' });
    doc.text('Email: klmobileexp@yahoo.com', 105, 48, { align: 'center' });

    doc.line(20, 52, 190, 52);

    // Invoice Info
    doc.setFontSize(14);
    doc.setTextColor(229, 57, 53);
    doc.text('INVOICE', 20, 62);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice #: ${invoice.invoice_number}`, 20, 70);
    doc.text(`Date: ${new Date(invoice.generated_at).toLocaleDateString()}`, 20, 76);

    // Customer Info
    doc.setFontSize(12);
    doc.text('BILL TO:', 20, 90);
    doc.setFontSize(10);
    doc.text(repairJob.customer_name, 20, 98);
    doc.text(`Phone: ${repairJob.customer_phone}`, 20, 104);
    if (repairJob.customer_email) doc.text(`Email: ${repairJob.customer_email}`, 20, 110);
    if (repairJob.customer_address) doc.text(repairJob.customer_address, 20, 116);

    // Vehicle Info
    doc.setFontSize(12);
    doc.text('VEHICLE:', 120, 90);
    doc.setFontSize(10);
    doc.text(repairJob.car_model, 120, 98);
    doc.text(`Plate: ${repairJob.number_plate}`, 120, 104);
    doc.text(`Year: ${repairJob.manufacturing_year}`, 120, 110);

    // Service Details
    doc.line(20, 125, 190, 125);
    doc.setFontSize(12);
    doc.text('SERVICE DETAILS', 20, 135);
    
    doc.setFontSize(10);
    doc.text('Problem:', 20, 145);
    const problemLines = doc.splitTextToSize(repairJob.problem_description, 170);
    doc.text(problemLines, 20, 151);

    let yPos = 151 + (problemLines.length * 6);
    
    if (repairJob.repair_details) {
      doc.text('Repair Details:', 20, yPos + 6);
      const detailLines = doc.splitTextToSize(repairJob.repair_details, 170);
      doc.text(detailLines, 20, yPos + 12);
      yPos += 12 + (detailLines.length * 6);
    }

    // Payment Details
    yPos += 10;
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.text('Repair Cost:', 120, yPos);
    doc.text(`${parseFloat(repairJob.repair_cost).toFixed(2)}`, 170, yPos, { align: 'right' });
    
    yPos += 8;
    doc.text('Payment Amount:', 120, yPos);
    doc.text(`${parseFloat(repairJob.payment_amount).toFixed(2)}`, 170, yPos, { align: 'right' });
    
    yPos += 8;
    doc.text('Payment Method:', 120, yPos);
    doc.text(repairJob.payment_method || 'N/A', 170, yPos, { align: 'right' });
    
    yPos += 8;
    doc.text('Payment Status:', 120, yPos);
    doc.setTextColor(repairJob.payment_status === 'Paid' ? 46 : 211, repairJob.payment_status === 'Paid' ? 125 : 47, repairJob.payment_status === 'Paid' ? 50 : 47);
    doc.text(repairJob.payment_status, 170, yPos, { align: 'right' });

    // Footer
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });

    return doc;
  };

  const handleDownload = () => {
    const doc = generatePDF();
    doc.save(`Invoice-${invoiceData.invoice.invoice_number}.pdf`);
  };

  const handlePrint = () => {
    const doc = generatePDF();
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  if (!invoiceData) return null;

  const { invoice, repairJob } = invoiceData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
      <div className="bg-darkCard rounded-xl w-full max-w-3xl my-8 border border-borderColor shadow-2xl animate-slide-in">
        <div className="flex justify-between items-center p-6 border-b border-borderColor">
          <h2 className="text-2xl font-bold text-textPrimary">Invoice</h2>
          <div className="flex gap-2">
            <button onClick={handleDownload} className="btn-primary flex items-center gap-2">
              <Download size={18} /> Download PDF
            </button>
            <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
              <Printer size={18} /> Print
            </button>
            <button onClick={onClose} className="text-textSecondary hover:text-textPrimary transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Invoice Preview */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-danger">K&L 24 HOUR MOBILE TIRE</h1>
            <p className="text-lg text-textPrimary">& ROADSIDE SERVICE</p>
            <p className="text-sm text-textSecondary mt-2">1470 Bella Vista Dr, Columbia, SC 29223</p>
            <p className="text-sm text-textSecondary">Phone: 803-477-1467 | Email: klmobileexp@yahoo.com</p>
          </div>

          <div className="border-t border-b border-borderColor py-4 mb-6">
            <div className="flex justify-between">
              <div>
                <p className="text-lg font-bold text-danger">INVOICE</p>
                <p className="text-sm text-textSecondary">Invoice #: {invoice.invoice_number}</p>
                <p className="text-sm text-textSecondary">Date: {new Date(invoice.generated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="font-bold text-textPrimary mb-2">BILL TO:</h3>
              <p className="text-textPrimary">{repairJob.customer_name}</p>
              <p className="text-sm text-textSecondary">Phone: {repairJob.customer_phone}</p>
              {repairJob.customer_email && <p className="text-sm text-textSecondary">Email: {repairJob.customer_email}</p>}
              {repairJob.customer_address && <p className="text-sm text-textSecondary">{repairJob.customer_address}</p>}
            </div>
            <div>
              <h3 className="font-bold text-textPrimary mb-2">VEHICLE:</h3>
              <p className="text-textPrimary">{repairJob.car_model}</p>
              <p className="text-sm text-textSecondary">Plate: {repairJob.number_plate}</p>
              <p className="text-sm text-textSecondary">Year: {repairJob.manufacturing_year}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-textPrimary mb-2">SERVICE DETAILS:</h3>
            <div className="bg-darkBg p-4 rounded-lg border border-borderColor">
              <p className="text-sm text-textSecondary mb-1">Problem:</p>
              <p className="text-textPrimary mb-3">{repairJob.problem_description}</p>
              {repairJob.repair_details && (
                <>
                  <p className="text-sm text-textSecondary mb-1">Repair Details:</p>
                  <p className="text-textPrimary">{repairJob.repair_details}</p>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-borderColor pt-4">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between mb-2">
                  <span className="text-textSecondary">Repair Cost:</span>
                  <span className="font-semibold text-textPrimary">${parseFloat(repairJob.repair_cost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-textSecondary">Payment Amount:</span>
                  <span className="font-semibold text-textPrimary">${parseFloat(repairJob.payment_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-textSecondary">Payment Method:</span>
                  <span className="font-semibold text-textPrimary">{repairJob.payment_method || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textSecondary">Payment Status:</span>
                  <span className={`font-semibold ${repairJob.payment_status === 'Paid' ? 'text-success' : 'text-danger'}`}>
                    {repairJob.payment_status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 text-textSecondary">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceModal;
