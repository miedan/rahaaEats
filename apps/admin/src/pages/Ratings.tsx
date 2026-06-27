import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import Table, { Column } from '../components/Table';
import StarRating from '../components/StarRating';

type TabName = 'food' | 'restaurant';

interface FoodRating {
  id: string;
  rating: number;
  comment: string | null;
  photoUrl: string | null;
  createdAt: string;
  menuItem: { name: string };
  customer: { fullName: string | null; phoneNumber: string };
}

interface RestaurantRating {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  restaurant: { businessName: string };
  customer: { fullName: string | null; phoneNumber: string };
}

interface RatingsResponse {
  food: { items: FoodRating[]; total: number };
  restaurant: { items: RestaurantRating[]; total: number };
}

export default function Ratings() {
  const [tab, setTab] = useState<TabName>('food');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-ratings'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: RatingsResponse }>('/admin/ratings');
      return res.data.data;
    },
  });

  const foodColumns: Column<FoodRating>[] = [
    {
      key: 'stars',
      header: 'Rating',
      render: (r) => <StarRating rating={r.rating} />,
    },
    {
      key: 'food',
      header: 'Food Item',
      render: (r) => <span className="font-medium text-[#1A1A1A]">{r.menuItem.name}</span>,
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (r) => (
        <div>
          <div className="text-sm text-[#1A1A1A]">{r.customer.fullName ?? '—'}</div>
          <div className="text-xs text-[#757575]">{r.customer.phoneNumber}</div>
        </div>
      ),
    },
    {
      key: 'comment',
      header: 'Comment',
      render: (r) => (
        <span className="text-sm text-[#757575] max-w-xs block truncate">{r.comment ?? '—'}</span>
      ),
    },
    {
      key: 'photo',
      header: 'Photo',
      render: (r) =>
        r.photoUrl ? (
          <img src={r.photoUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <span className="text-xs text-[#BDBDBD]">—</span>
        ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (r) => (
        <span className="text-xs text-[#757575]">{new Date(r.createdAt).toLocaleDateString()}</span>
      ),
    },
  ];

  const restaurantColumns: Column<RestaurantRating>[] = [
    {
      key: 'stars',
      header: 'Rating',
      render: (r) => <StarRating rating={r.rating} />,
    },
    {
      key: 'restaurant',
      header: 'Restaurant',
      render: (r) => <span className="font-medium text-[#1A1A1A]">{r.restaurant.businessName}</span>,
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (r) => (
        <div>
          <div className="text-sm text-[#1A1A1A]">{r.customer.fullName ?? '—'}</div>
          <div className="text-xs text-[#757575]">{r.customer.phoneNumber}</div>
        </div>
      ),
    },
    {
      key: 'comment',
      header: 'Comment',
      render: (r) => (
        <span className="text-sm text-[#757575] max-w-xs block truncate">{r.comment ?? '—'}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (r) => (
        <span className="text-xs text-[#757575]">{new Date(r.createdAt).toLocaleDateString()}</span>
      ),
    },
  ];

  return (
    <div>
      <p className="text-sm text-[#757575] mb-6">Star ratings for food items and restaurants.</p>

      {/* Tabs */}
      <div className="flex border-b border-[#EEEEEE] mb-6">
        {(['food', 'restaurant'] as TabName[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-[#757575] hover:text-[#1A1A1A]'
            }`}
          >
            {t === 'food' ? 'Food Ratings' : 'Restaurant Ratings'}
          </button>
        ))}
      </div>

      {isLoading && <div className="p-12 text-center text-[#757575]">Loading...</div>}
      {isError && <div className="p-12 text-center text-[#E53935]">Failed to load ratings.</div>}

      {data && (
        <div className="bg-white rounded-xl border border-[#EEEEEE] shadow-sm">
          <div className="px-6 py-4 border-b border-[#EEEEEE]">
            <span className="text-sm text-[#757575]">
              {tab === 'food' ? data.food.total : data.restaurant.total} ratings
            </span>
          </div>
          {tab === 'food' ? (
            <Table columns={foodColumns} data={data.food.items} emptyMessage="No food ratings yet" />
          ) : (
            <Table columns={restaurantColumns} data={data.restaurant.items} emptyMessage="No restaurant ratings yet" />
          )}
        </div>
      )}
    </div>
  );
}
