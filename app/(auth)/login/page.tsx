import { LoginForm } from '@/modules/auth/components/LoginForm';

export const metadata = {
  title: 'Login | AutoParse',
  description: 'Login to your account',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-40 -left-40 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <div className="z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
