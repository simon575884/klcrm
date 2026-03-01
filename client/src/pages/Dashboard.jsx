import { useState, useEffect } from 'react';
import { Users, Wrench, Clock, CheckCircle, DollarSign, Calendar, UserCheck, UserX } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../lib/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [jobDistribution, setJobDistribution] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, earningsData, distributionData] = await Promise.all([
        api.dashboard.getStats(),
        api.dashboard.getMonthlyEarnings(),
        api.dashboard.getJobStatusDistribution()
      ]);

      setStats(statsData);
      setMonthlyEarnings(earningsData);
      setJobDistribution(distributionData);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  };

  const statCards = [
    { icon: Users, label: 'Total Customers', value: stats?.totalCustomers || 0, color: 'from-blue-500 to-blue-600', iconBg: 'bg-blue-500' },
    { icon: Wrench, label: 'Total Repair Jobs', value: stats?.totalRepairJobs || 0, color: 'from-purple-500 to-purple-600', iconBg: 'bg-purple-500' },
    { icon: Clock, label: 'Pending Jobs', value: stats?.pendingJobs || 0, color: 'from-warning to-yellow-600', iconBg: 'bg-warning' },
    { icon: CheckCircle, label: 'Completed Jobs', value: stats?.completedJobs || 0, color: 'from-success to-green-600', iconBg: 'bg-success' },
    { icon: DollarSign, label: 'Total Earnings', value: `$${stats?.totalEarnings?.toFixed(2) || '0.00'}`, color: 'from-green-500 to-emerald-600', iconBg: 'bg-green-500' },
    { icon: Calendar, label: "Today's Appointments", value: stats?.todayAppointments || 0, color: 'from-info to-blue-600', iconBg: 'bg-info' },
    { icon: UserCheck, label: 'Staff Present', value: stats?.staffPresent || 0, color: 'from-success to-green-600', iconBg: 'bg-success' },
    { icon: UserX, label: 'Staff On Leave', value: stats?.staffOnLeave || 0, color: 'from-red-500 to-red-600', iconBg: 'bg-red-500' },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: '#FFFFFF'
        }
      }
    },
    scales: {
      y: {
        ticks: { color: '#94A3B8' },
        grid: { color: '#334155' }
      },
      x: {
        ticks: { color: '#94A3B8' },
        grid: { color: '#334155' }
      }
    }
  };

  const earningsChartData = {
    labels: monthlyEarnings.map(d => d.month),
    datasets: [{
      label: 'Monthly Earnings',
      data: monthlyEarnings.map(d => d.earnings),
      backgroundColor: 'rgba(229, 57, 53, 0.8)',
      borderColor: '#E53935',
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  const jobDistributionData = {
    labels: jobDistribution.map(d => d.repair_status),
    datasets: [{
      data: jobDistribution.map(d => d.count),
      backgroundColor: ['#F59E0B', '#3B82F6', '#10B981'],
      borderWidth: 2,
      borderColor: '#1E293B',
    }]
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-textPrimary mb-2">Dashboard</h1>
        <p className="text-textSecondary">Welcome to K&L Auto Repair CRM</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-textSecondary text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-textPrimary">{stat.value}</p>
                </div>
                <div className={`${stat.iconBg} p-4 rounded-xl shadow-lg`}>
                  <Icon className="text-white" size={28} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="text-2xl font-bold text-textPrimary mb-6 flex items-center gap-2">
            <DollarSign className="text-danger" />
            Monthly Earnings
          </h2>
          <Bar data={earningsChartData} options={chartOptions} />
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-textPrimary mb-6 flex items-center gap-2">
            <Wrench className="text-danger" />
            Job Status
          </h2>
          <Doughnut data={jobDistributionData} options={{
            ...chartOptions,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#FFFFFF', padding: 15 }
              }
            }
          }} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
