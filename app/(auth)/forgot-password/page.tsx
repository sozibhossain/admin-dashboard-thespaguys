"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, getApiErrorMessage } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    try {
      await api.forgotPassword({ email });
      toast.success("OTP sent to your email");
      router.push(`/enter-code?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AuthCard title="Forgot password?" subtitle="Enter your email to recover your password">
      <form className="mx-auto max-w-[664px] space-y-14" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-[16px] font-medium text-white">Email</label>
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            type="email"
            required
          />
        </div>
        <Button className="h-14 w-full text-[18px]" disabled={isPending} type="submit">
          {isPending ? "Sending..." : "Send OTP"}
        </Button>
      </form>
    </AuthCard>
  );
}
