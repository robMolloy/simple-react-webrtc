import z from "zod";
import type { PocketBase } from "../pocketbaseTypeHelpers";

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
    const unsubPromise = p.pb.collection(collectionName).subscribe(p.userId, (e) => {
      const parseResp = globalUserPermissionsSchema.safeParse(e.record);
      p.onChange(parseResp.success ? parseResp.data : null);
    });
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
