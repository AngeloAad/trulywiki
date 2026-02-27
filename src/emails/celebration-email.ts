import { eq } from "drizzle-orm";
import db from "@/db";
import { articles, usersSync } from "@/db/schema";
import resend from ".";

export default async function sendCelebrationEmail(
  articleId: number,
  pageviews: number,
) {
  try {
    const response = await db
      .select({
        email: usersSync.email,
        id: usersSync.id,
      })
      .from(articles)
      .leftJoin(usersSync, eq(articles.authorId, usersSync.id))
      .where(eq(articles.id, articleId));

    if (!response.length) {
      console.log(`❌ could not find article ${articleId}`);
      return;
    }

    const { email, id } = response[0];

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
      html: "<h1>Congrats!</h1><p>You're an amazing author!</p>",
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
