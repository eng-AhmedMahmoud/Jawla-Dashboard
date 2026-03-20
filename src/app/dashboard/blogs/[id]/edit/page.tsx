"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/Loading";
import { useAppStore } from "@/store/useAppStore";
import { apiService } from "@/lib/api";
import { Blog } from "@/types";
import { generateSlug } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditBlogPage() {
  const { addToast } = useAppStore();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    image: "",
    tags: [] as string[],
    newTag: "",
    isPublished: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        // Fetch all blogs admin and find by ID
        const allBlogs = await apiService.getAllBlogsAdmin();
        const blogs: Blog[] = Array.isArray(allBlogs)
          ? allBlogs
          : allBlogs.data || [];
        const blog = blogs.find((b) => b.id === id);

        if (!blog) {
          addToast("Blog not found", "error");
          router.push("/dashboard/blogs");
          return;
        }

        setFormData({
          title: blog.title,
          content: blog.content,
          slug: blog.slug,
          metaTitle: blog.metaTitle || "",
          metaDescription: blog.metaDescription || "",
          image: blog.image || "",
          tags: blog.tags,
          newTag: "",
          isPublished: blog.isPublished,
        });
      } catch (error: any) {
        addToast(
          error.response?.data?.message || "Failed to load blog",
          "error"
        );
        router.push("/dashboard/blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleAddTag = () => {
    if (formData.newTag.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: "",
      }));
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.content) newErrors.content = "Content is required";
    if (!formData.tags.length) newErrors.tags = "At least one tag is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await apiService.updateBlog(id, {
        title: formData.title,
        content: formData.content,
        slug: formData.slug || generateSlug(formData.title),
        metaTitle: formData.metaTitle || formData.title,
        metaDescription:
          formData.metaDescription || formData.content.substring(0, 160),
        image: formData.image,
        tags: formData.tags,
        isPublished: formData.isPublished,
      });
      addToast("Blog updated successfully", "success");
      router.push("/dashboard/blogs");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Operation failed. Please try again.";
      addToast(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/blogs"
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Edit Article
            </h1>
            <p className="text-neutral-600 mt-1">
              Update the blog article details
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Blog Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              error={errors.title}
              placeholder="e.g., Top 10 Places to Visit in Egypt"
            />

            <Input
              label="Slug (URL)"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="top-10-places-egypt"
              hint="Change only if necessary"
            />

            <RichTextEditor
              label="Content"
              value={formData.content}
              onChange={(html) =>
                setFormData({ ...formData, content: html })
              }
              error={errors.content}
              placeholder="Write your blog content here..."
            />

            <Input
              label="Meta Title (SEO)"
              value={formData.metaTitle}
              onChange={(e) =>
                setFormData({ ...formData, metaTitle: e.target.value })
              }
              placeholder="Leave empty to use title"
            />

            <Textarea
              label="Meta Description (SEO)"
              value={formData.metaDescription}
              onChange={(e) =>
                setFormData({ ...formData, metaDescription: e.target.value })
              }
              placeholder="Leave empty to auto-generate from content"
              className="min-h-20"
            />

            <ImageUpload
              label="Cover Image"
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
            />

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={formData.newTag}
                  onChange={(e) =>
                    setFormData({ ...formData, newTag: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tag (e.g., Travel)"
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddTag}
                  variant="secondary"
                >
                  Add
                </Button>
              </div>

              {errors.tags && (
                <p className="text-red-500 text-sm mb-2">{errors.tags}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(i)}
                      className="text-primary-700 hover:text-primary-900 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) =>
                  setFormData({ ...formData, isPublished: e.target.checked })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-neutral-700 font-medium">
                Publish immediately
              </span>
            </label>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <Link href="/dashboard/blogs">
                <Button variant="secondary" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={submitting}>
                Update Article
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
