// apps/web/src/components/auth/auth-token-bridge.tsx

"use client";

import { useLayoutEffect } from "react";
import { setAccessTokenProvider } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";

export function AuthTokenBridge({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();

  useLayoutEffect(() => {
    setAccessTokenProvider(() => accessToken);
  }, [accessToken]);

  return <>{children}</>;
}
