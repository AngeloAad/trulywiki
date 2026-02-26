import { count, desc, eq } from "drizzle-orm";
import db from "@/db";
import { articles, usersSync } from "@/db/schema";

export async function getArticles(page: number = 1, pageSize: number = 10) {
  // 1. Calculate how many rows to skip
  const offset = (page - 1) * pageSize;

  // 2. Fetch exactly the page we need, ordered by newest first
  const data = await db
    .select({
      title: articles.title,
      id: articles.id,
      createdAt: articles.createdAt,
      content: articles.content,
      author: usersSync.name,
    })
    .from(articles)
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id))
    .orderBy(desc(articles.id))
    .limit(pageSize)
    .offset(offset);

  // 3. Get the total count of articles so we can calculate total pages
  const [totalResult] = await db.select({ count: count() }).from(articles);
  const total = totalResult.count;
  const totalPages = Math.ceil(total / pageSize);

  return {
    articles: data,
    totalPages,
    currentPage: page,
  };
}

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
  return response[0] ? response[0] : null;
}
