import { usersSync } from "@/db/schema";
import db from "./index";

type NeonAuthUser = {
  id: string;
  name: string;
  email: string;
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
      name: neonAuthUser.name,
      email: neonAuthUser.email,
    })
    .onConflictDoUpdate({
      target: usersSync.id,
      set: {
        name: neonAuthUser.name,
        email: neonAuthUser.email,
      },
    });
}
