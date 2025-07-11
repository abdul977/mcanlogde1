import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ReceiptService {
  constructor() {
    this.ensureReceiptDirectory();
  }

  ensureReceiptDirectory() {
    const receiptDir = path.join(__dirname, '../../uploads/receipts');
    if (!fs.existsSync(receiptDir)) {
      fs.mkdirSync(receiptDir, { recursive: true });
    }
  }

  async generatePaymentReceipt(paymentVerification) {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `payment-receipt-${paymentVerification._id}.pdf`;
      const filepath = path.join(__dirname, '../../uploads/receipts', filename);
      
      // Pipe the PDF to a file
      doc.pipe(fs.createWriteStream(filepath));

      // Header
      this.addHeader(doc);
      
      // Receipt title
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('PAYMENT RECEIPT', 50, 150, { align: 'center' });

      // Receipt number and date
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Receipt No: MCL-${paymentVerification._id.slice(-8).toUpperCase()}`, 50, 190)
         .text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 400, 190);

      // Divider line
      doc.moveTo(50, 220)
         .lineTo(550, 220)
         .stroke();

      // Customer Information
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('CUSTOMER INFORMATION', 50, 240);

      doc.fontSize(11)
         .font('Helvetica')
         .text(`Name: ${paymentVerification.user?.name || 'N/A'}`, 50, 265)
         .text(`Email: ${paymentVerification.user?.email || 'N/A'}`, 50, 285);

      // Booking Information
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('BOOKING INFORMATION', 50, 320);

      doc.fontSize(11)
         .font('Helvetica')
         .text(`Accommodation: ${paymentVerification.booking?.accommodation?.title || 'N/A'}`, 50, 345)
         .text(`Booking ID: ${paymentVerification.booking?._id || 'N/A'}`, 50, 365)
         .text(`Payment Month: ${paymentVerification.monthNumber}`, 50, 385);

      // Payment Details
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('PAYMENT DETAILS', 50, 420);

      // Payment details table
      const tableTop = 450;
      const tableLeft = 50;
      const tableWidth = 500;

      // Table headers
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text('Description', tableLeft, tableTop)
         .text('Amount', tableLeft + 350, tableTop)
         .text('Status', tableLeft + 420, tableTop);

      // Table line
      doc.moveTo(tableLeft, tableTop + 20)
         .lineTo(tableLeft + tableWidth, tableTop + 20)
         .stroke();

      // Payment row
      doc.fontSize(11)
         .font('Helvetica')
         .text(`Month ${paymentVerification.monthNumber} Accommodation Payment`, tableLeft, tableTop + 30)
         .text(`₦${paymentVerification.amount?.toLocaleString()}`, tableLeft + 350, tableTop + 30)
         .text('PAID', tableLeft + 420, tableTop + 30);

      // Total line
      doc.moveTo(tableLeft, tableTop + 60)
         .lineTo(tableLeft + tableWidth, tableTop + 60)
         .stroke();

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('TOTAL AMOUNT PAID:', tableLeft + 250, tableTop + 75)
         .text(`₦${paymentVerification.amount?.toLocaleString()}`, tableLeft + 420, tableTop + 75);

      // Payment Method Information
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('PAYMENT METHOD', 50, tableTop + 120);

      doc.fontSize(11)
         .font('Helvetica')
         .text(`Method: ${paymentVerification.paymentMethod?.replace('_', ' ').toUpperCase()}`, 50, tableTop + 145);

      if (paymentVerification.transactionReference) {
        doc.text(`Transaction Reference: ${paymentVerification.transactionReference}`, 50, tableTop + 165);
      }

      doc.text(`Payment Date: ${new Date(paymentVerification.paymentDate).toLocaleDateString('en-GB')}`, 50, tableTop + 185)
         .text(`Verified Date: ${new Date(paymentVerification.verifiedAt).toLocaleDateString('en-GB')}`, 50, tableTop + 205);

      // Footer
      this.addFooter(doc);

      // Finalize the PDF
      doc.end();

      return {
        success: true,
        filename,
        filepath,
        url: `/uploads/receipts/${filename}`
      };

    } catch (error) {
      console.error('Error generating payment receipt:', error);
      throw new Error('Failed to generate payment receipt');
    }
  }

  addHeader(doc) {
    // Company logo area (placeholder)
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#2D5016')
       .text('MCAN LODGE', 50, 50);

    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#000000')
       .text('Muslim Community Association of Nigeria', 50, 80)
       .text('Accommodation Services', 50, 95)
       .text('Email: info@mcanlodge.com', 50, 110)
       .text('Phone: +234 XXX XXX XXXX', 50, 125);

    // Add a line
    doc.moveTo(50, 140)
       .lineTo(550, 140)
       .stroke();
  }

  addFooter(doc) {
    const footerTop = 700;
    
    // Footer line
    doc.moveTo(50, footerTop)
       .lineTo(550, footerTop)
       .stroke();

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666666')
       .text('This is a computer-generated receipt and does not require a signature.', 50, footerTop + 20)
       .text('For inquiries, please contact our support team.', 50, footerTop + 35)
       .text(`Generated on: ${new Date().toLocaleString('en-GB')}`, 50, footerTop + 50)
       .text('Thank you for choosing MCAN Lodge!', 50, footerTop + 65, { align: 'center' });

    // Verification stamp area
    doc.fontSize(8)
       .fillColor('#2D5016')
       .text('VERIFIED & APPROVED', 400, footerTop + 20, { 
         align: 'center',
         width: 100
       });
    
    // Draw a box around the stamp
    doc.rect(395, footerTop + 15, 110, 25)
       .stroke();
  }

  async generateBulkReceipts(paymentVerifications) {
    const results = [];
    
    for (const payment of paymentVerifications) {
      try {
        const result = await this.generatePaymentReceipt(payment);
        results.push({
          paymentId: payment._id,
          success: true,
          ...result
        });
      } catch (error) {
        results.push({
          paymentId: payment._id,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  getReceiptPath(filename) {
    return path.join(__dirname, '../../uploads/receipts', filename);
  }

  receiptExists(filename) {
    const filepath = this.getReceiptPath(filename);
    return fs.existsSync(filepath);
  }

  deleteReceipt(filename) {
    try {
      const filepath = this.getReceiptPath(filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting receipt:', error);
      return false;
    }
  }

  // Clean up old receipts (older than 1 year)
  cleanupOldReceipts() {
    try {
      const receiptDir = path.join(__dirname, '../../uploads/receipts');
      const files = fs.readdirSync(receiptDir);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      let deletedCount = 0;
      
      files.forEach(file => {
        const filepath = path.join(receiptDir, file);
        const stats = fs.statSync(filepath);
        
        if (stats.mtime < oneYearAgo) {
          fs.unlinkSync(filepath);
          deletedCount++;
        }
      });
      
      console.log(`Cleaned up ${deletedCount} old receipt files`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old receipts:', error);
      return 0;
    }
  }
}

// Create singleton instance
const receiptService = new ReceiptService();

export default receiptService;
