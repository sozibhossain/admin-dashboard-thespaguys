import { ChangePasswordClient } from "@/components/auth/change-password-client";

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; otp?: string }>;
}) {
  const params = await searchParams;
  return <ChangePasswordClient email={params.email || ""} otp={params.otp || ""} />;
}
