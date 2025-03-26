
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn("py-6 px-6 w-full animate-slide-down", className)}>
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Camera className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-medium tracking-tight">WebcamStream</h1>
        </div>
      </div>
    </header>
  );
}
