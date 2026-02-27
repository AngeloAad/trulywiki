import { count, desc, eq } from "drizzle-orm";
import redis from "@/cache";
import db from "@/db";
import { articles, usersSync } from "@/db/schema";

export type ArticleListItem = {
  id: number;
  title: string;
  content: string;
  author: string | null;
  imageUrl?: string | null;
  summary?: string | null;
  createdAt: string;
};

export type PaginatedArticles = {
  articles: ArticleListItem[];
  totalPages: number;
  currentPage: number;
};

export async function getArticles(page: number = 1, pageSize: number = 10) {
  const cached = await redis.get<PaginatedArticles>("articles:all");

  if (cached) {
    console.log("✅ Get Articles Cache Hit!");
    return cached;
  }
  console.log("🆕 Get Articles Cache Miss!");

  const offset = (page - 1) * pageSize;

  const data = await db
    .select({
      title: articles.title,
      id: articles.id,
      createdAt: articles.createdAt,
      content: articles.content,
      author: usersSync.name,
      summary: articles.summary,
    })
    .from(articles)
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id))
    .orderBy(desc(articles.id))
    .limit(pageSize)
    .offset(offset);

  const [totalResult] = await db.select({ count: count() }).from(articles);
  const total = totalResult.count;
  const totalPages = Math.ceil(total / pageSize);

  const response: PaginatedArticles = {
    articles: data,
    totalPages,
    currentPage: page,
  };

  try {
    // Upstash automatically serializes objects, no need for JSON.stringify!
    redis.set("articles:all", response, {
      ex: 60,
    });
  } catch (error) {
    console.warn("Failed to set articles cache", error);
  }

  return response;
}

export type ArticleWithAuthor = {
  id: number;
  title: string;
  content: string;
  author: string | null;
  imageUrl?: string | null;
  createdAt: string;
};

export async function getArticleById(id: number) {
  const response = await db
    .select({
      title: articles.title,
      id: articles.id,
      createdAt: articles.createdAt,
      content: articles.content,
      author: usersSync.name,
      imageUrl: articles.imageUrl,
    })
    .from(articles)
    .where(eq(articles.id, id))
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id));

  return response[0] ? (response[0] as unknown as ArticleWithAuthor) : null;
}
