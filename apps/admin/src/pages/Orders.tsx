import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import api from '../lib/api';
import Table, { Column } from '../components/Table';
import Badge from '../components/Badge';

type OrderStatus =
  | 'PLACED'
  | 'PAYMENT_CONFIRMED'
  | 'ACCEPTED_BY_RESTAURANT'
  | 'RIDER_ASSIGNED'
  | 'PREPARING'
  | 'READY'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'CANCELLED';

interface Order {
  id: string;
  subtotalRwf: number;
  deliveryFeeRwf: number;
  discountRwf: number;
  totalRwf: number;
  paymentMethod: string;
  paymentStatus: string;
  status: OrderStatus;
  createdAt: string;
  customer: { fullName: string | null; phoneNumber: string };
  restaurant: { businessName: string };
  _count: { items: number };
}

interface OrdersResponse {
  items: Order[];
  total: number;
}

const STATUS_TABS: Array<{ label: string; value: string }> = [
  { label: 'All', value: '' },
  { label: 'Placed', value: 'PLACED' },
  { label: 'Confirmed', value: 'PAYMENT_CONFIRMED' },
  { label: 'Preparing', value: 'PREPARING' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

function statusBadgeColor(status: OrderStatus): 'blue' | 'green' | 'red' | 'orange' | 'gray' {
  if (status === 'PLACED') return 'blue';
  if (status === 'DELIVERED') return 'green';
  if (status === 'CANCELLED') return 'red';
  return 'orange';
}

function statusLabel(status: OrderStatus): string {
  return status.replace(/_/g, ' ');
}

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-orders', statusFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await api.get<{ success: boolean; data: OrdersResponse }>(`/admin/orders?${params}`);
      return res.data.data;
    },
  });

  const columns: Column<Order>[] = [
    {
      key: 'id',
      header: 'Order ID',
      render: (o) => (
        <span className="font-mono text-xs text-[#757575]">{o.id.slice(0, 8).toUpperCase()}</span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (o) => (
        <div>
          <div className="text-sm font-medium text-[#1A1A1A]">{o.customer.fullName ?? '—'}</div>
          <div className="text-xs text-[#757575]">{o.customer.phoneNumber}</div>
        </div>
      ),
    },
    {
      key: 'restaurant',
      header: 'Restaurant',
      render: (o) => <span className="text-sm text-[#1A1A1A]">{o.restaurant.businessName}</span>,
    },
    {
      key: 'items',
      header: 'Items',
      render: (o) => <span className="text-sm text-[#757575]">{o._count.items}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      render: (o) => (
        <span className="text-sm font-semibold text-[#1A1A1A]">
          {o.totalRwf.toLocaleString('en-RW')} RWF
        </span>
      ),
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (o) => (
        <div className="space-y-1">
          <div className="text-xs text-[#757575]">{o.paymentMethod.replace(/_/g, ' ')}</div>
          <Badge
            label={o.paymentStatus}
            color={o.paymentStatus === 'CONFIRMED' ? 'green' : o.paymentStatus === 'FAILED' ? 'red' : 'orange'}
          />
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Order Status',
      render: (o) => (
        <Badge label={statusLabel(o.status)} color={statusBadgeColor(o.status)} />
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (o) => (
        <span className="text-xs text-[#757575]">{new Date(o.createdAt).toLocaleString()}</span>
      ),
    },
  ];

  return (
    <div>
      {/* Status Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'bg-primary text-white'
                : 'bg-white text-[#757575] border border-[#EEEEEE] hover:text-[#1A1A1A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
        <input
          type="text"
          placeholder="Search by customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E0E0E0] rounded-xl outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#EEEEEE] shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-[#757575]">Loading...</div>
        ) : isError ? (
          <div className="p-12 text-center text-[#E53935]">Failed to load orders.</div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-[#EEEEEE]">
              <span className="text-sm text-[#757575]">{data?.total ?? 0} orders</span>
            </div>
            <Table columns={columns} data={data?.items ?? []} emptyMessage="No orders found" />
          </>
        )}
      </div>
    </div>
  );
}
