import { create } from 'zustand';

interface ProfileDraft {
  fullName: string;
  email: string;
  photoUri: string | null;
}

interface ProfileDraftState extends ProfileDraft {
  setFullName: (fullName: string) => void;
  setEmail: (email: string) => void;
  setPhotoUri: (photoUri: string | null) => void;
  reset: () => void;
}

const initialDraft: ProfileDraft = { fullName: '', email: '', photoUri: null };

export const useProfileDraftStore = create<ProfileDraftState>((set) => ({
  ...initialDraft,
  setFullName: (fullName) => set({ fullName }),
  setEmail: (email) => set({ email }),
  setPhotoUri: (photoUri) => set({ photoUri }),
  reset: () => set(initialDraft),
}));
