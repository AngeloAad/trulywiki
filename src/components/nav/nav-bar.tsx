"use client";

import { UserButton } from "@neondatabase/auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { authClient } from "@/lib/auth/client";

export function NavBar() {
  const { data: session } = authClient.useSession();

  return (
    <nav className="w-full border-b bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 justify-between w-full">
          <Link
            href="/"
            className="font-bold text-xl tracking-tight text-gray-900"
          >
            TrulyWiki
          </Link>
          <NavigationMenu>
            <NavigationMenuList className="flex items-center gap-2">
              {session?.user ? (
                <div className="flex justify-center items-center gap-4">
                  <Button>
                    <Link href="/wiki/edit/new">New Article</Link>
                  </Button>

                  <NavigationMenuItem>
                    <UserButton size="icon" />
                  </NavigationMenuItem>
                </div>
              ) : (
                <NavigationMenuItem>
                  <Button asChild variant="default">
                    <Link href="/auth/sign-in">Sign up</Link>
                  </Button>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </nav>
  );
}
