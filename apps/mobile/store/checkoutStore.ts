import { create } from 'zustand';

interface AppliedCoupon {
  code: string;
  discountRwf: number;
}

interface CheckoutState {
  deliveryAddressId: string | null;
  momoNumberId: string | null;
  momoPhone: string | null;
  momoProvider: 'MTN' | 'AIRTEL' | null;
  appliedCoupon: AppliedCoupon | null;
  setDeliveryAddressId: (id: string) => void;
  setMomoNumber: (id: string, phone: string, provider: 'MTN' | 'AIRTEL') => void;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  deliveryAddressId: null,
  momoNumberId: null,
  momoPhone: null,
  momoProvider: null,
  appliedCoupon: null,
  setDeliveryAddressId: (id) => set({ deliveryAddressId: id }),
  setMomoNumber: (id, phone, provider) => set({ momoNumberId: id, momoPhone: phone, momoProvider: provider }),
  setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
  reset: () =>
    set({
      deliveryAddressId: null,
      momoNumberId: null,
      momoPhone: null,
      momoProvider: null,
      appliedCoupon: null,
    }),
}));
