import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarMenuButton,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarGroupLabel,
} from "~/components/ui/sidebar";

import {
  LayoutDashboard,
  Users,
  User as UserIcon,
  Wallet,
  FlaskConical,
  ClipboardList,
  CreditCard,
  Gift,
  Package,
  Pill,
  Moon,
  Sun,
  LogOut,
  Code2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "./button";
import { useLocation } from "@remix-run/react";
import { Theme, useTheme } from "remix-themes";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { User } from "~/models/types";

// Mock user data - replace this with actual user data from your auth system
const currentUser: User = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  points: 100,
  phoneNumber: "+1234567890",
  profilePictureUrl: "https://picsum.photos/200/300",
  notificationTokens: [],
  backgroundPictureUrl: "",
  isEnabled: true,
  isAgent: false,
};

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Agentes",
    url: "/agents",
    icon: Users,
  },
  {
    title: "Users",
    url: "/users",
    icon: UserIcon,
  },
  {
    title: "Wallet",
    url: "/wallet",
    icon: Wallet,
  },
  {
    title: "Laboratorios",
    url: "/laboratories",
    icon: FlaskConical,
  },
  {
    title: "Encuestas",
    url: "/surveys",
    icon: ClipboardList,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: CreditCard,
  },
  {
    title: "Rewards",
    url: "/rewards",
    icon: Gift,
  },
  {
    title: "Products",
    url: "/products",
    icon: Package,
  },
  {
    title: "Pharmacies",
    url: "/pharmacies",
    icon: Pill,
  },
];

export function MainNavigation() {
  const location = useLocation();
  const pathname = location.pathname;
  const [, setTheme] = useTheme();

  return (
    <Sidebar className="border-r bg-background">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground/70">
            Becofarma
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <a href={item.url}>
                      <item.icon className="text-foreground/70" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex-1 justify-start px-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={currentUser.profilePictureUrl} />
                    <AvatarFallback className="bg-muted">
                      {currentUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium text-foreground">
                      {currentUser.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {currentUser.email}
                    </span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Code2 className="mr-2 h-4 w-4" />
                <span>Codebase</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      </SidebarFooter>
    </Sidebar>
  );
}
