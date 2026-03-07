"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { apiService } from "@/lib/api";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user, fetchProfile } = useAuthStore();
  const { addToast } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-neutral-600">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (formData.password && formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (
      formData.password &&
      formData.password !== formData.confirmPassword
    )
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await apiService.updateProfile(updateData);
      addToast("Profile updated successfully", "success");
      setIsEditing(false);
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      fetchProfile();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to update profile. Please try again.";
      addToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">My Profile</h1>
          <p className="text-neutral-600 mt-1">
            Manage your admin account settings
          </p>
        </div>

        {/* Profile Card */}
        <div className="card p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-primary-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  {user.name}
                </h2>
                <p className="text-neutral-600">{user.email}</p>
                <div className="mt-2">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant={isEditing ? "secondary" : "primary"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          {!isEditing ? (
            /* View Mode */
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-neutral-600 text-sm">Email</p>
                  <p className="text-lg font-medium text-neutral-900">
                    {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-600 text-sm">Phone</p>
                  <p className="text-lg font-medium text-neutral-900">
                    {user.phone}
                  </p>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-6">
                <p className="text-neutral-600 text-sm mb-4">Account Info</p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Account Created</span>
                    <span className="font-medium text-neutral-900">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Last Updated</span>
                    <span className="font-medium text-neutral-900">
                      {formatDate(user.updatedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">User ID</span>
                    <span className="font-mono text-sm text-neutral-900">
                      {user.id.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                error={errors.name}
              />

              <Input
                label="Email (Cannot be changed)"
                value={user.email}
                disabled
                className="bg-neutral-100"
              />

              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                error={errors.phone}
              />

              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Change Password
                </h3>

                <Input
                  label="New Password (Optional)"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  error={errors.password}
                  placeholder="Leave empty to keep current password"
                  hint="Minimum 6 characters"
                />

                {formData.password && (
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    error={errors.confirmPassword}
                    placeholder="Re-enter password"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-6 border-t border-neutral-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
