import { useEffect, useState } from "react";

export type LocalUser = {
  id: string;
  email: string;
  fullName: string;
  full_name: string;
  phone: string;
  role: "customer" | "admin";
};

export function useAuth() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refresh = () => {
      const raw = localStorage.getItem("lumina_user");
      if (raw) {
        try {
          const u = JSON.parse(raw);
          setUser({
            id: u.id,
            email: u.email,
            fullName: u.fullName || u.full_name || "",
            full_name: u.fullName || u.full_name || "",
            phone: u.phone || "",
            role: u.role,
          });
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    refresh();
    window.addEventListener("lumina-auth-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("lumina-auth-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return { session: user ? { user } : null, user, loading };
}
