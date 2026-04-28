import { redirect } from 'next/navigation';

const APP_ID = process.env.LEDESIGN_APP_ID ?? 'echo-tales';
const AUTH_ORIGIN = process.env.LEDESIGN_AUTH_ORIGIN ?? 'https://auth.ledesign.ai';

export default async function LoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; returnTo?: string }>;
}) {
  const params = await searchParams;
  const target = new URL('/login', AUTH_ORIGIN);
  target.searchParams.set('app', APP_ID);
  target.searchParams.set('redirect', params.redirect ?? params.returnTo ?? '/tales/home');
  redirect(target.toString());
}
