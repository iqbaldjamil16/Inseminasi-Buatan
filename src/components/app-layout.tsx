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

const navItems = [
  { href: '/', icon: PenSquare, label: 'Input Data' },
  { href: '/records', icon: BookCopy, label: 'Catatan IB' },
  { href: '/summary', icon: Sparkles, label: 'Ringkasan AI' },
];

function NavContent() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
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
                return 'Input Data Inseminasi';
            case '/records':
                return 'Catatan Inseminasi Buatan';
            case '/summary':
                return 'Ringkasan & Saran AI';
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
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
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
                    <NavContent />
                </SidebarContent>
              </SheetContent>
            </Sheet>

            <div className="w-full flex-1">
              <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
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
