import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import PaymentVerification from '../models/PaymentVerification.js';

class PaymentExportService {
  
  /**
   * Export payments to Excel format
   */
  static async exportToExcel(filters = {}, options = {}) {
    try {
      const {
        startDate,
        endDate,
        status,
        paymentMethod,
        accommodationId
      } = filters;

      const {
        includeUserDetails = true,
        includeBookingDetails = true,
        includeFinancialSummary = true
      } = options;

      // Build query
      const query = {};
      
      if (startDate || endDate) {
        query.submittedAt = {};
        if (startDate) query.submittedAt.$gte = new Date(startDate);
        if (endDate) query.submittedAt.$lte = new Date(endDate);
      }
      
      if (status && status !== 'all') {
        query.verificationStatus = status;
      }
      
      if (paymentMethod) {
        query.paymentMethod = paymentMethod;
      }

      // Fetch payments
      let paymentsQuery = PaymentVerification.find(query);
      
      if (includeUserDetails) {
        paymentsQuery = paymentsQuery.populate('user', 'name email phone');
      }
      
      if (includeBookingDetails) {
        paymentsQuery = paymentsQuery.populate({
          path: 'booking',
          select: 'accommodation checkInDate checkOutDate totalAmount',
          populate: {
            path: 'accommodation',
            select: 'title location price'
          }
        });
      }

      const payments = await paymentsQuery.sort({ submittedAt: -1 });

      // Create workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'MCAN Payment System';
      workbook.created = new Date();

      // Main payments sheet
      const worksheet = workbook.addWorksheet('Payment Records');
      
      // Define columns
      const columns = [
        { header: 'Payment ID', key: 'paymentId', width: 15 },
        { header: 'Receipt Number', key: 'receiptNumber', width: 20 },
        { header: 'Submission Date', key: 'submittedAt', width: 15 },
        { header: 'Payment Date', key: 'paymentDate', width: 15 },
        { header: 'Month Number', key: 'monthNumber', width: 12 },
        { header: 'Amount (₦)', key: 'amount', width: 15 },
        { header: 'Payment Method', key: 'paymentMethod', width: 15 },
        { header: 'Transaction Ref', key: 'transactionReference', width: 20 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Verified Date', key: 'verifiedAt', width: 15 }
      ];

      if (includeUserDetails) {
        columns.push(
          { header: 'User Name', key: 'userName', width: 20 },
          { header: 'User Email', key: 'userEmail', width: 25 },
          { header: 'User Phone', key: 'userPhone', width: 15 }
        );
      }

      if (includeBookingDetails) {
        columns.push(
          { header: 'Accommodation', key: 'accommodationTitle', width: 25 },
          { header: 'Location', key: 'accommodationLocation', width: 20 },
          { header: 'Check-in Date', key: 'checkInDate', width: 15 },
          { header: 'Check-out Date', key: 'checkOutDate', width: 15 }
        );
      }

      worksheet.columns = columns;

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2D5016' }
      };
      worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

      // Add data rows
      payments.forEach(payment => {
        const row = {
          paymentId: payment._id.toString().slice(-8).toUpperCase(),
          receiptNumber: payment.receiptNumber || 'N/A',
          submittedAt: payment.submittedAt,
          paymentDate: payment.paymentDate,
          monthNumber: payment.monthNumber,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          transactionReference: payment.transactionReference || 'N/A',
          status: payment.verificationStatus,
          verifiedAt: payment.verifiedAt || 'N/A'
        };

        if (includeUserDetails && payment.user) {
          row.userName = payment.user.name;
          row.userEmail = payment.user.email;
          row.userPhone = payment.user.phone || 'N/A';
        }

        if (includeBookingDetails && payment.booking) {
          row.accommodationTitle = payment.booking.accommodation?.title || 'N/A';
          row.accommodationLocation = payment.booking.accommodation?.location || 'N/A';
          row.checkInDate = payment.booking.checkInDate || 'N/A';
          row.checkOutDate = payment.booking.checkOutDate || 'N/A';
        }

        worksheet.addRow(row);
      });

      // Format amount column as currency
      const amountColumn = worksheet.getColumn('amount');
      amountColumn.numFmt = '₦#,##0.00';

      // Format date columns
      ['submittedAt', 'paymentDate', 'verifiedAt', 'checkInDate', 'checkOutDate'].forEach(dateCol => {
        const column = worksheet.getColumn(dateCol);
        if (column) {
          column.numFmt = 'dd/mm/yyyy';
        }
      });

      // Add summary sheet if requested
      if (includeFinancialSummary) {
        await this.addSummarySheet(workbook, payments);
      }

      // Generate filename and save
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `payment_export_${timestamp}_${Date.now()}.xlsx`;
      const filepath = path.join(process.cwd(), 'uploads', 'exports', filename);

      // Ensure exports directory exists
      const exportDir = path.dirname(filepath);
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      await workbook.xlsx.writeFile(filepath);

      return {
        filename,
        filepath,
        recordCount: payments.length
      };

    } catch (error) {
      console.error('Error exporting payments to Excel:', error);
      throw error;
    }
  }

