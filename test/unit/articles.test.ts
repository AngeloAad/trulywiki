import { beforeEach, describe, expect, it, vi } from "vitest";
import summarizeArticle from "@/ai/summarize";
import {
  createArticle,
  deleteArticle,
  updateArticle,
} from "@/app/actions/articles";
import * as authz from "@/db/authz";
import db from "@/db/index";
import { articles } from "@/db/schema";
import { auth } from "@/lib/auth/server";

// Mock dependencies
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("@/db/index");
vi.mock("@/lib/auth/server", () => ({
  auth: {
    getSession: vi.fn(),
  },
}));
vi.mock("@/db/authz");
vi.mock("@/ai/summarize");
vi.mock("@/db/sync-user");

describe("Article Actions", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mocks
    vi.mocked(auth.getSession).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);
    vi.mocked(summarizeArticle).mockResolvedValue("Test summary");
  });

  describe("createArticle", () => {
    it("should create an article when user is authenticated", async () => {
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 1 }]),
        }),
      } as unknown as ReturnType<typeof db.insert>);

      const articleData = {
        title: "Test Article",
        content: "Test content",
        authorId: mockUser.id,
        imageUrl: "https://example.com/image.jpg",
      };

      const result = await createArticle(articleData);

      expect(result).toEqual({
        success: true,
        message: "Article created successfully",
        id: 1,
      });
      expect(db.insert).toHaveBeenCalledWith(articles);
    });

    it("should throw error when user is not authenticated", async () => {
      vi.mocked(auth.getSession).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const articleData = {
        title: "Test Article",
        content: "Test content",
        authorId: "user-123",
      };

      const result = await createArticle(articleData);
      expect(result).toEqual({ success: false, error: "Unauthorized" });
      expect(db.insert).not.toHaveBeenCalled();
    });

    it("should handle article creation without optional imageUrl", async () => {
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 1 }]),
        }),
      } as unknown as ReturnType<typeof db.insert>);

      const articleData = {
        title: "Test Article",
        content: "Test content",
        authorId: mockUser.id,
      };

      const result = await createArticle(articleData);

      expect(result).toEqual({
        success: true,
        message: "Article created successfully",
        id: 1,
      });
      expect(db.insert).toHaveBeenCalledWith(articles);
    });
  });

  describe("updateArticle", () => {
    beforeEach(() => {
      vi.mocked(authz.authorizedUserToEditArticle).mockResolvedValue(true);
    });

    it("should update an article when user is authorized", async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({ id: 1 }),
        }),
      });
      vi.mocked(db.update).mockReturnValue({
        set: mockUpdate.mockReturnValue({
          where: vi.fn().mockResolvedValue({ id: 1 }),
        }),
      } as unknown as ReturnType<typeof db.update>);

      const updateData = {
        title: "Updated Title",
        content: "Updated content",
        imageUrl: "https://example.com/new-image.jpg",
      };

      const result = await updateArticle("1", updateData);

      expect(result).toEqual({
        success: true,
        message: "Article updated successfully",
      });
      expect(authz.authorizedUserToEditArticle).toHaveBeenCalledWith(
        mockUser.id,
        1,
      );
      expect(db.update).toHaveBeenCalledWith(articles);
    });

    it("should throw error when user is not authenticated", async () => {
      vi.mocked(auth.getSession).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await updateArticle("1", { title: "New Title" });
      expect(result).toEqual({ success: false, error: "Unauthorized" });
      expect(db.update).not.toHaveBeenCalled();
    });

    it("should throw error when user is not authorized to edit", async () => {
      vi.mocked(authz.authorizedUserToEditArticle).mockResolvedValue(false);

      const result = await updateArticle("1", { title: "New Title" });
      expect(result).toEqual({ success: false, error: "Forbidden" });
      expect(db.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteArticle", () => {
    beforeEach(() => {
      vi.mocked(authz.authorizedUserToEditArticle).mockResolvedValue(true);
    });

    it("should delete an article when user is authorized", async () => {
      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({ id: 1 }),
      });
      vi.mocked(db.delete).mockReturnValue({
        where: mockDelete,
      } as unknown as ReturnType<typeof db.delete>);

      const result = await deleteArticle("1");

      expect(result).toEqual({
        success: true,
        message: "Article deleted successfully",
      });
      expect(authz.authorizedUserToEditArticle).toHaveBeenCalledWith(
        mockUser.id,
        1,
      );
      expect(db.delete).toHaveBeenCalledWith(articles);
    });

    it("should throw error when user is not authenticated", async () => {
      vi.mocked(auth.getSession).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await deleteArticle("1");
      expect(result).toEqual({ success: false, error: "Unauthorized" });
      expect(db.delete).not.toHaveBeenCalled();
    });

    it("should throw error when user is not authorized to delete", async () => {
      vi.mocked(authz.authorizedUserToEditArticle).mockResolvedValue(false);

      const result = await deleteArticle("1");
      expect(result).toEqual({ success: false, error: "Forbidden" });
      expect(db.delete).not.toHaveBeenCalled();
    });
  });
});
