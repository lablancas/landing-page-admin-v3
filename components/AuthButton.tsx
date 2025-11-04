"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@auth0/nextjs-auth0";
import { useRouter } from "next/navigation";

interface AuthButtonProps {
  className?: string;
}

export function AuthButton({ className }: AuthButtonProps) {
  const { user: session, isLoading: isPending } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    router.push("/auth/logout");
  };

  const handleLoginClick = () => {
    router.push("/auth/login");
  };

  if (isPending) {
    return (
      <Button disabled className={`${className} flex items-center gap-2`}>
        Log in to post
      </Button>
    );
  }

  if (session?.user) {
    return (
      <Button onClick={handleLogout} className={className}>
        Logout
      </Button>
    );
  }

  return (
    <Button onClick={handleLoginClick} className={className}>
      Log in to post
    </Button>
  );
}

