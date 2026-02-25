import { notFound } from "next/navigation";
import WikiArticleViewer from "@/components/wiki-article-viewer";
import { authorizedUserToEditArticle } from "@/db/authz";
import { auth } from "@/lib/auth/server";
import { getArticleById } from "@/lib/data/articles";

interface ViewArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ViewArticlePage({
  params,
}: ViewArticlePageProps) {
  const { data: session } = await auth.getSession();
  const { id } = await params;
  const article = await getArticleById(Number(id));

  if (!article) {
    notFound();
  }

  const authorizedUser = session?.user?.id
    ? await authorizedUserToEditArticle(session.user.id, Number(id))
    : false;

  return <WikiArticleViewer article={article} canEdit={authorizedUser} />;
}
