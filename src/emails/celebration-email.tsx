import { eq } from "drizzle-orm";
import db from "@/db";
import { articles, usersSync } from "@/db/schema";
import resend from ".";
import CelebrationTemplate from "./templates/celebration-template";

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export default async function sendCelebrationEmail(
  articleId: number,
  pageviews: number,
) {
  try {
    const response = await db
      .select({
        email: usersSync.email,
        id: usersSync.id,
        name: usersSync.name,
        title: articles.title,
      })
      .from(articles)
      .leftJoin(usersSync, eq(articles.authorId, usersSync.id))
      .where(eq(articles.id, articleId));

    if (!response.length) {
      console.log(`❌ could not find article ${articleId}`);
      return;
    }

    const { email, id, name, title } = response[0];

    if (!email) {
      console.log(
        `❌ skipping sending a celebration for getting ${pageviews} on article ${articleId}, could not find email`,
      );
      return;
    }

    const emailRes = await resend.emails.send({
      from: "TrulyWiki <noreply@angeloworks.com>",
      to: email,
      subject: `✨ You article got ${pageviews} views! ✨`,
      react: (
        <CelebrationTemplate
          articleTitle={title}
          articleUrl={`${BASE_URL}/wiki/${articleId}`}
          name={name ?? "Friend"}
          pageviews={pageviews}
        />
      ),
    });
    if (!emailRes.error) {
      console.log(
        `📧 sent ${id} a celebration for getting ${pageviews} on article ${articleId}`,
      );
    } else {
      console.log(
        `❌ error sending ${id} a celebration for getting ${pageviews} on article ${articleId}`,
        emailRes.error,
      );
    }
  } catch (_error) {
    console.log("Failed to send Celebration Email");
  }
}
