import z from "zod";
import type { PocketBase } from "../pocketbaseTypeHelpers";
import { create } from "zustand";
import { useEffect } from "react";
import { useReactiveAuthStore } from "./useReactiveAuthStore";

const collectionName = "globalUserPermissions";

export const globalUserPermissionsSchema = z.object({
  collectionId: z.string(),
  collectionName: z.literal(collectionName),
  id: z.string(),
  status: z.enum(["pending", "approved", "blocked"]),
  role: z.enum(["standard", "admin"]),
});

export type TGlobalUserPermissions = z.infer<typeof globalUserPermissionsSchema>;

export const getGlobalUserPermissions = async (p: { pb: PocketBase; userId: string }) => {
  try {
    const globalUserPermissionsResp = await p.pb
      .collection(collectionName)
      .getFirstListItem(`userId="${p.userId}"`);
    return globalUserPermissionsSchema.safeParse(globalUserPermissionsResp);
  } catch (e) {
    const error = e as { message: string };
    return { success: false, error } as const;
  }
};

export const subscribeToGlobalUserPermissions = async (p: {
  pb: PocketBase;
  userId: string;
  onChange: (e: TGlobalUserPermissions | null) => void;
}) => {
  try {
    const unsubPromise = p.pb.collection(collectionName).subscribe(
      "*",
      (e) => {
        const parseResp = globalUserPermissionsSchema.safeParse(e.record);
        p.onChange(parseResp.success ? parseResp.data : null);
      },
      { filter: `userId="${p.userId}"` },
    );
    const globalUserPermissionsPromise = getGlobalUserPermissions({ pb: p.pb, userId: p.userId });

    // subscription must be complete to avoid any race conditions issues
    // avoid using promises.all to be explicit
    const unsub = await unsubPromise;
    const globalUserPermissionsResp = await globalUserPermissionsPromise;

    p.onChange(globalUserPermissionsResp.success ? globalUserPermissionsResp.data : null);

    return { success: true, data: unsub } as const;
  } catch (error) {
    p.onChange(null);
    return { success: false, error } as const;
  }
};

export const updateGlobalUserPermissionsStatus = async (p: {
  pb: PocketBase;
  id: string;
  status: TGlobalUserPermissions["status"];
}) => {
  try {
    const resp = await p.pb.collection(collectionName).update(p.id, { status: p.status });
    return { success: true, data: resp } as const;
  } catch (error) {
    return { success: false, error } as const;
  }
};

export const updateGlobalUserPermissionsRole = async (p: {
  pb: PocketBase;
  id: string;
  role: TGlobalUserPermissions["role"];
}) => {
  try {
    const resp = await p.pb.collection(collectionName).update(p.id, { role: p.role });
    return { success: true, data: resp } as const;
  } catch (error) {
    return { success: false, error } as const;
  }
};

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

export const useGlobalUserPermissionsStoreSync = (p: { pb: PocketBase }) => {
  const globalUserPermissionsStore = useGlobalUserPermissionsStore();
  const reactiveAuthStore = useReactiveAuthStore();

  useEffect(() => {
    (async () => {
      if (!reactiveAuthStore.data)
        return globalUserPermissionsStore.setData(reactiveAuthStore.data);
      const userId = reactiveAuthStore.data.record?.id;
      if (!userId) return globalUserPermissionsStore.setData(null);
      const resp = await getGlobalUserPermissions({ pb: p.pb, userId });
      globalUserPermissionsStore.setData(resp.success ? resp.data : null);
    })();
  }, [reactiveAuthStore.data]);
};
