// apps/web/src/app/(app)/layout.tsx

import { AuthTokenBridge } from "@/components/auth/auth-token-bridge";
import { RequireAuth } from "@/components/auth/require-auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AuthTokenBridge>{children}</AuthTokenBridge>
    </RequireAuth>
  );
}
