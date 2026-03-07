"use client";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const { addToast } = useAppStore();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await login(formData.email, formData.password);
      addToast("Login successful! Redirecting...", "success");
      router.push("/dashboard");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      addToast(errorMessage, "error");
    }
  };

  return (
    <AuthLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Admin Login
          </h1>
          <p className="text-neutral-600">Sign in to your admin account</p>
          <p className="text-sm text-amber-600 mt-2 bg-amber-50 p-2 rounded">
            ⚠️ This dashboard is restricted to admin users only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="admin@jawlatours.com"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            className="mt-6"
          >
            Sign In
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
