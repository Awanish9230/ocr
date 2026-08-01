import { RegisterForm } from '@/modules/auth/components/RegisterForm';

export const metadata = {
  title: 'Register | AutoParse',
  description: 'Create a new account',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}
