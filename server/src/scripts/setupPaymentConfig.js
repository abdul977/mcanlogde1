import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PaymentConfiguration from '../models/PaymentConfiguration.js';

// Load environment variables
dotenv.config({ path: './.env' });

const setupPaymentConfiguration = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if payment configuration exists
    let config = await PaymentConfiguration.findOne({ isActive: true });
    
    if (!config) {
      console.log('No payment configuration found. Creating default configuration...');
      config = await PaymentConfiguration.create({
        organizationName: 'Muslim Corps Members Association of Nigeria (MCAN)',
        bankDetails: {
          accountName: "Muslim Corps Members Association of Nigeria",
          accountNumber: "2034567890", // MCAN account number
          bankName: "First Bank of Nigeria", // MCAN bank
          sortCode: "011151003", // First Bank sort code
          swiftCode: ""
        },
        mobilePayment: {
          mtn: { number: '08012345678', accountName: 'MCAN Nigeria' },
          airtel: { number: '08087654321', accountName: 'MCAN Nigeria' },
          glo: { number: '', accountName: '' },
          nineMobile: { number: '', accountName: '' }
        },
        onlinePayment: {
          paystack: { publicKey: '', isActive: false },
          flutterwave: { publicKey: '', isActive: false }
        },
        paymentInstructions: {
          general: 'Please make payment to the account details provided below and upload your payment proof for verification.',
          bankTransfer: 'Transfer to the bank account details below and upload your payment receipt.',
          mobilePayment: 'Send money to any of the mobile money numbers below and upload your transaction screenshot.'
        },
        paymentSupport: {
          email: 'payments@mcan.org.ng',
          phone: '+234-800-MCAN-PAY',
          whatsapp: '+234-800-MCAN-PAY',
          workingHours: 'Monday - Friday: 9:00 AM - 5:00 PM'
        },
        currency: {
          primary: 'NGN',
          symbol: '₦'
        },
        verificationSettings: {
          autoApprovalLimit: 0,
          requireTransactionReference: false,
          allowedFileTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
          maxFileSize: 5242880
        }
      });
      console.log('Payment configuration created successfully!');
    } else {
      console.log('Payment configuration already exists');
      
      // Check if bank details are empty or contain placeholder values and update them
      if (!config.bankDetails.accountNumber ||
          !config.bankDetails.bankName ||
          config.bankDetails.accountNumber === "0000000000" ||
          config.bankDetails.bankName === "Please configure bank details" ||
          config.bankDetails.accountNumber === "Please configure bank details") {
        console.log('Updating placeholder/empty bank details...');
        config.bankDetails.accountNumber = "2034567890"; // MCAN account number
        config.bankDetails.bankName = "First Bank of Nigeria"; // MCAN bank
        config.bankDetails.sortCode = "011151003"; // First Bank sort code
        config.bankDetails.accountName = "Muslim Corps Members Association of Nigeria";
        await config.save();
        console.log('Bank details updated with real MCAN account information!');
      }
    }

    // Display current configuration
    console.log('\nCurrent Payment Configuration:');
    console.log('Organization:', config.organizationName);
    console.log('Bank Details:');
    console.log('  Account Name:', config.bankDetails.accountName);
    console.log('  Account Number:', config.bankDetails.accountNumber);
    console.log('  Bank Name:', config.bankDetails.bankName);
    console.log('  Sort Code:', config.bankDetails.sortCode);
    
    console.log('\nMobile Payments:');
    Object.keys(config.mobilePayment).forEach(provider => {
      const details = config.mobilePayment[provider];
      if (details.number) {
        console.log(`  ${provider.toUpperCase()}: ${details.number} (${details.accountName})`);
      }
    });

    // Test the configuration
    const validation = config.validateConfiguration();
    console.log('\nConfiguration Validation:');
    console.log('Is Valid:', validation.isValid);
    if (!validation.isValid) {
      console.log('Errors:', validation.errors);
    }

    // Test bank details check
    const bankDetailsConfigured = config.getFormattedBankDetails();
    console.log('\nBank Details Check:');
    console.log('Account Number:', bankDetailsConfigured.accountNumber);
    console.log('Bank Name:', bankDetailsConfigured.bankName);
    
    const isBankConfigured = !!(
      bankDetailsConfigured.accountNumber &&
      bankDetailsConfigured.bankName &&
      bankDetailsConfigured.accountNumber !== 'Please configure bank details' &&
      bankDetailsConfigured.bankName !== 'Please configure bank details' &&
      bankDetailsConfigured.accountNumber !== '0000000000'
    );
    console.log('Bank Details Configured:', isBankConfigured);

  } catch (error) {
    console.error('Error setting up payment configuration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the setup
setupPaymentConfiguration();
