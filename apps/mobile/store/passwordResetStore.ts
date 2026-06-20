import { create } from 'zustand';

interface PasswordResetState {
  phoneNumber: string;
  otp: string;
  setPhoneNumber: (phoneNumber: string) => void;
  setOtp: (otp: string) => void;
  reset: () => void;
}

export const usePasswordResetStore = create<PasswordResetState>((set) => ({
  phoneNumber: '',
  otp: '',
  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
  setOtp: (otp) => set({ otp }),
  reset: () => set({ phoneNumber: '', otp: '' }),
}));
