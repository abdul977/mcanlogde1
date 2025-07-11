import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  FaCreditCard,
  FaUniversity,
  FaMobile,
  FaSave,
  FaUndo,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import MobileLayout, {
  MobilePageHeader,
  MobileInput,
  MobileTextarea,
  MobileButton,
  MobileSelect
} from '../../components/Mobile/MobileLayout';
import Navbar from './Navbar';
import { useAuth } from '../../context/UserContext';

const PaymentSettings = () => {
  const [auth] = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [config, setConfig] = useState({
    organizationName: 'Muslim Corps Members Association of Nigeria (MCAN)',
    bankDetails: {
      accountName: 'Muslim Corps Members Association of Nigeria',
      accountNumber: '',
      bankName: '',
      sortCode: '',
      swiftCode: ''
    },
    mobilePayment: {
      mtn: { number: '', accountName: '' },
      airtel: { number: '', accountName: '' },
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
      email: '',
      phone: '',
      whatsapp: '',
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

  useEffect(() => {
    fetchPaymentConfiguration();
  }, []);

  const fetchPaymentConfiguration = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/payment-config/admin/config`,
        {
          headers: { Authorization: `Bearer ${auth?.token}` }
        }
      );

      if (response.data.success) {
        setConfig(response.data.configuration);
      }
    } catch (error) {
      console.error('Error fetching payment configuration:', error);
      toast.error('Failed to load payment configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (path, value) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const handleSaveConfiguration = async () => {
    try {
      setSaving(true);
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/payment-config/admin/update`,
        config,
        {
          headers: { Authorization: `Bearer ${auth?.token}` }
        }
      );

      if (response.data.success) {
        toast.success('Payment configuration saved successfully!');
        setConfig(response.data.configuration);
      }
    } catch (error) {
      console.error('Error saving payment configuration:', error);
      toast.error(error.response?.data?.message || 'Failed to save payment configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConfiguration = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/payment-config/admin/test`,
        {
          headers: { Authorization: `Bearer ${auth?.token}` }
        }
      );

      if (response.data.success) {
        const { testResults } = response.data;
        if (testResults.isValid) {
          toast.success('Payment configuration is valid!');
        } else {
          toast.error(`Configuration issues: ${testResults.errors.join(', ')}`);
        }
      }
    } catch (error) {
      console.error('Error testing configuration:', error);
      toast.error('Failed to test configuration');
    }
  };

  const currencyOptions = [
    { value: 'NGN', label: 'Nigerian Naira (₦)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'EUR', label: 'Euro (€)' }
  ];

  const mobileProviders = [
    { key: 'mtn', label: 'MTN', color: 'bg-yellow-500' },
    { key: 'airtel', label: 'Airtel', color: 'bg-red-500' },
    { key: 'glo', label: 'Glo', color: 'bg-green-500' },
    { key: 'nineMobile', label: '9Mobile', color: 'bg-green-600' }
  ];

  if (loading) {
    return (
      <MobileLayout
        title="Payment Settings"
        subtitle="Configure payment methods"
        icon={FaCreditCard}
        navbar={Navbar}
      >
        <div className="p-4 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title="Payment Settings"
      subtitle="Configure payment methods and account details"
      icon={FaCreditCard}
      navbar={Navbar}
    >
      <div className="p-4 lg:p-8">
        <MobilePageHeader
          title="Payment Configuration"
          subtitle="Manage payment methods and account details"
          icon={FaCreditCard}
          showOnMobile={false}
          actions={
            <div className="flex gap-2">
              <MobileButton
                onClick={handleTestConfiguration}
                variant="secondary"
                icon={FaCheckCircle}
                size="sm"
              >
                Test Config
              </MobileButton>
              <MobileButton
                onClick={handleSaveConfiguration}
                variant="primary"
                icon={FaSave}
                disabled={saving}
                size="sm"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </MobileButton>
            </div>
          }
        />

        <div className="space-y-6">
          {/* Organization Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Details</h3>
            <MobileInput
              label="Organization Name"
              value={config.organizationName}
              onChange={(e) => handleInputChange('organizationName', e.target.value)}
              placeholder="Organization Name"
            />
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaUniversity className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Bank Account Details</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MobileInput
                label="Account Name"
                value={config.bankDetails.accountName}
                onChange={(e) => handleInputChange('bankDetails.accountName', e.target.value)}
                placeholder="Account Name"
                required
              />
              <MobileInput
                label="Account Number"
                value={config.bankDetails.accountNumber}
                onChange={(e) => handleInputChange('bankDetails.accountNumber', e.target.value)}
                placeholder="Account Number"
                required
              />
              <MobileInput
                label="Bank Name"
                value={config.bankDetails.bankName}
                onChange={(e) => handleInputChange('bankDetails.bankName', e.target.value)}
                placeholder="Bank Name"
                required
              />
              <MobileInput
                label="Sort Code (Optional)"
                value={config.bankDetails.sortCode}
                onChange={(e) => handleInputChange('bankDetails.sortCode', e.target.value)}
                placeholder="Sort Code"
              />
              <MobileInput
                label="SWIFT Code (Optional)"
                value={config.bankDetails.swiftCode}
                onChange={(e) => handleInputChange('bankDetails.swiftCode', e.target.value)}
                placeholder="SWIFT Code"
              />
            </div>
          </div>

          {/* Mobile Payment Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaMobile className="text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Mobile Money Details</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mobileProviders.map(provider => (
                <div key={provider.key} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${provider.color}`}></div>
                    <h4 className="font-medium text-gray-700">{provider.label}</h4>
                  </div>
                  <MobileInput
                    label="Phone Number"
                    value={config.mobilePayment[provider.key].number}
                    onChange={(e) => handleInputChange(`mobilePayment.${provider.key}.number`, e.target.value)}
                    placeholder={`${provider.label} Number`}
                  />
                  <MobileInput
                    label="Account Name"
                    value={config.mobilePayment[provider.key].accountName}
                    onChange={(e) => handleInputChange(`mobilePayment.${provider.key}.accountName`, e.target.value)}
                    placeholder="Account Name"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Instructions</h3>
            <div className="space-y-4">
              <MobileTextarea
                label="General Instructions"
                value={config.paymentInstructions.general}
                onChange={(e) => handleInputChange('paymentInstructions.general', e.target.value)}
                placeholder="General payment instructions"
                rows={3}
              />
              <MobileTextarea
                label="Bank Transfer Instructions"
                value={config.paymentInstructions.bankTransfer}
                onChange={(e) => handleInputChange('paymentInstructions.bankTransfer', e.target.value)}
                placeholder="Bank transfer specific instructions"
                rows={2}
              />
              <MobileTextarea
                label="Mobile Payment Instructions"
                value={config.paymentInstructions.mobilePayment}
                onChange={(e) => handleInputChange('paymentInstructions.mobilePayment', e.target.value)}
                placeholder="Mobile payment specific instructions"
                rows={2}
              />
            </div>
          </div>

          {/* Payment Support */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Support Contact</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MobileInput
                label="Support Email"
                type="email"
                value={config.paymentSupport.email}
                onChange={(e) => handleInputChange('paymentSupport.email', e.target.value)}
                placeholder="support@mcan.org"
              />
              <MobileInput
                label="Support Phone"
                value={config.paymentSupport.phone}
                onChange={(e) => handleInputChange('paymentSupport.phone', e.target.value)}
                placeholder="+234 xxx xxx xxxx"
              />
              <MobileInput
                label="WhatsApp Number"
                value={config.paymentSupport.whatsapp}
                onChange={(e) => handleInputChange('paymentSupport.whatsapp', e.target.value)}
                placeholder="+234 xxx xxx xxxx"
              />
              <MobileInput
                label="Working Hours"
                value={config.paymentSupport.workingHours}
                onChange={(e) => handleInputChange('paymentSupport.workingHours', e.target.value)}
                placeholder="Monday - Friday: 9:00 AM - 5:00 PM"
              />
            </div>
          </div>

          {/* Currency Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency Settings</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MobileSelect
                label="Primary Currency"
                value={config.currency.primary}
                onChange={(e) => {
                  const selectedCurrency = currencyOptions.find(opt => opt.value === e.target.value);
                  handleInputChange('currency.primary', e.target.value);
                  handleInputChange('currency.symbol', selectedCurrency?.label.match(/\((.+)\)/)?.[1] || '₦');
                }}
                options={currencyOptions}
              />
              <MobileInput
                label="Currency Symbol"
                value={config.currency.symbol}
                onChange={(e) => handleInputChange('currency.symbol', e.target.value)}
                placeholder="₦"
              />
            </div>
          </div>

          {/* Verification Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Settings</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MobileInput
                label="Auto Approval Limit (₦)"
                type="number"
                value={config.verificationSettings.autoApprovalLimit}
                onChange={(e) => handleInputChange('verificationSettings.autoApprovalLimit', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
              <MobileInput
                label="Max File Size (MB)"
                type="number"
                value={Math.round(config.verificationSettings.maxFileSize / (1024 * 1024))}
                onChange={(e) => handleInputChange('verificationSettings.maxFileSize', (parseInt(e.target.value) || 5) * 1024 * 1024)}
                placeholder="5"
                min="1"
                max="10"
              />
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.verificationSettings.requireTransactionReference}
                  onChange={(e) => handleInputChange('verificationSettings.requireTransactionReference', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Require transaction reference</span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <MobileButton
              onClick={() => fetchPaymentConfiguration()}
              variant="secondary"
              icon={FaUndo}
              disabled={saving}
            >
              Reset
            </MobileButton>
            <MobileButton
              onClick={handleSaveConfiguration}
              variant="primary"
              icon={FaSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </MobileButton>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default PaymentSettings;
