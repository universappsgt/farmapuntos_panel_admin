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
  Laptop,
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
import { Form, useLocation } from "@remix-run/react";
import { Theme, useTheme } from "remix-themes";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { User } from "~/models/types";

const items = [
  {
    title: "Usuarios",
    url: "/users",
    icon: UserIcon,
  },
  {
    title: "Agentes",
    url: "/agents",
    icon: Users,
  },
  {
    title: "Administradores",
    url: "/admins",
    icon: UserIcon,
  },
  {
    title: "Laboratorios",
    url: "/wallet",
    icon: FlaskConical,
  },
  {
    title: "Encuestas",
    url: "/surveys",
    icon: ClipboardList,
  },
  {
    title: "Transacciones",
    url: "/transactions",
    icon: CreditCard,
  },
  {
    title: "Recompensas",
    url: "/rewards",
    icon: Gift,
  },
  {
    title: "Solicitudes de Canjeo",
    url: "/reward-requests",
    icon: Gift,
  },
  {
    title: "Productos",
    url: "/products",
    icon: Package,
  },
  {
    title: "Farmacias",
    url: "/pharmacies",
    icon: Pill,
  },
  {
    title: "Banners",  
    url: "/banners",
    icon: Laptop,
  },
];

interface MainNavigationProps {
  user: User;
}

export function MainNavigation({ user }: MainNavigationProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const [, setTheme] = useTheme();

  return (
    <Sidebar className="border-r bg-background">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground/70 text-center">
            <img src="/farmapuntos.png" alt="Farmapuntos" className="p-10" />
            {/* Farmapuntos */}
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
                    <AvatarImage src={user.profilePictureUrl || ""} />
                    <AvatarFallback className="bg-muted">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium text-foreground">
                      {user.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Code2 className="mr-2 h-4 w-4" />
                <span>Código</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Form action="/logout" method="post">
                <DropdownMenuItem asChild>
                  <button className="w-full text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </button>
                </DropdownMenuItem>
              </Form>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Cambiar tema</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme(Theme.LIGHT)}>
                Claro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(Theme.DARK)}>
                Oscuro
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
