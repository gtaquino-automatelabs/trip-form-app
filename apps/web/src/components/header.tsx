"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from "next/navigation";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja fazer logout?')) {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      router.push('/login');
    }
  };

  const links = [
    { to: "/", label: "Home" },
  ];

  return (
    <div className="bg-slate-800/80 border-b border-slate-700">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <nav className="flex gap-4 text-lg">
              {links.map(({ to, label }) => {
                return (
                  <Link key={to} href={to} className="text-white hover:text-cyan-400 transition-colors">
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center text-sm text-slate-300">
                  <User className="h-4 w-4 mr-2" />
                  <span>{user.email}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
