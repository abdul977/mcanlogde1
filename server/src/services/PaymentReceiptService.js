import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

class PaymentReceiptService {
  
  /**
   * Generate payment receipt PDF
   */
  static async generateReceipt(paymentVerification) {
    try {
      // Populate payment verification with related data
      await paymentVerification.populate([
        { path: 'user', select: 'name email phone' },
        { path: 'booking', select: 'accommodation checkInDate checkOutDate', populate: { path: 'accommodation', select: 'title location' } }
      ]);

      const doc = new PDFDocument({ margin: 50 });
      const receiptNumber = `MCAN-${paymentVerification._id.toString().slice(-8).toUpperCase()}`;
      const filename = `receipt_${receiptNumber}.pdf`;
      const filepath = path.join(process.cwd(), 'uploads', 'receipts', filename);

      // Ensure receipts directory exists
      const receiptDir = path.dirname(filepath);
      if (!fs.existsSync(receiptDir)) {
        fs.mkdirSync(receiptDir, { recursive: true });
      }

      // Pipe PDF to file
      doc.pipe(fs.createWriteStream(filepath));

      // Header
      this.addHeader(doc, receiptNumber);
      
      // Organization details
      this.addOrganizationDetails(doc);
      
      // Receipt details
      this.addReceiptDetails(doc, paymentVerification);
      
      // Payment details
      this.addPaymentDetails(doc, paymentVerification);
      
      // Footer
      this.addFooter(doc);

      // Finalize PDF
      doc.end();

      return {
        filename,
        filepath,
        receiptNumber
      };
    } catch (error) {
      console.error('Error generating payment receipt:', error);
      throw error;
    }
  }

  /**
   * Add header to PDF
   */
  static addHeader(doc, receiptNumber) {
    doc.fontSize(20)
       .fillColor('#2D5016')
       .text('PAYMENT RECEIPT', 50, 50, { align: 'center' });
    
    doc.fontSize(12)
       .fillColor('#666666')
       .text(`Receipt #: ${receiptNumber}`, 50, 80, { align: 'center' });
    
    doc.moveTo(50, 100)
       .lineTo(550, 100)
       .stroke('#2D5016');
  }

  /**
   * Add organization details
   */
  static addOrganizationDetails(doc) {
    const startY = 120;
    
    doc.fontSize(14)
       .fillColor('#2D5016')
       .text('Muslim Corps Members Association of Nigeria (MCAN)', 50, startY);
    
    doc.fontSize(10)
       .fillColor('#666666')
       .text('Official Receipt for Accommodation Payment', 50, startY + 20)
       .text('Website: www.mcan.org', 50, startY + 35)
       .text('Email: info@mcan.org', 50, startY + 50);
    
    // Date and time
    doc.text(`Generated: ${new Date().toLocaleString()}`, 400, startY, { align: 'right' });
  }

  /**
   * Add receipt details
   */
  static addReceiptDetails(doc, paymentVerification) {
    const startY = 200;
    
    doc.fontSize(12)
       .fillColor('#333333')
       .text('RECEIPT DETAILS', 50, startY, { underline: true });
    
    const details = [
      ['Received From:', paymentVerification.user.name],
      ['Email:', paymentVerification.user.email],
      ['Phone:', paymentVerification.user.phone || 'N/A'],
      ['Accommodation:', paymentVerification.booking.accommodation.title],
      ['Location:', paymentVerification.booking.accommodation.location || 'N/A'],
      ['Payment Month:', `Month ${paymentVerification.monthNumber}`],
      ['Payment Date:', new Date(paymentVerification.paymentDate).toLocaleDateString()],
      ['Payment Method:', paymentVerification.paymentMethod],
      ['Transaction Ref:', paymentVerification.transactionReference || 'N/A']
    ];

    let currentY = startY + 25;
    details.forEach(([label, value]) => {
      doc.fontSize(10)
         .fillColor('#666666')
         .text(label, 50, currentY)
         .fillColor('#333333')
         .text(value, 200, currentY);
      currentY += 15;
    });
  }

