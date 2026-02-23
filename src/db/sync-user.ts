import { usersSync } from "@/db/schema";
import db from "./index";

type NeonAuthUser = {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
};

/**
 * Ensures the Neon Auth user exists in our local users table.
 * Call this before creating articles to ensure the foreign key reference works.
 */
export async function ensureUserExists(
  neonAuthUser: NeonAuthUser,
): Promise<void> {
  await db
    .insert(usersSync)
    .values({
      id: neonAuthUser.id,
      name: neonAuthUser.displayName,
      email: neonAuthUser.primaryEmail,
    })
    .onConflictDoUpdate({
      target: usersSync.id,
      set: {
        name: neonAuthUser.displayName,
        email: neonAuthUser.primaryEmail,
      },
    });
}
