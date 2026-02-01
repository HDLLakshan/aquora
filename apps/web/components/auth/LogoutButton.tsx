"use client";

import { signOut } from "next-auth/react";

import { Button, type ButtonProps } from "../ui/button";

interface LogoutButtonProps extends Omit<ButtonProps, "type" | "onClick"> {
  callbackUrl?: string;
}

export function LogoutButton({ callbackUrl = "/login", ...props }: LogoutButtonProps) {
  return (
    <Button
      type="button"
      {...props}
      onClick={() => {
        void signOut({ callbackUrl });
      }}
    >
      Log out
    </Button>
  );
}
