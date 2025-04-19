import { DataProvider } from "@/lib/data-context";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DataProvider>
        {children}
      </DataProvider>
    </SessionProvider>
  );
}
