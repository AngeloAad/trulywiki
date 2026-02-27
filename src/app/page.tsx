import { PaginationControls } from "@/components/ui/pagination-controls";
import { WikiCard } from "@/components/ui/wiki-card";
import { getArticles } from "@/lib/data/articles";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = page ? Number.parseInt(page, 10) : 1;
  const { articles, totalPages } = await getArticles(currentPage);

  return (
    <div>
      <main className="max-w-2xl mx-auto mt-10 flex flex-col gap-6 pb-10">
        {articles.map((article) => (
          <WikiCard
            key={article.id}
            title={article.title}
            author={article.author ?? "Unknown"}
            date={article.createdAt}
            summary={article.summary ?? "Summary not done yet"}
            href={`/wiki/${article.id}`}
          />
        ))}

        <PaginationControls totalPages={totalPages} currentPage={currentPage} />
      </main>
    </div>
  );
}
