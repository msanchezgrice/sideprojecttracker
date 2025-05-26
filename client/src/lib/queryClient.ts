import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Global token getter function - will be set by the App component
let getTokenFn: (() => Promise<string | null>) | null = null;

export function setTokenGetter(tokenGetter: () => Promise<string | null>) {
  getTokenFn = tokenGetter;
}

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

  // Get token from Clerk using the proper token getter
  console.log('🔍 Frontend - Getting Clerk token...');
  if (getTokenFn) {
    try {
      console.log('📱 Token getter available, requesting token...');
      const token = await getTokenFn();
      console.log('🎫 Token received:', token ? 'Present (length: ' + token.length + ')' : 'Missing or null');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('✅ Authorization header set');
      } else {
        console.log('⚠️ Token is null - user might not be signed in yet');
      }
    } catch (error) {
      console.error('❌ Error getting Clerk token:', error);
    }
  } else {
    console.log('❌ No token getter function available');
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

    // Get token from Clerk using the proper token getter
    console.log('🔍 Query - Getting Clerk token...');
    if (getTokenFn) {
      try {
        console.log('📱 Query - Token getter available, requesting token...');
        const token = await getTokenFn();
        console.log('🎫 Query - Token received:', token ? 'Present (length: ' + token.length + ')' : 'Missing');
        if (token) {
          headers.Authorization = `Bearer ${token}`;
          console.log('✅ Query - Authorization header set');
        } else {
          console.log('⚠️ Query - Token is null - user might not be signed in yet');
        }
      } catch (error) {
        console.error('❌ Query - Error getting Clerk token:', error);
      }
    } else {
      console.log('❌ Query - No token getter function available');
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
