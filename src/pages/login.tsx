import Image from "next/image";
import Form from "@/components/form";
import Link from "next/link";

export default function Login() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 dark:border-border shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white dark:bg-secondary dark:border-border px-4 py-6 pt-8 text-center sm:px-16">
          <Link href="/">
            <Image
              src="/dalibook-wide.png"
              priority
              alt="Logo"
              className="w-40 rounded-sm"
              width={778}
              height={254}
            />
          </Link>
          <h3 className="text-xl font-semibold pt-1.5">Sign In</h3>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-500">
            Enter your email — even if it's your first time
          </p>
        </div>
        <Form type="login" />
      </div>
    </div>
  );
}