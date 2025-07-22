// lib/profileDraftStore.ts
import { create } from "zustand";

interface DraftInterest {
  interestName: string;
  category: string;
}

interface ProfileDraftState {
  interests: DraftInterest[];
  careers: string[];
  setInterests: (interests: DraftInterest[]) => void;
  setCareer: (career: string[]) => void;
  clear: () => void;
}

export const useProfileDraft = create<ProfileDraftState>((set) => ({
  interests: [],
  careers: [],
  setInterests: (interests) => set({ interests }),
  setCareer: (careers) => set({ careers }),
  clear: () => set({ interests: [], careers: [] }),
}));
