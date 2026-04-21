"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignInClient({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [form, setForm] = useState({
    email: "admin@gmail.com",
    password: "123456",
  });

  useEffect(() => {
    if (initialError) {
      toast.error(initialError.replace(/\+/g, " "));
    }
  }, [initialError]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);

    const response = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setIsPending(false);

    if (response?.error) {
      toast.error(response.error);
      return;
    }

    toast.success("Signed in successfully");
    router.push("/dashboard/overview");
    router.refresh();
  }

  return (
    <AuthCard title="Welcome Back" subtitle="Sign In to your account">
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
          <label className="text-[16px] font-medium text-white">Password</label>
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
        <div className="flex flex-col items-start justify-between gap-4 text-[16px] text-white sm:flex-row sm:items-center">
          <label className="flex items-center gap-2">
            <input className="size-4 accent-[#f4c542]" defaultChecked type="checkbox" />
            Remember me
          </label>
          <Link className="text-[#f4c542]" href="/forgot-password">
            Forgot password ?
          </Link>
        </div>
        <div className="pt-10">
          <Button className="h-14 w-full text-[18px]" disabled={isPending} type="submit">
            {isPending ? "Signing In..." : "Sign In"}
          </Button>
          <p className="mt-6 text-center text-[16px] text-white">
            Haven&apos;t an account? <span className="text-[#f4c542]">Sign Up</span>
          </p>
        </div>
      </form>
    </AuthCard>
  );
}
