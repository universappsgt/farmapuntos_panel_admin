// app/components/LeftPanelNavigation.tsx

import React from "react";
import { Link, useLocation } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import {
  Menu,
  LayoutDashboard,
  Users,
  Wallet,
  FlaskConical,
  ClipboardList,
  Sun,
  Moon,
  Laptop,
  User,
  LogOut,
  CreditCard,
  Gift,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Theme, useTheme } from "remix-themes";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agentes", href: "/agents", icon: Users },
  { name: "Users", href: "/users", icon: User },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Laboratorios", href: "/laboratories", icon: FlaskConical },
  { name: "Encuestas", href: "/surveys", icon: ClipboardList },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Rewards", href: "/rewards", icon: Gift },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function LeftPanelNavigation({ className }: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const [isOpen, setIsOpen] = React.useState(false);
  const [, setTheme] = useTheme();

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2 px-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt="@username" />
                    <AvatarFallback>RJ</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">username</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      user@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="pl-4">
              <h2 className="text-lg font-semibold tracking-tight">
                Becofarma
              </h2>
            </div>
          </div>

          <div className="space-y-1">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[280px]">
                <MobileNav setIsOpen={setIsOpen} />
              </SheetContent>
            </Sheet>
            <div className="hidden md:block">
              <ScrollArea className="h-[calc(100vh-8rem)] px-1">
                <DesktopNav />
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme(Theme.LIGHT)}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(Theme.DARK)}>
                Dark
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  function MobileNav({ setIsOpen }: { setIsOpen: (open: boolean) => void }) {
    return (
      <div className="flex flex-col space-y-3">
        {navigation.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent" : "transparent"
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </div>
    );
  }

  function DesktopNav() {
    return (
      <nav className="flex flex-col space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent" : "transparent"
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </nav>
    );
  }
}
