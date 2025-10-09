import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useApiWithAuth } from "@/lib/api";

export const useAuthenticatedApi = () => {
    const api = useApiWithAuth();
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            if (isLoaded && isSignedIn) {
                try {
                    const token = await getToken();
                    if (token) {
                        api.setAuthToken(token);
                        setAuthReady(true);
                    }
                } catch (err) {
                    console.error("Failed to get auth token:", err);
                    setAuthReady(true);
                }
            } else if (isLoaded && !isSignedIn) {
                setAuthReady(true);
            }
        };

        initAuth();
    }, [isLoaded, isSignedIn, getToken, api]);

    return {
        api,
        authReady,
        isSignedIn: isSignedIn || false,
        isLoaded,
    };
};
