import { useState } from "react";
import { signIn } from "next-auth/react";
// import LoadingDots from "@/components/loading-dots";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/router";

const authType = "email";

export default function Form({ type }: { type: "login" | "register" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        // if (!emailValidator(e.currentTarget.email.value)) {
        //     setError("Please enter a valid Dartmouth email (not a Blitz alias)")
        //     return;
        // }
        setLoading(true);
        if (type === "login") {
            if (authType === "email") {
                console.log('in here')
                signIn("email", {
                    redirect: false,
                    email: e.currentTarget.email.value,
                    callbackUrl: process.env.NODE_ENV === "development" ? "http://127.0.0.1:3000" : "https://dali.0z.gg/",
                    // password: e.currentTarget.password.value,
                  }).then((response) => {
                    if (response?.error) {
                      const { error } = response;
                      setLoading(false);
                      toast.error(error);
                    } else {
                    console.log("Sent email!")
                    setSuccess("We just sent you a magic login link. Go check your inbox!")
                    }
                  });
            } else {
                console.log('in here 2')
                signIn("credentials", {
                    redirect: false,
                    email: e.currentTarget.email.value,
                    password: e.currentTarget.password.value,
                  }).then((response) => {
                    if (response?.error) {
                      const { error } = response;
                      setLoading(false);
                      toast.error(error);
                    } else {
                    //   router.refresh();
                      router.push("/");
                    }
                  });
            }
        } else {
          fetch("/api/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: e.currentTarget.email.value,
              password: e.currentTarget.password.value,
            }),
          }).then(async (res) => {
            setLoading(false);
            if (res.status === 200) {
              toast.success("Account created! Redirecting to login...");
              setTimeout(() => {
                router.push("/login");
              }, 2000);
            } else {
              const { error } = await res.json();
              toast.error(error);
            }
          });
        }
      }}
      className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 sm:px-16 dark:bg-secondary" // dark:bg-slate-800
    >
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-600 dark:text-slate-500"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="dbsahjk"
          placeholder="mark@thefacebook.com"
          autoComplete="off"
          required
          className="mt-1 block w-full appearance-none rounded-md border-2 border-gray-300 dark:bg-border dark:border-border px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black dark:focus:border-primary dark:focus:border-md focus:outline-none focus:ring-black sm:text-sm"
        />
      </div>
      <button
        disabled={loading}
        className={`${
          loading
            ? "cursor-not-allowed bg-primary border-primary brightness-90"
            : "border-primary bg-primary text-white font-medium hover:brightness-110"
        } flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none`}
      >
        {loading ? (
          // <LoadingDots color="#808080" />
          <p>Loading...</p>
        ) : (
          <p>{type === "login" ? "Sign In" : "Sign Up"}</p>
        )}
      </button>
      {error !== "" && (
        <div className="flex flex-row px-3 py-2.5 rounded-md gap-2 bg-error text-white items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-triangle-alert w-5 h-5 min-h-5 min-w-5 mr-px"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            <p className="text-left text-sm font-medium text-white">{error}</p>
        </div>
      )}
      {success !== "" && (
        <div className="flex flex-row px-3 py-2.5 rounded-md gap-2 bg-success text-white items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-check w-5 h-5 min-h-5 min-w-5 mr-px"><path d="M20 6 9 17l-5-5"/></svg>
            <p className="text-left text-sm font-medium text-white">{success}</p>
        </div>
      )}
      {type === "login" ? (
        <p className="text-center text-sm font-medium text-gray-600 dark:text-slate-500">
          Don&apos;t want an account?{" "}
          <Link href="/" className="font-semibold text-gray-800 dark:text-bright-text">
            Browse
          </Link>{" "}
          for free.
        </p>
      ) : (
        <p className="text-center text-sm font-medium text-gray-600 dark:text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-gray-800 dark:text-bright-text">
            Sign in
          </Link>{" "}
          instead.
        </p>
      )}
    </form>
  );
}
