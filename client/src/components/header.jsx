import authorizeApi from "../api/authorize";
import { useStore } from "../utils/store";
import { portalUrl } from "../config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

import { ChevronDownIcon, Moon, Shield, Sun } from "lucide-react";

import { Button } from "./ui/button";
import { useTheme } from "./theme-provider";
import Cookies from "universal-cookie";
import { Link, useLocation } from "react-router-dom";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}



function UserNav() {
  const { user, setUser } = useStore();
  
  // Run when the logout button is pressed.
  const logout = async () => {
    await authorizeApi.logout();
    const cookies = new Cookies();
    cookies.remove("usersToken");
    setUser(null);
  }

  const getNameFromEmail = () => {
    const left_side = user.email.substring(0, user.email.lastIndexOf("@"))
    
    if (left_side.includes('.')) return left_side.split(".").join(" ")
    
    return left_side
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="link" className="items-end gap-2">
          <p className="text-xl capitalize">
            { getNameFromEmail() }
          </p>
          <ChevronDownIcon className="w-6 h-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between font-normal">
          <div className="flex flex-col gap-y-1">
            <p className="text-sm font-medium leading-none capitalize">
              {user.email
                .substring(0, user.email.lastIndexOf("@"))
                .split(".")
                .join(" ")}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
          {user.admin && <Shield className="w-5 h-5" />}
        </DropdownMenuLabel>
        {user?.admin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="p-0">
                <Link to="/apps" className="w-full py-1.5 px-2">
                  Application management
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0">
                <Link to="/users" className="w-full py-1.5 px-2">
                  User access management
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  const user = useStore((state) => state.user);
  const { pathname } = useLocation();

  if (user) {
    return (
      <header className="flex items-center justify-between px-4 pb-2 pt-4 sm:px-8 sm:py-4">
        <a
          href="/"
          className="relative whitespace-nowrap text-2xl font-title font-bold"
        >
          Portal{" "}
          <sup className="absolute left-[calc(100%+.25rem)] top-0 text-xs font-extrabold text-gray-400">
            [Veikko's apps]
          </sup>
        </a>
        <nav className="flex items-center gap-5">
          <ModeToggle />
          <UserNav />
        </nav>
      </header>
    );
  }
  return (
    <header className="flex items-center justify-between px-4 pb-2 pt-4 sm:px-8 sm:py-4">
      <a
        href={portalUrl}
        className="relative whitespace-nowrap text-2xl font-title font-bold"
      >
        Portal{" "}
        <sup className="absolute left-[calc(100%+.25rem)] top-0 text-xs font-extrabold text-gray-400">
          [Veikko's apps]
        </sup>
      </a>
      <nav className="flex items-center gap-3">
        <ModeToggle />
        {pathname === "/register" ? (
          <Link to="/">Log In</Link>
        ) : (
          <Link to="/register">Register</Link>
        )}
      </nav>
    </header>
  );
}
