import { auth } from "@/lib/auth/server";

// Server components using auth methods must be rendered dynamically
export const dynamic = "force-dynamic";

export default async function ServerRenderedPage() {
  const { data: session } = await auth.getSession();

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Server Rendered Page</h1>

      <p className="text-muted-foreground">
        Authenticated:{" "}
        <span
          className={
            session ? "text-primary font-semibold" : "text-destructive font-semibold"
          }
        >
          {session ? "Yes" : "No"}
        </span>
      </p>

      {session?.user && (
        <p className="text-muted-foreground">User ID: {session.user.id}</p>
      )}

      <p className="font-medium text-foreground">
        Session and User Data:
      </p>

      <pre className="bg-card p-4 rounded text-sm overflow-x-auto text-card-foreground border border-border">
        {JSON.stringify(
          { session: session?.session, user: session?.user },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
