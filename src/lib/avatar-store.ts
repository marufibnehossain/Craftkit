import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProfileStore {
  avatarUrl: string | null;
  profileName: string;
  profileEmail: string;
  setAvatarUrl: (url: string | null) => void;
  setProfileName: (name: string) => void;
  setProfileEmail: (email: string) => void;
}

export const useAvatarStore = create<ProfileStore>()(
  persist(
    (set) => ({
      avatarUrl: null,
      profileName: "",
      profileEmail: "",
      setAvatarUrl: (url) => set({ avatarUrl: url }),
      setProfileName: (name) => set({ profileName: name }),
      setProfileEmail: (email) => set({ profileEmail: email }),
    }),
    { name: "craftly-avatar" }
  )
);