  /**
   * Add payment details
   */
  static addPaymentDetails(doc, paymentVerification) {
    const startY = 380;
    
    // Payment amount box
    doc.rect(50, startY, 500, 80)
       .fillAndStroke('#f8f9fa', '#dee2e6');
    
    doc.fontSize(14)
       .fillColor('#2D5016')
       .text('PAYMENT AMOUNT', 70, startY + 15);
    
    doc.fontSize(24)
       .fillColor('#2D5016')
       .text(`₦${paymentVerification.amount.toLocaleString()}`, 70, startY + 35);
    
    doc.fontSize(10)
       .fillColor('#666666')
       .text(`Amount in words: ${this.numberToWords(paymentVerification.amount)} Naira only`, 70, startY + 60);
    
    // Status
    const statusColor = paymentVerification.verificationStatus === 'approved' ? '#10B981' : '#F59E0B';
    doc.fontSize(12)
       .fillColor(statusColor)
       .text(`Status: ${paymentVerification.verificationStatus.toUpperCase()}`, 400, startY + 25, { align: 'right' });
    
    if (paymentVerification.verifiedAt) {
      doc.fontSize(10)
         .fillColor('#666666')
         .text(`Verified: ${new Date(paymentVerification.verifiedAt).toLocaleDateString()}`, 400, startY + 45, { align: 'right' });
    }
  }

  /**
   * Add footer
   */
  static addFooter(doc) {
    const startY = 500;
    
    doc.moveTo(50, startY)
       .lineTo(550, startY)
       .stroke('#dee2e6');
    
    doc.fontSize(8)
       .fillColor('#666666')
       .text('This is a computer-generated receipt and does not require a signature.', 50, startY + 10)
       .text('For inquiries, please contact us at info@mcan.org or visit www.mcan.org', 50, startY + 25)
       .text('Thank you for your payment!', 50, startY + 40, { align: 'center' });
    
    // QR Code placeholder (you can implement actual QR code generation)
    doc.rect(480, startY + 10, 60, 60)
       .stroke('#dee2e6');
    
    doc.fontSize(6)
       .text('QR Code', 495, startY + 35);
  }

  /**
   * Convert number to words (simplified version)
   */
  static numberToWords(num) {
    if (num === 0) return 'Zero';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Million', 'Billion'];
    
    function convertHundreds(n) {
      let result = '';
      
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        return result;
      }
      
      if (n > 0) {
        result += ones[n] + ' ';
      }
      
      return result;
    }
    
    let result = '';
    let thousandIndex = 0;
    
    while (num > 0) {
      if (num % 1000 !== 0) {
        result = convertHundreds(num % 1000) + thousands[thousandIndex] + ' ' + result;
      }
      num = Math.floor(num / 1000);
      thousandIndex++;
    }
    
    return result.trim();
  }

  /**
   * Generate receipt for multiple payments (bulk receipt)
   */
  static async generateBulkReceipt(paymentVerifications, userInfo) {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const receiptNumber = `MCAN-BULK-${Date.now().toString().slice(-8).toUpperCase()}`;
      const filename = `bulk_receipt_${receiptNumber}.pdf`;
      const filepath = path.join(process.cwd(), 'uploads', 'receipts', filename);

      // Ensure receipts directory exists
      const receiptDir = path.dirname(filepath);
      if (!fs.existsSync(receiptDir)) {
        fs.mkdirSync(receiptDir, { recursive: true });
      }

      doc.pipe(fs.createWriteStream(filepath));

      // Header
      this.addHeader(doc, receiptNumber);
      
      // Organization details
      this.addOrganizationDetails(doc);
      
      // User details
      doc.fontSize(12)
         .fillColor('#333333')
         .text('BULK PAYMENT RECEIPT', 50, 200, { underline: true });
      
      doc.fontSize(10)
         .fillColor('#666666')
         .text(`Received From: ${userInfo.name}`, 50, 225)
         .text(`Email: ${userInfo.email}`, 50, 240)
         .text(`Total Payments: ${paymentVerifications.length}`, 50, 255);

      // Payment details table
      let currentY = 280;
      const totalAmount = paymentVerifications.reduce((sum, payment) => sum + payment.amount, 0);
      
      paymentVerifications.forEach((payment, index) => {
        doc.fontSize(9)
           .text(`${index + 1}. Month ${payment.monthNumber}`, 50, currentY)
           .text(`₦${payment.amount.toLocaleString()}`, 200, currentY)
           .text(new Date(payment.paymentDate).toLocaleDateString(), 300, currentY)
           .text(payment.verificationStatus, 400, currentY);
        currentY += 15;
      });

      // Total
      doc.fontSize(12)
         .fillColor('#2D5016')
         .text(`Total Amount: ₦${totalAmount.toLocaleString()}`, 50, currentY + 20);

      this.addFooter(doc);
      doc.end();

      return {
        filename,
        filepath,
        receiptNumber
      };
    } catch (error) {
      console.error('Error generating bulk receipt:', error);
      throw error;
    }
  }
}

export default PaymentReceiptService;
