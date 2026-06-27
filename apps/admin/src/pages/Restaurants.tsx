import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Upload, X, Trash2 } from 'lucide-react';
import api from '../lib/api';
import Table, { Column } from '../components/Table';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import MapPicker from '../components/MapPicker';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const defaultHours = DAYS.map((_, i) => ({
  dayOfWeek: i,
  openTime: '08:00',
  closeTime: '22:00',
  isClosed: false,
}));

interface Restaurant {
  id: string;
  businessName: string;
  rdbNumber: string | null;
  addressDetails: string | null;
  coverPhotoUrl: string | null;
  logoUrl: string | null;
  isApproved: boolean;
  isOpen: boolean;
  avgRating: number;
  commissionPercent: number;
  createdAt: string;
  owner: { fullName: string | null; phoneNumber: string };
}

interface RestaurantsResponse {
  items: Restaurant[];
  total: number;
}

export default function Restaurants() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [approvedFilter, setApprovedFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    ownerPhone: '',
    businessName: '',
    rdbNumber: '',
    lat: null as number | null,
    lng: null as number | null,
    addressDetails: '',
    commissionPercent: '10',
    photoUrl: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [hours, setHours] = useState(defaultHours);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleMapChange = useCallback((lat: number, lng: number, address?: string) => {
    setForm((prev) => ({ ...prev, lat, lng, addressDetails: address ?? prev.addressDetails }));
  }, []);

  const handlePhotoUpload = useCallback(async (file: File) => {
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await api.post<{ success: boolean; data: { url: string } }>(
        '/uploads/restaurant-photo',
        fd,
        { headers: { 'Content-Type': undefined } }
      );
      setForm((prev) => ({ ...prev, photoUrl: res.data.data.url }));
    } catch {
      setPhotoPreview(null);
      setForm((prev) => ({ ...prev, photoUrl: '' }));
    } finally {
      setPhotoUploading(false);
    }
  }, []);

  const resetModal = () => {
    setForm({ ownerPhone: '', businessName: '', rdbNumber: '', lat: null, lng: null, addressDetails: '', commissionPercent: '10', photoUrl: '' });
    setPhotoPreview(null);
    setHours(defaultHours);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-restaurants', search, approvedFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (approvedFilter !== '') params.set('approved', approvedFilter);
      const res = await api.get<{ success: boolean; data: RestaurantsResponse }>(`/admin/restaurants?${params}`);
      return res.data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      await api.patch(`/admin/restaurants/${id}/approve`, { approved });
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] }),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/admin/restaurants', {
        ownerPhone: form.ownerPhone.startsWith('+250') ? form.ownerPhone : `+250${form.ownerPhone.replace(/^0/, '')}`,
        businessName: form.businessName,
        rdbNumber: form.rdbNumber || undefined,
        lat: form.lat,
        lng: form.lng,
        addressDetails: form.addressDetails || undefined,
        commissionPercent: parseFloat(form.commissionPercent),
        photoUrl: form.photoUrl || undefined,
        hours,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      setShowAddModal(false);
      resetModal();
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<Restaurant | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/restaurants/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      setDeleteTarget(null);
      setDeleteError('');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
        'Failed to delete restaurant.';
      setDeleteError(msg);
    },
  });

  const columns: Column<Restaurant>[] = [
    {
      key: 'logo',
      header: '',
      render: (r) =>
        r.logoUrl ? (
          <img src={r.logoUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-semibold text-[#757575]">
            {r.businessName.charAt(0)}
          </div>
        ),
      className: 'w-14',
    },
    {
      key: 'name',
      header: 'Name',
      render: (r) => <span className="font-medium text-[#1A1A1A]">{r.businessName}</span>,
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (r) => (
        <div>
          <div className="text-sm text-[#1A1A1A]">{r.owner.fullName ?? '—'}</div>
          <div className="text-xs text-[#757575]">{r.owner.phoneNumber}</div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (r) => <span className="text-sm text-[#757575]">{r.addressDetails ?? '—'}</span>,
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (r) => <span className="text-sm">{r.avgRating.toFixed(1)}</span>,
    },
    {
      key: 'commission',
      header: 'Commission',
      render: (r) => <span className="text-sm">{r.commissionPercent}%</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge label={r.isApproved ? 'Approved' : 'Pending'} color={r.isApproved ? 'green' : 'orange'} />
      ),
    },
    {
      key: 'open',
      header: 'Open',
      render: (r) => <Badge label={r.isOpen ? 'Open' : 'Closed'} color={r.isOpen ? 'green' : 'gray'} />,
    },
    {
      key: 'created',
      header: 'Created',
      render: (r) => (
        <span className="text-xs text-[#757575]">{new Date(r.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/restaurants/${r.id}`)}
            className="text-xs text-primary hover:underline font-medium"
          >
            View
          </button>
          <button
            onClick={() => approveMutation.mutate({ id: r.id, approved: !r.isApproved })}
            disabled={approveMutation.isPending}
            className={`text-xs font-medium hover:underline ${r.isApproved ? 'text-red-500' : 'text-green-600'}`}
          >
            {r.isApproved ? 'Reject' : 'Approve'}
          </button>
          <button
            onClick={() => { setDeleteTarget(r); setDeleteError(''); }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
            title="Delete restaurant"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Filters + Add */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E0E0E0] rounded-xl outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={approvedFilter}
          onChange={(e) => setApprovedFilter(e.target.value)}
          className="px-3 py-2.5 text-sm border border-[#E0E0E0] rounded-xl outline-none focus:border-primary transition-colors bg-white text-[#1A1A1A]"
        >
          <option value="">All</option>
          <option value="false">Pending</option>
          <option value="true">Approved</option>
        </select>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primaryDark transition-colors ml-auto"
        >
          <Plus size={16} />
          Add Restaurant
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#EEEEEE] shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-[#757575]">Loading...</div>
        ) : isError ? (
          <div className="p-12 text-center text-[#E53935]">Failed to load restaurants.</div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-[#EEEEEE]">
              <span className="text-sm text-[#757575]">{data?.total ?? 0} restaurants</span>
            </div>
            <Table columns={columns} data={data?.items ?? []} emptyMessage="No restaurants found" />
          </>
        )}
      </div>

      {/* Add Restaurant Modal */}
      {showAddModal && (
        <Modal title="Add Restaurant" onClose={() => { setShowAddModal(false); resetModal(); }} maxWidth="max-w-2xl">
          <div className="space-y-4">
            {/* Restaurant photo */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Restaurant photo</label>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handlePhotoUpload(file);
                }}
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="relative w-full h-36 border-2 border-dashed border-[#E0E0E0] rounded-xl overflow-hidden hover:border-primary transition-colors flex items-center justify-center bg-[#F5F5F5]"
              >
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoPreview(null);
                        setForm((prev) => ({ ...prev, photoUrl: '' }));
                        if (photoInputRef.current) photoInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                    >
                      <X size={14} className="text-[#757575]" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-[#757575]">
                    {photoUploading ? (
                      <span className="text-sm">Uploading...</span>
                    ) : (
                      <>
                        <Upload size={22} />
                        <span className="text-sm">Click to upload photo</span>
                        <span className="text-xs text-[#BDBDBD]">JPG, PNG up to 5 MB</span>
                      </>
                    )}
                  </div>
                )}
              </button>
            </div>

            {[
              { label: 'Owner phone (+250...)', key: 'ownerPhone', placeholder: '+250780000000' },
              { label: 'Business name', key: 'businessName', placeholder: 'Mama African Kitchen' },
              { label: 'RDB Number', key: 'rdbNumber', placeholder: 'Optional' },
              { label: 'Address details', key: 'addressDetails', placeholder: 'KG 17 St, Kimironko' },
              { label: 'Commission %', key: 'commissionPercent', placeholder: '10' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={form[key as keyof typeof form] as string}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-[#E0E0E0] rounded-xl outline-none focus:border-primary transition-colors"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Location <span className="text-[#757575] font-normal">— search or click map to pin</span>
              </label>
              <MapPicker lat={form.lat} lng={form.lng} onChange={handleMapChange} />
            </div>

            {/* Opening hours */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-3">Opening hours</label>
              <div className="space-y-2">
                {hours.map((h, idx) => (
                  <div key={h.dayOfWeek} className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-[#1A1A1A] w-20 flex-shrink-0">{DAYS[h.dayOfWeek]}</span>
                    <label className="flex items-center gap-1.5 text-xs text-[#757575] flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={h.isClosed}
                        onChange={(e) => {
                          const updated = [...hours];
                          updated[idx] = { ...updated[idx], isClosed: e.target.checked };
                          setHours(updated);
                        }}
                        className="accent-primary"
                      />
                      Closed
                    </label>
                    <input
                      type="time"
                      value={h.openTime}
                      disabled={h.isClosed}
                      onChange={(e) => {
                        const updated = [...hours];
                        updated[idx] = { ...updated[idx], openTime: e.target.value };
                        setHours(updated);
                      }}
                      className="text-sm border border-[#E0E0E0] rounded-lg px-2 py-1.5 outline-none focus:border-primary disabled:opacity-40"
                    />
                    <span className="text-xs text-[#757575]">to</span>
                    <input
                      type="time"
                      value={h.closeTime}
                      disabled={h.isClosed}
                      onChange={(e) => {
                        const updated = [...hours];
                        updated[idx] = { ...updated[idx], closeTime: e.target.value };
                        setHours(updated);
                      }}
                      className="text-sm border border-[#E0E0E0] rounded-lg px-2 py-1.5 outline-none focus:border-primary disabled:opacity-40"
                    />
                  </div>
                ))}
              </div>
            </div>

            {createMutation.isError && (
              <p className="text-sm text-[#E53935]">Failed to create restaurant. Check the details and try again.</p>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => { setShowAddModal(false); resetModal(); }} className="px-4 py-2 text-sm text-[#757575]">
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || photoUploading || !form.ownerPhone || !form.businessName || !form.lat || !form.lng}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg font-medium hover:bg-primaryDark transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete restaurant confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setDeleteTarget(null); setDeleteError(''); }} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#1A1A1A]">Delete restaurant?</h3>
                <p className="text-sm text-[#757575] mt-1">
                  <span className="font-medium text-[#1A1A1A]">{deleteTarget.businessName}</span> and all its menu sections and items will be permanently removed.
                </p>
                {deleteError && (
                  <p className="text-sm text-[#E53935] mt-2 bg-red-50 rounded-lg px-3 py-2">{deleteError}</p>
                )}
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => { setDeleteTarget(null); setDeleteError(''); }}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-[#757575] border border-[#E0E0E0] rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
