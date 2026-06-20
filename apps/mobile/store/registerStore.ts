import { create } from 'zustand';

interface RegisterState {
  phoneNumber: string;
  setPhoneNumber: (phoneNumber: string) => void;
  reset: () => void;
}

export const useRegisterStore = create<RegisterState>((set) => ({
  phoneNumber: '',
  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
  reset: () => set({ phoneNumber: '' }),
}));
