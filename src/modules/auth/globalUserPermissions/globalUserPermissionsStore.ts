import { create } from "zustand";
import type { TGlobalUserPermissions } from "./dbGlobalUserPermissions";

type TState = TGlobalUserPermissions | undefined | null;

export const useGlobalUserPermissionsStore = create<{
  data: TState;
  setData: (x: TState) => void;
  clear: () => void;
}>()((set) => ({
  data: undefined,
  setData: (data) => set(() => ({ data })),
  clear: () => set(() => ({ data: undefined })),
}));
