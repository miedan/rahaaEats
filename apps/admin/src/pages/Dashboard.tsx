import { useQuery } from '@tanstack/react-query';
import { Users, UtensilsCrossed, AlertCircle, ShoppingBag, TrendingUp, Star } from 'lucide-react';
import api from '../lib/api';
import StatCard from '../components/StatCard';

interface Stats {
  totalUsers: number;
  totalRestaurants: number;
  pendingApprovals: number;
  totalOrders: number;
  totalRevenueRwf: number;
  totalFoodRatings: number;
  totalRestaurantRatings: number;
}

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: Stats }>('/admin/stats');
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#EEEEEE] p-6 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-[#E53935]">Failed to load stats. Please try again.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[#757575] text-sm mb-6">Welcome back. Here's what's happening with Rahaa.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          value={data.totalUsers.toLocaleString()}
          label="Total Users"
          iconColor="text-blue-500"
        />
        <StatCard
          icon={UtensilsCrossed}
          value={data.totalRestaurants.toLocaleString()}
          label="Total Restaurants"
          iconColor="text-primary"
        />
        <StatCard
          icon={AlertCircle}
          value={data.pendingApprovals.toLocaleString()}
          label="Pending Approvals"
          iconColor="text-orange-500"
          badge={data.pendingApprovals > 0 ? 'Action needed' : undefined}
          badgeColor="bg-orange-100 text-orange-800"
        />
        <StatCard
          icon={ShoppingBag}
          value={data.totalOrders.toLocaleString()}
          label="Total Orders"
          iconColor="text-purple-500"
        />
        <StatCard
          icon={TrendingUp}
          value={`${data.totalRevenueRwf.toLocaleString('en-RW')} RWF`}
          label="Total Revenue"
          iconColor="text-green-600"
        />
        <StatCard
          icon={Star}
          value={(data.totalFoodRatings + data.totalRestaurantRatings).toLocaleString()}
          label="Total Reviews"
          iconColor="text-amber-500"
        />
      </div>
    </div>
  );
}
