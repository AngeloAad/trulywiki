"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth/client";

/**
 * Runs once on mount: fetches session (e.g. after user returns from email
 * verification link) and refreshes the server tree so NavBar and other
 * server components show the updated session. See:
 * https://neon.com/docs/auth/guides/email-verification#check-session-on-mount
 */
export function SessionRefreshOnMount() {
  const router = useRouter();

  useEffect(() => {
    authClient.getSession().then(() => {
      router.refresh();
    });
  }, [router]);

  return null;
}
