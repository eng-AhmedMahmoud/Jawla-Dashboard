"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/Loading";
import { useAppStore } from "@/store/useAppStore";
import { apiService } from "@/lib/api";
import { Blog } from "@/types";
import { formatDate, generateSlug } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Edit2, Trash2, Plus, Search } from "lucide-react";

export default function BlogsPage() {
  const { addToast } = useAppStore();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
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
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllBlogsAdmin();
      setBlogs(Array.isArray(data) ? data : data.data || []);
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to fetch blogs",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: Blog) => {
    if (item) {
      setIsEditMode(true);
      setSelectedBlog(item);
      setFormData({
        title: item.title,
        content: item.content,
        slug: item.slug,
        metaTitle: item.metaTitle || "",
        metaDescription: item.metaDescription || "",
        image: item.image || "",
        tags: item.tags,
        newTag: "",
        isPublished: item.isPublished,
      });
    } else {
      setIsEditMode(false);
      setSelectedBlog(null);
      setFormData({
        title: "",
        content: "",
        slug: "",
        metaTitle: "",
        metaDescription: "",
        image: "",
        tags: [],
        newTag: "",
        isPublished: false,
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleAddTag = () => {
    if (formData.newTag.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.newTag],
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

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !isEditMode ? generateSlug(title) : prev.slug,
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

    try {
      const submitData = {
        title: formData.title,
        content: formData.content,
        slug: formData.slug || generateSlug(formData.title),
        metaTitle: formData.metaTitle || formData.title,
        metaDescription:
          formData.metaDescription ||
          formData.content.substring(0, 160),
        image: formData.image,
        tags: formData.tags,
        isPublished: formData.isPublished,
      };

      if (isEditMode && selectedBlog) {
        await apiService.updateBlog(selectedBlog.id, submitData);
        addToast("Blog updated successfully", "success");
      } else {
        await apiService.createBlog(submitData);
        addToast("Blog created successfully", "success");
      }

      setIsModalOpen(false);
      fetchBlogs();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Operation failed. Please try again.";
      addToast(errorMsg, "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog article?")) {
      try {
        await apiService.deleteBlog(id);
        addToast("Blog deleted successfully", "success");
        fetchBlogs();
      } catch (error: any) {
        addToast(
          error.response?.data?.message || "Failed to delete blog",
          "error"
        );
      }
    }
  };

  const filteredBlogs = blogs.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Blogs</h1>
            <p className="text-neutral-600 mt-1">
              Create and manage blog content
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} />
            New Article
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
          <Input
            placeholder="Search blog articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Tags
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map((item) => (
                <tr key={item.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 rounded object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/48?text=Blog";
                          }}
                        />
                      )}
                      <div>
                        <p className="font-medium text-neutral-900">
                          {item.title}
                        </p>
                        <p className="text-xs text-neutral-500">{item.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs bg-neutral-200 text-neutral-700 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="text-xs bg-neutral-200 text-neutral-700 px-2 py-1 rounded">
                          +{item.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-600 text-sm">
                    {formatDate(item.createdAt || new Date())}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} className="text-neutral-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBlogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-600">No blog articles found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? "Edit Blog Article" : "Create New Blog Article"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {isEditMode ? "Update" : "Publish"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
          <Input
            label="Blog Title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            error={errors.title}
            placeholder="e.g., Top 10 Places to Visit in Egypt"
          />

          <Input
            label="Slug (URL)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="top-10-places-egypt"
            hint="Auto-generated from title"
          />

          <Textarea
            label="Content (HTML)"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            error={errors.content}
            placeholder="Write your blog content here... HTML tags are supported"
            className="min-h-32"
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

          <Input
            label="Cover Image URL"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://example.com/image.jpg"
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

          {/* Status */}
          <div>
            <label className="flex items-center gap-2 mb-4">
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
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