  /**
   * Export payments to CSV format
   */
  static async exportToCSV(filters = {}) {
    try {
      const { startDate, endDate, status, paymentMethod } = filters;

      // Build query
      const query = {};
      
      if (startDate || endDate) {
        query.submittedAt = {};
        if (startDate) query.submittedAt.$gte = new Date(startDate);
        if (endDate) query.submittedAt.$lte = new Date(endDate);
      }
      
      if (status && status !== 'all') {
        query.verificationStatus = status;
      }
      
      if (paymentMethod) {
        query.paymentMethod = paymentMethod;
      }

      // Fetch payments
      const payments = await PaymentVerification.find(query)
        .populate('user', 'name email phone')
        .populate({
          path: 'booking',
          select: 'accommodation checkInDate',
          populate: {
            path: 'accommodation',
            select: 'title location'
          }
        })
        .sort({ submittedAt: -1 });

      // Generate CSV content
      const headers = [
        'Payment ID',
        'Receipt Number',
        'Submission Date',
        'Payment Date',
        'Month Number',
        'Amount',
        'Payment Method',
        'Transaction Reference',
        'Status',
        'Verified Date',
        'User Name',
        'User Email',
        'User Phone',
        'Accommodation',
        'Location',
        'Check-in Date'
      ];

      let csvContent = headers.join(',') + '\n';

      payments.forEach(payment => {
        const row = [
          payment._id.toString().slice(-8).toUpperCase(),
          payment.receiptNumber || 'N/A',
          payment.submittedAt.toISOString().slice(0, 10),
          payment.paymentDate.toISOString().slice(0, 10),
          payment.monthNumber,
          payment.amount,
          payment.paymentMethod,
          payment.transactionReference || 'N/A',
          payment.verificationStatus,
          payment.verifiedAt ? payment.verifiedAt.toISOString().slice(0, 10) : 'N/A',
          payment.user?.name || 'N/A',
          payment.user?.email || 'N/A',
          payment.user?.phone || 'N/A',
          payment.booking?.accommodation?.title || 'N/A',
          payment.booking?.accommodation?.location || 'N/A',
          payment.booking?.checkInDate ? payment.booking.checkInDate.toISOString().slice(0, 10) : 'N/A'
        ];

        // Escape commas and quotes in CSV
        const escapedRow = row.map(field => {
          const stringField = String(field);
          if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
          }
          return stringField;
        });

        csvContent += escapedRow.join(',') + '\n';
      });

      // Save CSV file
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `payment_export_${timestamp}_${Date.now()}.csv`;
      const filepath = path.join(process.cwd(), 'uploads', 'exports', filename);

      // Ensure exports directory exists
      const exportDir = path.dirname(filepath);
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      fs.writeFileSync(filepath, csvContent, 'utf8');

      return {
        filename,
        filepath,
        recordCount: payments.length
      };

    } catch (error) {
      console.error('Error exporting payments to CSV:', error);
      throw error;
    }
  }

  /**
   * Add summary sheet to Excel workbook
   */
  static async addSummarySheet(workbook, payments) {
    const summarySheet = workbook.addWorksheet('Summary');

    // Calculate statistics
    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const approvedPayments = payments.filter(p => p.verificationStatus === 'approved').length;
    const pendingPayments = payments.filter(p => p.verificationStatus === 'pending').length;
    const rejectedPayments = payments.filter(p => p.verificationStatus === 'rejected').length;
    const approvedAmount = payments.filter(p => p.verificationStatus === 'approved').reduce((sum, p) => sum + p.amount, 0);

    // Payment method breakdown
    const methodBreakdown = payments.reduce((acc, payment) => {
      acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + 1;
      return acc;
    }, {});

    // Add summary data
    summarySheet.addRow(['Payment Export Summary']);
    summarySheet.addRow(['Generated:', new Date().toLocaleString()]);
    summarySheet.addRow([]);
    
    summarySheet.addRow(['Total Records:', totalPayments]);
    summarySheet.addRow(['Total Amount:', `₦${totalAmount.toLocaleString()}`]);
    summarySheet.addRow(['Approved Payments:', approvedPayments]);
    summarySheet.addRow(['Pending Payments:', pendingPayments]);
    summarySheet.addRow(['Rejected Payments:', rejectedPayments]);
    summarySheet.addRow(['Approved Amount:', `₦${approvedAmount.toLocaleString()}`]);
    summarySheet.addRow([]);
    
    summarySheet.addRow(['Payment Method Breakdown:']);
    Object.entries(methodBreakdown).forEach(([method, count]) => {
      summarySheet.addRow([method, count]);
    });

    // Style summary sheet
    summarySheet.getRow(1).font = { bold: true, size: 14 };
    summarySheet.getColumn(1).width = 25;
    summarySheet.getColumn(2).width = 20;
  }
}

export default PaymentExportService;
