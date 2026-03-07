"use client";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAppStore } from "@/store/useAppStore";
import { apiService } from "@/lib/api";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { addToast } = useAppStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    try {
      await apiService.forgotPassword(email);
      addToast(
        "Password reset link sent to your email. Please check your inbox.",
        "success"
      );
      setSubmitted(true);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send reset link. Please try again.";
      addToast(errorMessage, "error");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout>
        <div className="p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Check Your Email
            </h1>
            <p className="text-neutral-600">
              We've sent a password reset link to{" "}
              <span className="font-medium">{email}</span>
            </p>
          </div>

          <p className="text-neutral-600 mb-6">
            Click the link in the email to reset your password. The link will
            expire in 24 hours.
          </p>

          <Link href="/auth/login">
            <Button fullWidth>Back to Login</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Reset Password
          </h1>
          <p className="text-neutral-600">
            Enter your email address and we'll send you a link to reset your
            password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            placeholder="admin@jawlatours.com"
          />

          <Button type="submit" fullWidth loading={loading} className="mt-6">
            Send Reset Link
          </Button>
        </form>

        <p className="text-center text-neutral-600 text-sm mt-6">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
