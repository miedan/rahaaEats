import { create } from 'zustand';
import type { Address, BuildingType } from '@rahaa/shared';

interface AddressDraft {
  formattedAddress: string;
  lat: number;
  lng: number;
  label?: string;
  buildingType?: BuildingType;
  houseNumber?: string;
  apartmentName?: string;
  buildingNumber?: string;
  floorNumber?: string;
  doorNumber?: string;
  deliveryInstructions?: string;
  isDefault?: boolean;
}

interface AddressDraftState {
  draft: AddressDraft | null;
  savedAddress: Address | null;
  editingAddressId: string | null;
  returnTo: string;
  setDraft: (draft: AddressDraft) => void;
  updateDraft: (patch: Partial<AddressDraft>) => void;
  setSavedAddress: (address: Address) => void;
  setReturnTo: (path: string) => void;
  startEditing: (address: Address) => void;
  clearFlowState: () => void;
  reset: () => void;
}

const DEFAULT_RETURN_TO = '/(auth)/create-profile';

export const useAddressDraftStore = create<AddressDraftState>((set) => ({
  draft: null,
  savedAddress: null,
  editingAddressId: null,
  returnTo: DEFAULT_RETURN_TO,
  setDraft: (draft) => set({ draft }),
  updateDraft: (patch) =>
    set((state) => ({ draft: state.draft ? { ...state.draft, ...patch } : null })),
  setSavedAddress: (address) => set({ savedAddress: address }),
  setReturnTo: (path) => set({ returnTo: path }),
  startEditing: (address) =>
    set({
      editingAddressId: address.id,
      returnTo: '/address/manage',
      draft: {
        formattedAddress: address.formattedAddress ?? '',
        lat: address.lat,
        lng: address.lng,
        label: address.label,
        buildingType: address.buildingType ?? undefined,
        houseNumber: address.houseNumber ?? undefined,
        apartmentName: address.apartmentName ?? undefined,
        buildingNumber: address.buildingNumber ?? undefined,
        floorNumber: address.floorNumber ?? undefined,
        doorNumber: address.doorNumber ?? undefined,
        deliveryInstructions: address.deliveryInstructions ?? undefined,
        isDefault: address.isDefault,
      },
    }),
  clearFlowState: () =>
    set({ draft: null, editingAddressId: null, returnTo: DEFAULT_RETURN_TO }),
  reset: () =>
    set({ draft: null, savedAddress: null, editingAddressId: null, returnTo: DEFAULT_RETURN_TO }),
}));
