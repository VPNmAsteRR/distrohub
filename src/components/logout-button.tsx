"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { useSession } from "./session-provider";

export function LogoutButton() {
  const { logout } = useSession();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/80 transition-colors hover:bg-white/[0.12] hover:text-white"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await logout();
        router.push("/");
        router.refresh();
      }}
    >
      <LogOut className="h-3.5 w-3.5" />
      {pending ? "Выходим…" : "Выйти"}
    </button>
  );
}
