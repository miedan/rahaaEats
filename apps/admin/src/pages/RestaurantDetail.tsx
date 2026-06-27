import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ChevronDown, ChevronRight, Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import api from '../lib/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import MapPicker from '../components/MapPicker';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const FOOD_CATEGORIES = ['BURGER', 'BEEF', 'DESSERT', 'JUICE', 'NOODLES', 'PIZZA', 'SALAD', 'OTHER'];

interface RestaurantHour {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  priceRwf: number;
  photoUrl: string | null;
  isAvailable: boolean;
  prepTimeMins: number | null;
  ingredients: string | null;
  allergens: string | null;
  avgRating: number;
}

type MenuSectionType = 'FOOD' | 'DRINK';

interface MenuSection {
  id: string;
  name: string;
  type: MenuSectionType;
  displayOrder: number;
  items: MenuItem[];
}

interface RestaurantDetailData {
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
  lat: number;
  lng: number;
  owner: { id: string; fullName: string | null; phoneNumber: string; email: string | null };
  hours: RestaurantHour[];
  menuSections: MenuSection[];
}

type TabName = 'details' | 'menu';

const blankHours = DAYS.map((_, i) => ({ dayOfWeek: i, openTime: '08:00', closeTime: '22:00', isClosed: false }));

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabName>('details');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Delete menu item confirm state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Delete restaurant state
  const [showDeleteRestaurant, setShowDeleteRestaurant] = useState(false);
  const [deleteRestaurantError, setDeleteRestaurantError] = useState('');

  // Details form
  const [detailForm, setDetailForm] = useState({
    businessName: '',
    addressDetails: '',
    rdbNumber: '',
    commissionPercent: '',
    lat: null as number | null,
    lng: null as number | null,
    photoUrl: '',
    isOpen: false,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Hours form
  const [hoursForm, setHoursForm] = useState(blankHours);

  // Add section modal
  const [showAddSection, setShowAddSection] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [sectionType, setSectionType] = useState<MenuSectionType>('FOOD');

  // Add item modal
  const [addItemSectionId, setAddItemSectionId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '', description: '', category: 'OTHER', priceRwf: '', photoUrl: '',
    isAvailable: true, prepTimeMins: '', ingredients: '', allergens: '',
  });

  // Edit item modal
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editItemForm, setEditItemForm] = useState({ ...itemForm });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-restaurant', id],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: RestaurantDetailData }>(`/admin/restaurants/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (data) {
      const existingPhoto = data.logoUrl ?? data.coverPhotoUrl ?? '';
      setDetailForm({
        businessName: data.businessName,
        addressDetails: data.addressDetails ?? '',
        rdbNumber: data.rdbNumber ?? '',
        commissionPercent: String(data.commissionPercent),
        lat: data.lat,
        lng: data.lng,
        photoUrl: existingPhoto,
        isOpen: data.isOpen,
      });
      setPhotoPreview(existingPhoto || null);

      const existingHours = data.hours;
      setHoursForm(
        DAYS.map((_, i) => {
          const found = existingHours.find((h) => h.dayOfWeek === i);
          return found
            ? { dayOfWeek: i, openTime: found.openTime, closeTime: found.closeTime, isClosed: found.isClosed }
            : { dayOfWeek: i, openTime: '08:00', closeTime: '22:00', isClosed: false };
        })
      );
    }
  }, [data]);

  const handleMapChange = useCallback((lat: number, lng: number) => {
    setDetailForm((prev) => ({ ...prev, lat, lng }));
  }, []);

  const handleDetailPhotoUpload = useCallback(async (file: File) => {
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
      setDetailForm((prev) => ({ ...prev, photoUrl: res.data.data.url }));
    } catch {
      setPhotoPreview(null);
      setDetailForm((prev) => ({ ...prev, photoUrl: '' }));
    } finally {
      setPhotoUploading(false);
    }
  }, []);

  const updateDetailsMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/admin/restaurants/${id}`, {
        businessName: detailForm.businessName,
        addressDetails: detailForm.addressDetails,
        rdbNumber: detailForm.rdbNumber,
        commissionPercent: parseFloat(detailForm.commissionPercent),
        lat: detailForm.lat,
        lng: detailForm.lng,
        photoUrl: detailForm.photoUrl || undefined,
        isOpen: detailForm.isOpen,
      });
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin-restaurant', id] }),
  });

  const approveMutation = useMutation({
    mutationFn: async (approved: boolean) => {
      await api.patch(`/admin/restaurants/${id}/approve`, { approved });
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin-restaurant', id] }),
  });

  const updateHoursMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/admin/restaurants/${id}/hours`, hoursForm);
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin-restaurant', id] }),
  });

  const addSectionMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/admin/restaurants/${id}/sections`, { name: sectionName, type: sectionType, displayOrder: 0 });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-restaurant', id] });
      setShowAddSection(false);
      setSectionName('');
      setSectionType('FOOD');
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/admin/restaurants/${id}/items`, {
        sectionId: addItemSectionId,
        name: itemForm.name,
        description: itemForm.description || undefined,
        category: itemForm.category,
        priceRwf: parseInt(itemForm.priceRwf, 10),
        photoUrl: itemForm.photoUrl || undefined,
        isAvailable: itemForm.isAvailable,
        prepTimeMins: itemForm.prepTimeMins ? parseInt(itemForm.prepTimeMins, 10) : undefined,
        ingredients: itemForm.ingredients || undefined,
        allergens: itemForm.allergens || undefined,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-restaurant', id] });
      setAddItemSectionId(null);
      setItemForm({ name: '', description: '', category: 'OTHER', priceRwf: '', photoUrl: '', isAvailable: true, prepTimeMins: '', ingredients: '', allergens: '' });
    },
  });

  const editItemMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/admin/menu-items/${editItem!.id}`, {
        name: editItemForm.name,
        description: editItemForm.description || undefined,
        category: editItemForm.category,
        priceRwf: parseInt(editItemForm.priceRwf, 10),
        photoUrl: editItemForm.photoUrl || undefined,
        isAvailable: editItemForm.isAvailable,
        prepTimeMins: editItemForm.prepTimeMins ? parseInt(editItemForm.prepTimeMins, 10) : undefined,
        ingredients: editItemForm.ingredients || undefined,
        allergens: editItemForm.allergens || undefined,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-restaurant', id] });
      setEditItem(null);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(`/admin/menu-items/${itemId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-restaurant', id] });
      setDeleteTarget(null);
    },
  });

  const deleteRestaurantMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/admin/restaurants/${id}`);
    },
    onSuccess: () => {
      navigate('/restaurants');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
        'Failed to delete restaurant.';
      setDeleteRestaurantError(msg);
    },
  });

  if (isLoading) return <div className="p-12 text-center text-[#757575]">Loading...</div>;
  if (isError || !data) return <div className="p-12 text-center text-[#E53935]">Failed to load restaurant.</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/restaurants')}
          className="p-2 rounded-lg hover:bg-gray-100 text-[#757575] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-[#1A1A1A]">{data.businessName}</h2>
          <p className="text-sm text-[#757575]">Owner: {data.owner.fullName ?? data.owner.phoneNumber}</p>
        </div>
        <button
          onClick={() => approveMutation.mutate(!data.isApproved)}
          disabled={approveMutation.isPending}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
            data.isApproved
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-primary hover:bg-green-100'
          }`}
        >
          {data.isApproved ? 'Reject' : 'Approve'}
        </button>
        <button
          onClick={() => { setShowDeleteRestaurant(true); setDeleteRestaurantError(''); }}
          className="p-2 rounded-xl hover:bg-red-50 text-red-400 transition-colors"
          title="Delete restaurant"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EEEEEE] mb-6">
        {(['details', 'menu'] as TabName[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-[#757575] hover:text-[#1A1A1A]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {tab === 'details' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#EEEEEE] p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#1A1A1A] mb-4">Restaurant Info</h3>
            {/* Photo upload */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-[#757575] mb-1">Restaurant photo</label>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleDetailPhotoUpload(file);
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
                        setDetailForm((prev) => ({ ...prev, photoUrl: '' }));
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
                        <Upload size={20} />
                        <span className="text-sm">Click to upload photo</span>
                      </>
                    )}
                  </div>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Business Name', key: 'businessName' },
                { label: 'Address Details', key: 'addressDetails' },
                { label: 'RDB Number', key: 'rdbNumber' },
                { label: 'Commission %', key: 'commissionPercent' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-[#757575] mb-1">{label}</label>
                  <input
                    type="text"
                    value={detailForm[key as keyof typeof detailForm] as string}
                    onChange={(e) => setDetailForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-[#E0E0E0] rounded-lg outline-none focus:border-primary transition-colors"
                  />
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2">
                <label className="text-xs font-medium text-[#757575]">Is Open</label>
                <input
                  type="checkbox"
                  checked={detailForm.isOpen}
                  onChange={(e) => setDetailForm((prev) => ({ ...prev, isOpen: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Badge label={data.isApproved ? 'Approved' : 'Pending'} color={data.isApproved ? 'green' : 'orange'} />
              </div>
            </div>

            {/* Map Picker */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-[#757575] mb-2">
                Restaurant Location — click to place pin, drag to adjust
              </label>
              <MapPicker lat={detailForm.lat} lng={detailForm.lng} onChange={handleMapChange} />
            </div>

            <button
              onClick={() => updateDetailsMutation.mutate()}
              disabled={updateDetailsMutation.isPending || photoUploading}
              className="mt-4 px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primaryDark transition-colors disabled:opacity-50"
            >
              {updateDetailsMutation.isPending ? 'Saving...' : photoUploading ? 'Uploading photo...' : 'Save Changes'}
            </button>
            {updateDetailsMutation.isSuccess && (
              <span className="ml-3 text-sm text-primary">Saved!</span>
            )}
          </div>

          {/* Opening Hours */}
          <div className="bg-white rounded-xl border border-[#EEEEEE] p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#1A1A1A] mb-4">Opening Hours</h3>
            <div className="space-y-3">
              {hoursForm.map((h, idx) => (
                <div key={h.dayOfWeek} className="flex items-center gap-3">
                  <span className="text-sm text-[#1A1A1A] w-24 flex-shrink-0">{DAYS[h.dayOfWeek]}</span>
                  <input
                    type="checkbox"
                    checked={h.isClosed}
                    onChange={(e) => {
                      const updated = [...hoursForm];
                      updated[idx] = { ...updated[idx], isClosed: e.target.checked };
                      setHoursForm(updated);
                    }}
                    className="accent-primary"
                    id={`closed-${idx}`}
                  />
                  <label htmlFor={`closed-${idx}`} className="text-xs text-[#757575]">Closed</label>
                  <input
                    type="time"
                    value={h.openTime}
                    disabled={h.isClosed}
                    onChange={(e) => {
                      const updated = [...hoursForm];
                      updated[idx] = { ...updated[idx], openTime: e.target.value };
                      setHoursForm(updated);
                    }}
                    className="text-sm border border-[#E0E0E0] rounded-lg px-2 py-1.5 outline-none focus:border-primary disabled:opacity-40"
                  />
                  <span className="text-xs text-[#757575]">to</span>
                  <input
                    type="time"
                    value={h.closeTime}
                    disabled={h.isClosed}
                    onChange={(e) => {
                      const updated = [...hoursForm];
                      updated[idx] = { ...updated[idx], closeTime: e.target.value };
                      setHoursForm(updated);
                    }}
                    className="text-sm border border-[#E0E0E0] rounded-lg px-2 py-1.5 outline-none focus:border-primary disabled:opacity-40"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => updateHoursMutation.mutate()}
              disabled={updateHoursMutation.isPending}
              className="mt-4 px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primaryDark transition-colors disabled:opacity-50"
            >
              {updateHoursMutation.isPending ? 'Saving...' : 'Save Hours'}
            </button>
            {updateHoursMutation.isSuccess && (
              <span className="ml-3 text-sm text-primary">Saved!</span>
            )}
          </div>
        </div>
      )}

      {/* Menu Tab */}
      {tab === 'menu' && (
        <div className="space-y-6">
          {(['FOOD', 'DRINK'] as MenuSectionType[]).map((groupType) => {
            const groupSections = data.menuSections.filter((s) => s.type === groupType);
            const label = groupType === 'FOOD' ? '🍽 Food' : '🥤 Drinks';
            return (
              <div key={groupType}>
                {/* Group header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-[#1A1A1A]">{label}</h3>
                  <button
                    onClick={() => { setSectionType(groupType); setShowAddSection(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primaryDark transition-colors"
                  >
                    <Plus size={13} />
                    Add {groupType === 'FOOD' ? 'food' : 'drink'} section
                  </button>
                </div>

                {groupSections.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dashed border-[#E0E0E0] p-8 text-center text-sm text-[#BDBDBD]">
                    No {groupType === 'FOOD' ? 'food' : 'drink'} sections yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groupSections.map((section) => (
                      <div key={section.id} className="bg-white rounded-xl border border-[#EEEEEE] shadow-sm overflow-hidden">
                        <button
                          onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-[#1A1A1A]">{section.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-[#757575]">{section.items.length} items</span>
                            {expandedSection === section.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </div>
                        </button>

                        {expandedSection === section.id && (
                          <div className="border-t border-[#EEEEEE]">
                            {section.items.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-[#EEEEEE]">
                                      <th className="text-left py-2 px-4 text-xs font-semibold text-[#757575] uppercase">Photo</th>
                                      <th className="text-left py-2 px-4 text-xs font-semibold text-[#757575] uppercase">Name</th>
                                      <th className="text-left py-2 px-4 text-xs font-semibold text-[#757575] uppercase">Price</th>
                                      <th className="text-left py-2 px-4 text-xs font-semibold text-[#757575] uppercase">Available</th>
                                      <th className="text-left py-2 px-4 text-xs font-semibold text-[#757575] uppercase">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {section.items.map((item) => (
                                      <tr key={item.id} className="border-b border-[#EEEEEE] hover:bg-gray-50">
                                        <td className="py-2 px-4">
                                          {item.photoUrl ? (
                                            <img src={item.photoUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                          ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gray-100" />
                                          )}
                                        </td>
                                        <td className="py-2 px-4">
                                          <div className="font-medium text-[#1A1A1A]">{item.name}</div>
                                          {item.description && <div className="text-xs text-[#757575] mt-0.5">{item.description}</div>}
                                        </td>
                                        <td className="py-2 px-4 text-[#1A1A1A] font-medium">
                                          {item.priceRwf.toLocaleString('en-RW')} RWF
                                        </td>
                                        <td className="py-2 px-4">
                                          <Badge label={item.isAvailable ? 'Yes' : 'No'} color={item.isAvailable ? 'green' : 'gray'} />
                                        </td>
                                        <td className="py-2 px-4">
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => {
                                                setEditItem(item);
                                                setEditItemForm({
                                                  name: item.name,
                                                  description: item.description ?? '',
                                                  category: item.category,
                                                  priceRwf: String(item.priceRwf),
                                                  photoUrl: item.photoUrl ?? '',
                                                  isAvailable: item.isAvailable,
                                                  prepTimeMins: item.prepTimeMins != null ? String(item.prepTimeMins) : '',
                                                  ingredients: item.ingredients ?? '',
                                                  allergens: item.allergens ?? '',
                                                });
                                              }}
                                              className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575] transition-colors"
                                            >
                                              <Pencil size={14} />
                                            </button>
                                            <button
                                              onClick={() => setDeleteTarget({ id: item.id, name: item.name })}
                                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="py-6 text-center text-sm text-[#757575]">No items yet.</p>
                            )}
                            <div className="px-6 py-3 border-t border-[#EEEEEE]">
                              <button
                                onClick={() => {
                                  setAddItemSectionId(section.id);
                                  setItemForm({ name: '', description: '', category: 'OTHER', priceRwf: '', photoUrl: '', isAvailable: true, prepTimeMins: '', ingredients: '', allergens: '' });
                                }}
                                className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
                              >
                                <Plus size={14} />
                                Add item to {section.name}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Section Modal */}
      {showAddSection && (
        <Modal
          title={`Add ${sectionType === 'FOOD' ? 'Food' : 'Drink'} Section`}
          onClose={() => { setShowAddSection(false); setSectionName(''); }}
        >
          <div className="space-y-4">
            {/* Type toggle */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(['FOOD', 'DRINK'] as MenuSectionType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSectionType(t)}
                    className={`py-3 rounded-xl text-sm font-medium border-2 transition-colors ${
                      sectionType === t
                        ? 'border-primary bg-green-50 text-primary'
                        : 'border-[#E0E0E0] text-[#757575] hover:border-gray-300'
                    }`}
                  >
                    {t === 'FOOD' ? '🍽 Food' : '🥤 Drink'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Section name</label>
              <input
                type="text"
                placeholder={sectionType === 'FOOD' ? 'e.g. Burgers, Pizza, Grills...' : 'e.g. Soft Drinks, Alcohol, Juices...'}
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#E0E0E0] rounded-xl outline-none focus:border-primary transition-colors"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowAddSection(false); setSectionName(''); }}
                className="px-4 py-2 text-sm text-[#757575]"
              >
                Cancel
              </button>
              <button
                onClick={() => addSectionMutation.mutate()}
                disabled={addSectionMutation.isPending || !sectionName.trim()}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg font-medium hover:bg-primaryDark disabled:opacity-50 transition-colors"
              >
                {addSectionMutation.isPending ? 'Adding...' : 'Add Section'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Item Modal */}
      {addItemSectionId && (
        <Modal title="Add Menu Item" onClose={() => setAddItemSectionId(null)} maxWidth="max-w-xl">
          <ItemForm
            form={itemForm}
            setForm={setItemForm}
            onCancel={() => setAddItemSectionId(null)}
            onSave={() => addItemMutation.mutate()}
            saving={addItemMutation.isPending}
          />
        </Modal>
      )}

      {/* Edit Item Modal */}
      {editItem && (
        <Modal title={`Edit — ${editItem.name}`} onClose={() => setEditItem(null)} maxWidth="max-w-xl">
          <ItemForm
            form={editItemForm}
            setForm={setEditItemForm}
            onCancel={() => setEditItem(null)}
            onSave={() => editItemMutation.mutate()}
            saving={editItemMutation.isPending}
          />
        </Modal>
      )}

      {/* Delete menu item confirm */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete menu item?"
          message={`"${deleteTarget.name}" will be permanently removed from the menu.`}
          onConfirm={() => deleteItemMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteItemMutation.isPending}
        />
      )}

      {/* Delete restaurant confirm */}
      {showDeleteRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowDeleteRestaurant(false); setDeleteRestaurantError(''); }} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#1A1A1A]">Delete restaurant?</h3>
                <p className="text-sm text-[#757575] mt-1">
                  <span className="font-medium text-[#1A1A1A]">{data.businessName}</span> and all its menu sections and items will be permanently removed.
                </p>
                {deleteRestaurantError && (
                  <p className="text-sm text-[#E53935] mt-2 bg-red-50 rounded-lg px-3 py-2">{deleteRestaurantError}</p>
                )}
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => { setShowDeleteRestaurant(false); setDeleteRestaurantError(''); }}
                  disabled={deleteRestaurantMutation.isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-[#757575] border border-[#E0E0E0] rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteRestaurantMutation.mutate()}
                  disabled={deleteRestaurantMutation.isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {deleteRestaurantMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ItemFormState {
  name: string;
  description: string;
  category: string;
  priceRwf: string;
  photoUrl: string;
  isAvailable: boolean;
  prepTimeMins: string;
  ingredients: string;
  allergens: string;
}

function ItemForm({
  form,
  setForm,
  onCancel,
  onSave,
  saving,
}: {
  form: ItemFormState;
  setForm: React.Dispatch<React.SetStateAction<ItemFormState>>;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(form.photoUrl || null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setPhotoPreview(URL.createObjectURL(file));
    setUploading(true);
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
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Photo upload */}
      <div>
        <label className="block text-xs font-medium text-[#757575] mb-1">Photo</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-full h-32 border-2 border-dashed border-[#E0E0E0] rounded-xl overflow-hidden hover:border-primary transition-colors flex items-center justify-center bg-[#F5F5F5]"
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
                  if (fileRef.current) fileRef.current.value = '';
                }}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
              >
                <X size={14} className="text-[#757575]" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-[#757575]">
              {uploading ? (
                <span className="text-sm">Uploading...</span>
              ) : (
                <>
                  <Upload size={20} />
                  <span className="text-sm">Click to upload photo</span>
                </>
              )}
            </div>
          )}
        </button>
      </div>

      {[
        { label: 'Name', key: 'name', placeholder: 'Beef Burger' },
        { label: 'Description', key: 'description', placeholder: 'Optional description' },
        { label: 'Price (RWF)', key: 'priceRwf', placeholder: '5000' },
        { label: 'Prep time (mins)', key: 'prepTimeMins', placeholder: '15' },
        { label: 'Ingredients', key: 'ingredients', placeholder: 'Beef, lettuce, tomato...' },
        { label: 'Allergens', key: 'allergens', placeholder: 'Gluten, dairy...' },
      ].map(({ label, key, placeholder }) => (
        <div key={key}>
          <label className="block text-xs font-medium text-[#757575] mb-1">{label}</label>
          <input
            type="text"
            placeholder={placeholder}
            value={form[key as keyof ItemFormState] as string}
            onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-[#E0E0E0] rounded-lg outline-none focus:border-primary transition-colors"
          />
        </div>
      ))}
      <div>
        <label className="block text-xs font-medium text-[#757575] mb-1">Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-[#E0E0E0] rounded-lg outline-none focus:border-primary transition-colors bg-white"
        >
          {FOOD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.isAvailable}
          onChange={(e) => setForm((prev) => ({ ...prev, isAvailable: e.target.checked }))}
          className="accent-primary"
          id="isAvailable"
        />
        <label htmlFor="isAvailable" className="text-sm text-[#1A1A1A]">Available</label>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-[#757575]">Cancel</button>
        <button
          onClick={onSave}
          disabled={saving || uploading || !form.name || !form.priceRwf}
          className="px-4 py-2 text-sm bg-primary text-white rounded-lg font-medium hover:bg-primaryDark disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : uploading ? 'Uploading...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
