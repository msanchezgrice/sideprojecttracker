import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Use Clerk's global window object for authentication
  let headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  // Get token from Clerk if available
  console.log('🔍 Frontend - Checking for Clerk token...');
  if (typeof window !== 'undefined' && (window as any).Clerk?.session) {
    try {
      console.log('📱 Clerk session found, getting token...');
      const token = await (window as any).Clerk.session.getToken();
      console.log('🎫 Token received:', token ? 'Present (length: ' + token.length + ')' : 'Missing');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('✅ Authorization header set');
      }
    } catch (error) {
      console.error('❌ Error getting Clerk token:', error);
    }
  } else {
    console.log('❌ No Clerk session found on window object');
    console.log('Window Clerk object:', (window as any).Clerk ? 'Present' : 'Missing');
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let headers: Record<string, string> = {};

    // Get token from Clerk if available
    console.log('🔍 Query - Checking for Clerk token...');
    if (typeof window !== 'undefined' && (window as any).Clerk?.session) {
      try {
        console.log('📱 Query - Clerk session found, getting token...');
        const token = await (window as any).Clerk.session.getToken();
        console.log('🎫 Query - Token received:', token ? 'Present (length: ' + token.length + ')' : 'Missing');
        if (token) {
          headers.Authorization = `Bearer ${token}`;
          console.log('✅ Query - Authorization header set');
        }
      } catch (error) {
        console.error('❌ Query - Error getting Clerk token:', error);
      }
    } else {
      console.log('❌ Query - No Clerk session found on window object');
    }

    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
