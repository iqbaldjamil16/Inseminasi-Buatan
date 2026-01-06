'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Beef,
  Menu,
  User,
  PenSquare,
  BookCopy,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const sidebarNavItems = [
  { href: '/', icon: PenSquare, label: 'Input Data' },
  { href: '/summary', icon: Sparkles, label: 'Ringkasan AI' },
];

const headerNavItem = { href: '/records', icon: BookCopy, label: 'Catatan IB' };

function NavContent() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {sidebarNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref>
            <SidebarMenuButton
              as="a"
              isActive={pathname === item.href}
              className="justify-start"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}


export default function AppLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const getPageTitle = () => {
        switch (pathname) {
            case '/':
                return 'PKH Mateng';
            case '/records':
                return 'PKH Mateng';
            case '/summary':
                return 'PKH Mateng';
            default:
                return 'Dashboard';
        }
    }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <Sidebar className="hidden border-r bg-sidebar md:block">
          <SidebarHeader className="p-4">
              <Link href="/" className="flex items-center gap-3">
                <Beef className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-headline font-bold text-sidebar-foreground">
                  IB-Pro
                </h1>
              </Link>
          </SidebarHeader>
          <SidebarContent>
            <NavContent />
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col bg-sidebar text-sidebar-foreground p-0 w-[280px]">
                 <SidebarHeader className="p-4">
                  <Link href="/" className="flex items-center gap-3">
                    <Beef className="h-8 w-8 text-primary" />
                    <h1 className="text-xl font-headline font-bold text-sidebar-foreground">
                      IB-Pro
                    </h1>
                  </Link>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                      {/* Mobile nav only includes sidebar items now */}
                      {sidebarNavItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                          <Link href={item.href} passHref>
                            <SidebarMenuButton
                              as="a"
                              isActive={pathname === item.href}
                              className="justify-start"
                            >
                              <item.icon className="h-5 w-5" />
                              <span>{item.label}</span>
                            </SidebarMenuButton>
                          </Link>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                </SidebarContent>
              </SheetContent>
            </Sheet>

            <div className="w-full flex items-center justify-between">
              <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
              <nav className="flex items-center gap-4">
                  <Link href={headerNavItem.href}>
                      <Button variant={pathname === headerNavItem.href ? "secondary" : "ghost"}>
                          <headerNavItem.icon className="h-4 w-4 mr-2" />
                          {headerNavItem.label}
                      </Button>
                  </Link>
              </nav>
            </div>

          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
