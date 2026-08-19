"use client";

/**
 * useAuth — lightweight auth hook for dashboard pages.
 *
 * Usage:
 *   const { user, token, ready } = useAuth({ require: ["ADMIN", "COORDINATOR"] });
 *
 * - Redirects to /login if no token/user found.
 * - Redirects to /dashboard if user role is not in the allowed list.
 * - `ready` is false while the check is in progress (use to show a spinner).
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, type AuthUser, type UserRole } from "@/lib/auth";
import { getToken } from "@/lib/api";

interface UseAuthOptions {
  /** Roles allowed to access this page. If omitted, any authenticated user is allowed. */
  require?: UserRole[];
  /** Where to redirect if role is not allowed. Defaults to "/dashboard". */
  forbiddenRedirect?: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  token: string | null;
  /** true once the auth check is complete */
  ready: boolean;
}

export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const router = useRouter();
  const [user, setUser]   = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = getToken();
    const u = getStoredUser();

    if (!t || !u) {
      router.replace("/login");
      return;
    }

    if (options.require && !options.require.includes(u.role)) {
      router.replace(options.forbiddenRedirect ?? "/dashboard");
      return;
    }

    setToken(t);
    setUser(u);
    setReady(true);
  }, [router, options.require, options.forbiddenRedirect]);

  return { user, token, ready };
}
