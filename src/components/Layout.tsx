
import { ReactNode } from "react";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center bg-background">
      <Header />
      <main className="flex-1 w-full max-w-4xl px-6 pb-12">
        {children}
      </main>
      <footer className="w-full py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} WebcamStream. All rights reserved.</p>
      </footer>
    </div>
  );
}
