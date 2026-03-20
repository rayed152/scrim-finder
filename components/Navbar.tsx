import { auth } from "@/auth";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import { LayoutDashboard, Users, LogIn, UserPlus, History } from "lucide-react";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="w-full px-6 py-4 flex items-center justify-between border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-50">
      <Link
        href={user ? "/dashboard" : "/"}
        className="flex items-center gap-2 group"
      >
        <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-red-600/20">
          <span className="font-bold text-white text-lg">V</span>
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent tracking-tight">
          Scrim Finder
        </span>
      </Link>

      <nav className="flex items-center gap-3 md:gap-6">
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-2 group"
            >
              <LayoutDashboard
                size={16}
                className="group-hover:text-red-500 transition-colors"
              />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
            <Link
              href="/team"
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-2 group"
            >
              <Users
                size={16}
                className="group-hover:text-red-500 transition-colors"
              />
              <span className="hidden md:inline">My Team</span>
            </Link>
            <Link
              href="/history"
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-2 group"
            >
              <History
                size={16}
                className="group-hover:text-red-500 transition-colors"
              />
              <span className="hidden md:inline">Match History</span>
            </Link>

            <div className="h-4 w-px bg-neutral-800 mx-1 hidden md:block" />

            <div className="flex items-center gap-4 pl-2">
              <div className="hidden lg:flex flex-col items-end leading-tight">
                <span className="text-xs font-bold text-white uppercase tracking-tighter truncate max-w-[120px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono italic">
                  {user.valorantTag || "No Riot ID"}
                </span>
              </div>
              <LogoutButton />
            </div>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-2 group"
            >
              <LogIn
                size={16}
                className="group-hover:text-red-500 transition-colors"
              />
              <span>Sign In</span>
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
            >
              <UserPlus size={16} />
              <span className="hidden sm:inline">Join Now</span>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
