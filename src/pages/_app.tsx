import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
      <Toaster 
        toastOptions={{ // tailwind classes don't work here
          style: {
            border: "1px solid #2E4152",
            backgroundColor: "#1E2936",
            color: "#F9FAFB",
          },
          success: {
            iconTheme: {
              primary: "#0fd680", // #10B981
              secondary: "#F0FFF4",
            },
          }
        }}
      />
    </SessionProvider>
  );
}
