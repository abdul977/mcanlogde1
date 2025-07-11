import React, { useState, useEffect } from "react";
import { FaMoneyBillWave, FaChartBar, FaExclamationTriangle, FaCheckCircle, FaClock, FaCalendarAlt, FaDownload, FaFilter, FaChartLine, FaArrowDown } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import MobileLayout, { MobilePageHeader } from "../../components/Mobile/MobileLayout";
import SimpleChart from "../../components/SimpleChart";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/UserContext";

const PaymentOverview = () => {
  const [auth] = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [overduePayments, setOverduePayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [chartData, setChartData] = useState({
    daily: [],
    monthly: [],
    byMethod: [],
    byStatus: []
  });

  useEffect(() => {
    fetchOverviewData();
  }, [dateRange]);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth") ? JSON.parse(localStorage.getItem("auth")).token : null;
      
      // Fetch payment statistics
      const statsResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/payments/admin/statistics`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Fetch recent pending payments
      const paymentsResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/payments/admin/verifications?status=pending&limit=10`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Fetch overdue payments
      const overdueResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/bookings/admin/overdue-payments`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (statsResponse.data.success) {
        setStatistics(statsResponse.data.statistics);
      }

      if (paymentsResponse.data.success) {
        setRecentPayments(paymentsResponse.data.payments);
      }

      if (overdueResponse.data.success) {
        setOverduePayments(overdueResponse.data.overduePayments || []);
      }
    } catch (error) {
      console.error("Error fetching overview data:", error);
      toast.error("Failed to fetch payment overview");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const EnhancedStatCard = ({ title, value, icon: Icon, color, bgColor, change, subtitle }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="text-right">
          {change !== undefined && (
            <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <FaChartLine className="mr-1" /> : <FaArrowDown className="mr-1" />}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <MobileLayout
        title="Payment Overview"
        subtitle="Loading payment data"
        icon={FaMoneyBillWave}
        navbar={Navbar}
      >
        <div className="p-4 lg:p-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title="Payment Overview"
      subtitle="Monitor payment verifications and collection status"
      icon={FaMoneyBillWave}
      navbar={Navbar}
    >
      <div className="p-4 lg:p-8">
        {/* Page Header for Desktop */}
        <MobilePageHeader
          title="Payment Overview"
          subtitle="Monitor payment verifications and collection status"
          icon={FaMoneyBillWave}
          showOnMobile={false}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Pending Verifications"
            value={statistics?.pending || 0}
            icon={FaClock}
            color="text-yellow-600"
            subtitle="Awaiting review"
          />
          <StatCard
            title="Approved Payments"
            value={statistics?.approved || 0}
            icon={FaCheckCircle}
            color="text-green-600"
            subtitle="Successfully verified"
          />
          <StatCard
            title="Total Submissions"
            value={statistics?.total || 0}
            icon={FaMoneyBillWave}
            color="text-blue-600"
            subtitle="All time"
          />
          <StatCard
            title="Rejected Payments"
            value={statistics?.rejected || 0}
            icon={FaExclamationTriangle}
            color="text-red-600"
            subtitle="Require resubmission"
          />
        </div>

        {/* Date Range Filter */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Analytics Period</h3>
              <div className="flex items-center gap-4">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 3 months</option>
                  <option value="365">Last year</option>
                </select>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaDownload className="mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <EnhancedStatCard
            title="Total Revenue"
            value={`₦${(statistics?.totalRevenue || 0).toLocaleString()}`}
            icon={FaMoneyBillWave}
            color="text-green-600"
            bgColor="bg-green-50"
            change={statistics?.revenueChange || 0}
            subtitle="This period"
          />
          <EnhancedStatCard
            title="Average Payment"
            value={`₦${(statistics?.averagePayment || 0).toLocaleString()}`}
            icon={FaChartBar}
            color="text-blue-600"
            bgColor="bg-blue-50"
            change={statistics?.avgPaymentChange || 0}
            subtitle="Per transaction"
          />
          <EnhancedStatCard
            title="Conversion Rate"
            value={`${(statistics?.conversionRate || 0).toFixed(1)}%`}
            icon={FaChartLine}
            color="text-purple-600"
            bgColor="bg-purple-50"
            change={statistics?.conversionChange || 0}
            subtitle="Approval rate"
          />
          <EnhancedStatCard
            title="Processing Time"
            value={`${(statistics?.avgProcessingTime || 0).toFixed(1)}h`}
            icon={FaClock}
            color="text-orange-600"
            bgColor="bg-orange-50"
            change={statistics?.processingTimeChange || 0}
            subtitle="Average"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SimpleChart
            data={chartData.daily || []}
            type="line"
            title="Daily Payment Trends"
            height={250}
          />
          <SimpleChart
            data={chartData.byStatus || []}
            type="pie"
            title="Payment Status Distribution"
            height={250}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SimpleChart
            data={chartData.byMethod || []}
            type="bar"
            title="Payment Methods"
            height={250}
          />
          <SimpleChart
            data={chartData.monthly || []}
            type="bar"
            title="Monthly Revenue"
            height={250}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/admin/payment-verification"
                className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Review Pending Payments
              </Link>
              <Link
                to="/admin/payment-analytics"
                className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                View Payment Analytics
              </Link>
              <button
                onClick={fetchOverviewData}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Rate</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Approved Payments</span>
                  <span>{statistics?.total > 0 ? Math.round((statistics?.approved / statistics?.total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${statistics?.total > 0 ? (statistics?.approved / statistics?.total) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Total Amount Verified: ₦{(statistics?.breakdown?.find(b => b._id === 'approved')?.totalAmount || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Pending Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Recent Pending Payments</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentPayments.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No pending payments
                </div>
              ) : (
                recentPayments.slice(0, 5).map((payment) => (
                  <div key={payment._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {payment.user?.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {payment.booking?.accommodation?.title} - Month {payment.monthNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          Submitted: {formatDate(payment.submittedAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          ₦{payment.amount?.toLocaleString()}
                        </div>
                        <div className="text-xs text-yellow-600">
                          Pending Review
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {recentPayments.length > 0 && (
              <div className="p-4 border-t bg-gray-50">
                <Link
                  to="/admin/payment-verification"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All Pending Payments →
                </Link>
              </div>
            )}
          </div>

          {/* Overdue Payments */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaExclamationTriangle className="text-red-500" />
                Overdue Payments
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {overduePayments.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No overdue payments
                </div>
              ) : (
                overduePayments.slice(0, 5).map((payment, index) => (
                  <div key={index} className="p-4 hover:bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {payment.user?.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {payment.accommodation?.title} - Month {payment.monthNumber}
                        </div>
                        <div className="text-xs text-red-600">
                          {Math.ceil((new Date() - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24))} days overdue
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          ₦{payment.amount?.toLocaleString()}
                        </div>
                        <div className="text-xs text-red-600">
                          Due: {formatDate(payment.dueDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default PaymentOverview;
