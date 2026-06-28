import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`w-[70%] mx-auto py-8 ${className}`}>
      {children}
    </div>
  );
}
