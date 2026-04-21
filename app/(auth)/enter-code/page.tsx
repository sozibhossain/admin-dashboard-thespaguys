import { EnterCodeClient } from "@/components/auth/enter-code-client";

export default async function EnterCodePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  return <EnterCodeClient email={params.email || ""} />;
}
