import { useReactiveAuthStore } from "./useReactiveAuthStore";
import type { PocketBase } from "../pocketbaseTypeHelpers";
import { useReactiveAuthStoreSync } from "./useReactiveAuthStore";

export const useAuthStores = () => {
  const reactiveAuthStore = useReactiveAuthStore();
  return {
    reactiveAuthStore,
  };
};

export const useAuthSync = (p: { pb: PocketBase }) => {
  useReactiveAuthStoreSync({ pb: p.pb });
};
