import { describe, expect, it } from "vitest";
import { pb } from "../config/pocketbaseConfig";

describe("PocketBase auth rules", () => {
  it("rejects invalid credentials", async () => {
    await expect(
      pb.collection("users").authWithPassword("test@example.com", "wrong-password"),
    ).rejects.toThrow();
  });
});
