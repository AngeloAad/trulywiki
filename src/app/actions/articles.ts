"use server";

import { redirect } from "next/navigation";
import { ensureUserExists } from "@/db/sync-user";
import { auth } from "@/lib/auth/server";

export type CreateArticleInput = {
  title: string;
  content: string;
  authorId: string;
  imageUrl?: string;
};

export type UpdateArticleInput = {
  title?: string;
  content?: string;
  imageUrl?: string;
};

export async function createArticle(data: CreateArticleInput) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await ensureUserExists(session.user);

  // TODO: Replace with actual database call
  console.log("✨ createArticle called:", data);
  return { success: true, message: "Article create logged (stub)" };
}

export async function updateArticle(id: string, data: UpdateArticleInput) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const authorId = session.user.id;

  // TODO: Replace with actual database update
  console.log("📝 updateArticle called:", { authorId, ...data });
  return { success: true, message: `Article ${id} update logged (stub)` };
}

export async function deleteArticle(id: string) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const authorId = session.user.id;

  // TODO: Replace with actual database delete
  console.log("🗑️ deleteArticle called:", { authorId, id });
  return { success: true, message: `Article ${id} delete logged (stub)` };
}

// Form-friendly server action: accepts FormData from a client form and calls deleteArticle
export async function deleteArticleForm(formData: FormData): Promise<void> {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id");
  if (!id) {
    throw new Error("Missing article id");
  }

  await deleteArticle(String(id));
  // After deleting, redirect the user back to the homepage.
  redirect("/");
}

import { getArticles } from "@/lib/data/articles";

export async function fetchArticlesAction(page: number = 1) {
  return await getArticles(page);
}
