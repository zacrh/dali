import { PropsWithChildren, createContext, useContext, useEffect, useRef } from "react";
import { useRouter } from "next/router";

const PreviousRouteContext = createContext<string | null>(null);

// used for back button -> where we want to take the user to the page they came from (on dalibook), but redirect them home if they came from another website. solution from this thread: https://github.com/vercel/next.js/discussions/36723#discussioncomment-2698954
export const PreviousRouteProvider = ({ children }: PropsWithChildren<{}>) => {
    const router = useRouter();
    const previousRoute = useRef<string | null>(null);

    useEffect(() => {
        const handleRouteChange = (url: string) => {
          previousRoute.current = router.asPath;
        };
    
        router.events.on("routeChangeStart", handleRouteChange);
        return () => {
          router.events.off("routeChangeStart", handleRouteChange);
        };
      }, [router]);
    
      return (
        <PreviousRouteContext.Provider value={previousRoute.current}>
          {children}
        </PreviousRouteContext.Provider>
      );
    };
    
export const usePreviousRoute = () => {
    return useContext(PreviousRouteContext);
};
    