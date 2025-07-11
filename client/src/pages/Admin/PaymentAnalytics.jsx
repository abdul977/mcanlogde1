import React, { useState, useEffect } from "react";
import { FaChartBar, FaMoneyBillWave, FaTrendingUp, FaTrendingDown, FaCalendar } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import AdminLayout from "../../components/Layout/AdminLayout";

const PaymentAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth") ? JSON.parse(localStorage.getItem("auth")).token : null;
      
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/payments/admin/analytics?days=${dateRange}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setAnalytics(response.data.analytics);
        setChartData(response.data.chartData);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to fetch payment analytics");
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? <FaTrendingUp className="w-3 h-3 mr-1" /> : <FaTrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(change)}% from last period
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const CollectionRateChart = ({ data }) => {
    if (!data || !data.length) return null;

    const maxValue = Math.max(...data.map(d => d.collected));
    
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Rate Trend</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.period}</span>
                  <span className="font-medium">
                    ₦{item.collected?.toLocaleString()} / ₦{item.expected?.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${item.expected > 0 ? (item.collected / item.expected) * 100 : 0}%`
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {item.expected > 0 ? Math.round((item.collected / item.expected) * 100) : 0}% collected
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const OverdueBreakdown = ({ overdueData }) => {
    if (!overdueData) return null;

    const levels = [
      { level: 1, label: '1-7 days', color: 'bg-yellow-500' },
      { level: 2, label: '8-14 days', color: 'bg-orange-500' },
      { level: 3, label: '15-21 days', color: 'bg-red-500' },
      { level: 4, label: '22+ days', color: 'bg-red-700' }
    ];

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overdue Payment Breakdown</h3>
        <div className="space-y-4">
          {levels.map((level) => {
            const data = overdueData.byLevel?.[level.level] || { count: 0, amount: 0 };
            const percentage = overdueData.total > 0 ? (data.count / overdueData.total) * 100 : 0;
            
            return (
              <div key={level.level} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${level.color}`}></div>
                  <span className="text-sm text-gray-700">{level.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {data.count} payments
                  </div>
                  <div className="text-xs text-gray-500">
                    ₦{data.amount?.toLocaleString()}
                  </div>
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-2 ml-4">
                  <div 
                    className={`h-2 rounded-full ${level.color}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        
        {overdueData.total > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Overdue:</span>
              <span className="font-semibold text-red-600">
                {overdueData.total} payments (₦{overdueData.totalAmount?.toLocaleString()})
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Average Days Overdue:</span>
              <span className="font-medium">{overdueData.averageDaysOverdue} days</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Analytics</h1>
            <p className="text-gray-600">Track payment collection performance and trends</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            
            <button
              onClick={fetchAnalytics}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaCalendar className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Collection Rate"
            value={`${analytics?.collectionRate || 0}%`}
            change={analytics?.collectionRateChange}
            icon={FaChartBar}
            color="text-green-600"
            subtitle="Of expected payments"
          />
          <MetricCard
            title="Total Collected"
            value={`₦${analytics?.totalCollected?.toLocaleString() || 0}`}
            change={analytics?.collectedChange}
            icon={FaMoneyBillWave}
            color="text-blue-600"
            subtitle="This period"
          />
          <MetricCard
            title="Pending Verifications"
            value={analytics?.pendingVerifications || 0}
            icon={FaCalendar}
            color="text-yellow-600"
            subtitle="Awaiting review"
          />
          <MetricCard
            title="Overdue Payments"
            value={analytics?.overduePayments?.total || 0}
            icon={FaTrendingDown}
            color="text-red-600"
            subtitle={`₦${analytics?.overduePayments?.totalAmount?.toLocaleString() || 0}`}
          />
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CollectionRateChart data={chartData?.collectionTrend} />
          <OverdueBreakdown overdueData={analytics?.overduePayments} />
        </div>

        {/* Additional Insights */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <div className="space-y-3">
              {analytics?.paymentMethods?.map((method, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{method.method?.replace('_', ' ').toUpperCase()}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{method.count}</div>
                    <div className="text-xs text-gray-500">₦{method.amount?.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Accommodations</h3>
            <div className="space-y-3">
              {analytics?.topAccommodations?.map((accommodation, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 truncate">{accommodation.title}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{accommodation.payments}</div>
                    <div className="text-xs text-gray-500">₦{accommodation.amount?.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Processing Time</span>
                <span className="text-sm font-medium">{analytics?.avgProcessingTime || 0} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Rejection Rate</span>
                <span className="text-sm font-medium">{analytics?.rejectionRate || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Bookings</span>
                <span className="text-sm font-medium">{analytics?.activeBookings || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Revenue</span>
                <span className="text-sm font-medium">₦{analytics?.monthlyRevenue?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PaymentAnalytics;
