// app/components/LeftPanelNavigation.tsx

import React from "react";
import { Link, useLocation } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Menu, LayoutDashboard, Users, Wallet, FlaskConical } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agentes", href: "/agents", icon: Users },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Laboratorios", href: "/laboratories", icon: FlaskConical },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function LeftPanelNavigation({ className }: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Becofarma
          </h2>
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
