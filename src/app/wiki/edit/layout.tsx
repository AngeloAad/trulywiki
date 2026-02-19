import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export default async function EditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return <div>{children}</div>;
}
