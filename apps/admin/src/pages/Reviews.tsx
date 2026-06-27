import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import Table, { Column } from '../components/Table';
import StarRating from '../components/StarRating';

interface RestaurantReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  restaurant: { businessName: string };
  customer: { fullName: string | null; phoneNumber: string };
}

interface ReviewsResponse {
  items: RestaurantReview[];
  total: number;
}

export default function Reviews() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: ReviewsResponse }>('/admin/ratings?type=restaurant');
      return res.data.data;
    },
  });

  const columns: Column<RestaurantReview>[] = [
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
      header: 'Review Message',
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
      <p className="text-sm text-[#757575] mb-6">Customer reviews left for restaurants.</p>

      {isLoading && <div className="p-12 text-center text-[#757575]">Loading...</div>}
      {isError && <div className="p-12 text-center text-[#E53935]">Failed to load reviews.</div>}

      {data && (
        <div className="bg-white rounded-xl border border-[#EEEEEE] shadow-sm">
          <div className="px-6 py-4 border-b border-[#EEEEEE]">
            <span className="text-sm text-[#757575]">{data.total} restaurant reviews</span>
          </div>
          <Table columns={columns} data={data.items} emptyMessage="No restaurant reviews yet" />
        </div>
      )}
    </div>
  );
}
