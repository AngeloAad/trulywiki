"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import summarizeArticle from "@/ai/summarize";
import redis from "@/cache";
import db from "@/db";
import { authorizedUserToEditArticle } from "@/db/authz";
import { articles } from "@/db/schema";
import { ensureUserExists } from "@/db/sync-user";
import { auth } from "@/lib/auth/server";
import { getArticles } from "@/lib/data/articles";

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

export async function createArticle(articleData: CreateArticleInput) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await ensureUserExists(session.user);

    const summary = await summarizeArticle(
      articleData.title || "",
      articleData.content || "",
    );

    const response = await db
      .insert(articles)
      .values({
        title: articleData.title,
        content: articleData.content,
        slug: `${Date.now()}`,
        published: true,
        authorId: session.user.id,
        imageUrl: articleData.imageUrl ?? undefined,
        summary,
      })
      .returning({ id: articles.id });

    redis.del("articles:all");

    const articleId = response[0]?.id;

    revalidatePath("/");

    return {
      success: true,
      message: "Article created successfully",
      id: articleId,
    };
  } catch (error) {
    console.error("Failed to create article:", error);
    return {
      success: false,
      error: "Failed to create the article. Please try again later.",
    };
  }
}

export async function updateArticle(
  id: string,
  articleData: UpdateArticleInput,
) {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const authorizedUser = await authorizedUserToEditArticle(
    session.user.id,
    Number(id),
  );

  if (!authorizedUser) {
    return { success: false, error: "Forbidden" };
  }

  try {
    const summary = await summarizeArticle(
      articleData.title || "",
      articleData.content || "",
    );

    await db
      .update(articles)
      .set({
        title: articleData.title,
        content: articleData.content,
        imageUrl: articleData.imageUrl ?? undefined,
        summary,
      })
      .where(eq(articles.id, Number(id)));

    revalidatePath("/");
    revalidatePath(`/wiki/${id}`);

    return { success: true, message: `Article updated successfully` };
  } catch (error) {
    console.error("Failed to update article:", error);
    return {
      success: false,
      error: "Failed to update the article. Please try again later.",
    };
  }
}

export async function deleteArticle(id: string) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const authorizedUser = await authorizedUserToEditArticle(
    session.user.id,
    Number(id),
  );

  if (!authorizedUser) {
    return { success: false, error: "Forbidden" };
  }

  try {
    await db.delete(articles).where(eq(articles.id, Number(id)));

    revalidatePath("/");
    revalidatePath(`/wiki/${id}`);

    return { success: true, message: `Article deleted successfully` };
  } catch (error) {
    console.error("Failed to delete article:", error);

    return {
      success: false,
      error: "Failed to delete the article. Please try again later.",
    };
  }
}

// Form-friendly server action: accepts FormData from a client form and calls deleteArticle
export async function deleteArticleForm(formData: FormData) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const id = formData.get("id");
  if (!id) {
    return { success: false, error: "Missing article id" };
  }

  const result = await deleteArticle(String(id));

  if (!result.success) {
    return result;
  }

  // Next.js redirect MUST be called outside try...catch since it throws an error to navigate
  redirect("/");
}

export async function fetchArticlesAction(page: number = 1) {
  return await getArticles(page);
}
