"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { api, getApiErrorMessage } from "@/lib/api";

export function EnterCodeClient({ email }: { email: string }) {
  const router = useRouter();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [isPending, setIsPending] = useState(false);
  const code = useMemo(() => digits.join(""), [digits]);

  function updateDigit(index: number, value: string) {
    const clean = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => current.map((digit, idx) => (idx === index ? clean : digit)));
  }

  async function handleVerify() {
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setIsPending(true);
    try {
      const data = await api.verifyOtp({
        email,
        code,
        purpose: "forgot_password",
      });
      router.push(
        `/change-password?email=${encodeURIComponent(email)}&resetToken=${encodeURIComponent(
          data.resetToken,
        )}`,
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AuthCard
      title="Enter Code"
      subtitle="Please check your Email for a message with your code. Your code is 6 numbers long."
      className="max-w-[728px]"
    >
      <div className="mx-auto max-w-[664px]">
        <div className="mb-6 flex justify-center gap-4">
          {digits.map((digit, index) => (
            <input
              key={index}
              className="h-[72px] w-[72px] rounded-xl border border-[#d4a100] bg-transparent text-center text-4xl font-semibold outline-none"
              inputMode="numeric"
              maxLength={1}
              onChange={(event) => updateDigit(index, event.target.value)}
              value={digit}
            />
          ))}
        </div>
        <p className="mb-16 text-center text-sm text-[#c8c8c8]">Resend code in 43s</p>
        <Button
          className="h-14 w-full text-[18px]"
          disabled={isPending}
          onClick={handleVerify}
          type="button"
        >
          {isPending ? "Verifying..." : "Verify Code"}
        </Button>
      </div>
    </AuthCard>
  );
}
