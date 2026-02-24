import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  totalPages: number;
  currentPage: number;
}

export function PaginationControls({
  totalPages,
  currentPage,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        className="gap-1 pl-2.5"
        disabled={currentPage <= 1}
        asChild={currentPage > 1}
      >
        {currentPage > 1 ? (
          <Link href={`/?page=${currentPage - 1}`}>
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Link>
        ) : (
          <>
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </>
        )}
      </Button>

      {/* Numbered Page Buttons */}
      <div className="flex items-center gap-1">
        {allPages.map((page) => {
          if (page === "...") {
            return (
              <div
                key={`ellipsis-${page}`}
                className="flex h-9 w-9 items-center justify-center"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
            );
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              className="h-9 w-9 hidden sm:inline-flex"
              asChild={currentPage !== page}
            >
              {currentPage === page ? (
                <span>{page}</span>
              ) : (
                <Link href={`/?page=${page}`}>{page}</Link>
              )}
            </Button>
          );
        })}
      </div>

      {/* Mobile Page Indicator (Simpler view for small screens) */}
      <div className="flex sm:hidden text-sm font-medium">
        Page {currentPage} of {totalPages}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        className="gap-1 pr-2.5"
        disabled={currentPage >= totalPages}
        asChild={currentPage < totalPages}
      >
        {currentPage < totalPages ? (
          <Link href={`/?page=${currentPage + 1}`}>
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <>
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

function generatePagination(currentPage: number, totalPages: number) {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}
