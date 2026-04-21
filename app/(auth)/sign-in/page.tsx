import { SignInClient } from "@/components/auth/sign-in-client";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return <SignInClient initialError={params.error} />;
}
