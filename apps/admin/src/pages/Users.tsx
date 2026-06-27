import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2 } from 'lucide-react';
import api from '../lib/api';
import Table, { Column } from '../components/Table';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

interface User {
  id: string;
  phoneNumber: string;
  fullName: string | null;
  email: string | null;
  profilePhotoUrl: string | null;
  role: 'ADMIN' | 'RESTAURANT_OWNER' | 'CUSTOMER' | 'RIDER';
  isVerified: boolean;
  createdAt: string;
}

interface UsersResponse {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

const roleBadgeColor: Record<string, 'green' | 'blue' | 'gray' | 'orange'> = {
  ADMIN: 'green',
  RESTAURANT_OWNER: 'blue',
  CUSTOMER: 'gray',
  RIDER: 'orange',
};

const ALL_ROLES = ['', 'ADMIN', 'RESTAURANT_OWNER', 'CUSTOMER', 'RIDER'];

export default function Users() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users', search, role],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (role) params.set('role', role);
      const res = await api.get<{ success: boolean; data: UsersResponse }>(`/admin/users?${params}`);
      return res.data.data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role: r }: { id: string; role: string }) => {
      await api.patch(`/admin/users/${id}`, { role: r });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUser(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDeleteTarget(null);
      setDeleteError('');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
        'Failed to delete user.';
      setDeleteError(msg);
    },
  });

  const columns: Column<User>[] = [
    {
      key: 'avatar',
      header: '',
      render: (u) => (
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
          {(u.fullName ?? u.phoneNumber).charAt(0).toUpperCase()}
        </div>
      ),
      className: 'w-12',
    },
    {
      key: 'name',
      header: 'Full Name',
      render: (u) => <span className="font-medium text-[#1A1A1A]">{u.fullName ?? '—'}</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (u) => <span className="text-[#757575]">{u.phoneNumber}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (u) => <span className="text-[#757575]">{u.email ?? '—'}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => <Badge label={u.role} color={roleBadgeColor[u.role] ?? 'gray'} />,
    },
    {
      key: 'verified',
      header: 'Verified',
      render: (u) => (
        <span className={`text-xs font-medium ${u.isVerified ? 'text-primary' : 'text-[#757575]'}`}>
          {u.isVerified ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      render: (u) => (
        <span className="text-[#757575] text-xs">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSelectedUser(u); setNewRole(u.role); }}
            className="text-xs text-primary hover:underline font-medium"
          >
            Edit role
          </button>
          <button
            onClick={() => { setDeleteTarget(u); setDeleteError(''); }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
            title="Delete user"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
          <input
            type="text"
            placeholder="Search name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E0E0E0] rounded-xl outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-3 py-2.5 text-sm border border-[#E0E0E0] rounded-xl outline-none focus:border-primary transition-colors bg-white text-[#1A1A1A]"
        >
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>{r || 'All roles'}</option>
          ))}
        </select>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-[#EEEEEE] shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-[#757575]">Loading...</div>
        ) : isError ? (
          <div className="p-12 text-center text-[#E53935]">Failed to load users.</div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-[#EEEEEE] flex items-center justify-between">
              <span className="text-sm text-[#757575]">{data?.total ?? 0} users</span>
            </div>
            <Table columns={columns} data={data?.items ?? []} emptyMessage="No users found" />
          </>
        )}
      </div>

      {/* Edit role modal */}
      {selectedUser && (
        <Modal title={`Edit role — ${selectedUser.fullName ?? selectedUser.phoneNumber}`} onClose={() => setSelectedUser(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#E0E0E0] rounded-xl outline-none focus:border-primary transition-colors bg-white"
              >
                {['CUSTOMER', 'RIDER', 'RESTAURANT_OWNER', 'ADMIN'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-sm text-[#757575] hover:text-[#1A1A1A] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateRoleMutation.mutate({ id: selectedUser.id, role: newRole })}
                disabled={updateRoleMutation.isPending}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg font-medium hover:bg-primaryDark transition-colors disabled:opacity-50"
              >
                {updateRoleMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setDeleteTarget(null); setDeleteError(''); }} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#1A1A1A]">Delete user?</h3>
                <p className="text-sm text-[#757575] mt-1">
                  <span className="font-medium text-[#1A1A1A]">{deleteTarget.fullName ?? deleteTarget.phoneNumber}</span> will be permanently removed.
                  This cannot be undone.
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
