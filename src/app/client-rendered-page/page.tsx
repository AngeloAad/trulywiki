"use client";

import { authClient } from "@/lib/auth/client";

export default function ClientRenderedPage() {
  const { data } = authClient.useSession();

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Client Rendered Page</h1>

      <p className="text-muted-foreground">
        Authenticated:{" "}
        <span
          className={
            data?.session ? "text-primary font-semibold" : "text-destructive font-semibold"
          }
        >
          {data?.session ? "Yes" : "No"}
        </span>
      </p>

      {data?.user && (
        <p className="text-muted-foreground">User ID: {data.user.id}</p>
      )}

      <p className="font-medium text-foreground">
        Session and User Data:
      </p>

      <pre className="bg-card p-4 rounded text-sm overflow-x-auto text-card-foreground border border-border">
        {JSON.stringify({ session: data?.session, user: data?.user }, null, 2)}
      </pre>
    </div>
  );
}
