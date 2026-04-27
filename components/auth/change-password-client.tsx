"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, getApiErrorMessage } from "@/lib/api";

export function ChangePasswordClient({
  email,
  resetToken,
}: {
  email: string;
  resetToken: string;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [form, setForm] = useState({
    email,
    password: "",
    confirmPassword: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsPending(true);
    try {
      await api.resetPassword({
        resetToken,
        newPassword: form.password,
        confirmPassword: form.confirmPassword,
      });
      toast.success("Password reset successfully");
      router.push("/sign-in");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AuthCard title="Change Password" subtitle="Change your password">
      <form className="mx-auto max-w-[664px] space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-[16px] font-medium text-white">Email</label>
          <Input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Email"
            type="email"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-[16px] font-medium text-white">New Password</label>
          <div className="relative">
            <Input
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              required
              className="pr-12"
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8f8f8f]"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[16px] font-medium text-white">Confirm Password</label>
          <div className="relative">
            <Input
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((current) => ({ ...current, confirmPassword: event.target.value }))
              }
              placeholder="Password"
              type={showConfirmPassword ? "text" : "password"}
              required
              className="pr-12"
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8f8f8f]"
              onClick={() => setShowConfirmPassword((current) => !current)}
              type="button"
            >
              {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </div>
        <div className="pt-14">
          <Button className="h-14 w-full text-[18px]" disabled={isPending} type="submit">
            {isPending ? "Saving..." : "Confirm"}
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}
