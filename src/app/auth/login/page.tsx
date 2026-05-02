import { redirect } from 'next/navigation';

export default async function AuthLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectUrl = params?.redirect || '/';
  redirect(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
}