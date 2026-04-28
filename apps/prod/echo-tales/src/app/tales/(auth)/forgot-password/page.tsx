import { redirect } from 'next/navigation';

const AUTH_ORIGIN = process.env.LEDESIGN_AUTH_ORIGIN ?? 'https://auth.ledesign.ai';

export default function ForgotPasswordRedirect() {
  redirect(`${AUTH_ORIGIN}/forgot-password`);
}
