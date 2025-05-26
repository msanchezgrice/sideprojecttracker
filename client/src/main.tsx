import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from '@clerk/clerk-react';

const queryClient = new QueryClient();

// Use the Clerk publishable key that matches the current domain
const clerkPubKey = "pk_test_YWRhcHRlZC1waWdlb24tMjIuY2xlcmsuYWNjb3VudHMuZGV2JA";

if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </ClerkProvider>
);
