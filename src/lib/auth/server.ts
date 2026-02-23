import assert from "node:assert";
import { createNeonAuth } from "@neondatabase/auth/next/server";

assert(
  process.env.NEON_AUTH_BASE_URL,
  "YOU NEED A NEON_AUTH_BASE_URL IN YOUR .env file!!",
);
assert(
  process.env.NEON_AUTH_COOKIE_SECRET,
  "YOU NEED A NEON_AUTH_COOKIE_SECRET IN YOUR .env file!!",
);

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET,
  },
});
