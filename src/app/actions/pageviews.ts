"use server";

import redis from "@/cache";

const keyFor = (id: number) => `pageviews:article:${id}`;

export async function incrementPageview(articleId: number) {
  try {
    const articleKey = keyFor(articleId);
    const newVal = await redis.incr(articleKey);
    return newVal;
  } catch (error) {
    console.warn("Failed to increment pageview: ", error);
    return null;
  }
}
