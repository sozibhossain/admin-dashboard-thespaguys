import { ChangePasswordClient } from "@/components/auth/change-password-client";

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; resetToken?: string }>;
}) {
  const params = await searchParams;
  return <ChangePasswordClient email={params.email || ""} resetToken={params.resetToken || ""} />;
}
