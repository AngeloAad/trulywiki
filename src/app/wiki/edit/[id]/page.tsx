import { notFound } from "next/navigation";
import WikiEditor from "@/components/wiki-editor";
import { getArticleById } from "@/lib/data/articles";

interface EditArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const { id } = await params;
  const article = await getArticleById(Number(id));
  if (!article) {
    notFound();
  }

  return (
    <WikiEditor
      initialTitle={article.title}
      initialContent={article.content}
      isEditing={true}
      articleId={String(article.id)}
    />
  );
}
