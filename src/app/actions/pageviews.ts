"use server";

import redis from "@/cache";
import sendCelebrationEmail from "@/emails/celebration-email";

const keyFor = (id: number) => `pageviews:article:${id}`;
const milestones = [10, 50, 100, 1000];

export async function incrementPageview(articleId: number) {
  try {
    const articleKey = keyFor(articleId);
    const newVal = await redis.incr(articleKey);

    if (milestones.includes(newVal)) {
      sendCelebrationEmail(articleId, newVal);
    }

    return newVal;
  } catch (error) {
    console.warn("Failed to increment pageview: ", error);
    return null;
  }
}
