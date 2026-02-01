import type { BaseAuthStore } from "pocketbase";
import { create } from "zustand";
import type { PocketBase } from "../pocketbaseTypeHelpers";
import { useEffect } from "react";

type TState = BaseAuthStore | undefined | null;
export const useReactiveAuthStore = create<{
  data: TState;
  setData: (x: TState) => void;
}>()((set) => ({
  data: undefined,
  setData: (data) => set(() => ({ data })),
}));

export const useReactiveAuthStoreSync = (p: { pb: PocketBase }) => {
  const reactiveAuthStore = useReactiveAuthStore();

  useEffect(() => {
    p.pb.authStore.onChange(() => {
      const isValid = !!p.pb.authStore.isValid;
      reactiveAuthStore.setData(isValid ? p.pb.authStore : null);
      if (!isValid) p.pb.authStore.clear();
    });
  }, []);
};
