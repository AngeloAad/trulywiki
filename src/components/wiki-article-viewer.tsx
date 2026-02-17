"use client";

import MDEditor from "@uiw/react-md-editor";
import { Calendar, Edit3, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  imageUrl?: string;
}

interface WikiArticleViewerProps {
  article: Article;
  canEdit?: boolean;
}

export default function WikiArticleViewer({
  article,
  canEdit = false,
}: WikiArticleViewerProps) {
  return (
    <div
      className="container mx-auto px-4 py-8 max-w-4xl"
      data-color-mode="light"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{article.title}</CardTitle>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <User className="h-4 w-4" />
              {article.author}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {article.createdAt}
            </span>
            {canEdit && (
              <Link href={`/wiki/edit/${article.id}`} className="ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  className="inline-flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit article
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {article.imageUrl && (
            <div className="mb-6">
              <Image
                src={article.imageUrl}
                alt={article.title}
                width={1200}
                height={630}
                className="w-full rounded-md border bg-muted object-cover"
              />
            </div>
          )}
          <div
            className="prose max-w-none prose-sm sm:prose-base dark:prose-invert"
            data-color-mode="light"
          >
            <MDEditor.Markdown source={article.content} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
