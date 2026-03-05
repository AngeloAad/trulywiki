import { eq, isNull } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import summarizeArticle from "@/ai/summarize";
import db from "@/db";
import { articles } from "@/db/schema";
import { clearArticlesCache } from "@/lib/data/articles";

export async function GET(req: NextRequest) {
  if (
    process.env.NODE_ENV !== "development" &&
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find articles that don't yet have a summary
  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      content: articles.content,
    })
    .from(articles)
    .where(isNull(articles.summary));

  if (!rows || rows.length === 0) {
    return NextResponse.json({ ok: true, updated: 0 });
  }

  let updated = 0;
  console.log("🤖 Starting AI Summary Cron Job");

  for (const row of rows) {
    try {
      const summary = await summarizeArticle(row.title ?? "", row.content);

      if (summary && summary.trim().length > 0) {
        await db
          .update(articles)
          .set({ summary })
          .where(eq(articles.id, row.id));
        updated++;
      }
    } catch (error) {
      // log and continue with next article
      console.error("Failed to summarize article id = ", row.id, error);
    }
  }

  if (updated > 0) {
    await clearArticlesCache();
  }

  console.log(`🤖 Concluding AI summary job, updated ${updated} rows`);

  return NextResponse.json({ ok: true, updated });
}
