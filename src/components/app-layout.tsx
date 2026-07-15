'use client';

import type { ReactNode } from 'react';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Beef,
  Menu,
  User,
  PenSquare,
  BookCopy,
  Sparkles,
  LayoutDashboard,
  PanelLeft,
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
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const sidebarNavItems = [
  { href: '/', icon: PenSquare, label: 'Input Data' },
  { href: '/summary', icon: Sparkles, label: 'Ringkasan AI' },
];

const headerNavItem = { href: '/records', icon: BookCopy, label: 'Data Lap.' };

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
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    const handleButtonPress = () => {
      // Logic for press
    };

    const handleButtonRelease = () => {
      // Logic for release
    };

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
      <div className="grid min-h-screen w-full md:grid-cols-[1fr] lg:grid-cols-[1fr]">
        <Sidebar className="hidden">
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
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background px-4 sm:px-6 lg:h-[60px]">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  onMouseDown={handleButtonPress}
                  onMouseUp={handleButtonRelease}
                  onTouchStart={handleButtonPress}
                  onTouchEnd={handleButtonRelease}
                >
                  <PanelLeft className="h-6 w-6" />
                  <span className="sr-only">Buka Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col bg-background text-foreground p-0 w-full max-w-[240px] sm:max-w-sm">
                <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
                <SidebarHeader className="p-4 border-b">
                  <Link href="/" className="flex items-center gap-3">
                    <Beef className="h-8 w-8 text-primary" />
                    <h1 className="text-xl font-headline font-bold text-foreground">
                      IB-Pro
                    </h1>
                  </Link>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                      {sidebarNavItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                          <Link href={item.href} passHref>
                            <SidebarMenuButton
                              as="a"
                              isActive={pathname === item.href}
                              className="justify-start"
                              onClick={() => setIsSheetOpen(false)}
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
              <h1 className="text-lg font-semibold text-primary">{getPageTitle()}</h1>
              <nav className="flex items-center gap-2 sm:gap-4">
                  <Link href={headerNavItem.href}>
                      <Button variant="outline" className={cn(
                          "font-semibold transition-colors",
                          pathname === headerNavItem.href 
                            ? "bg-accent text-accent-foreground ring-2 ring-accent"
                            : "bg-white text-primary hover:bg-accent/80 hover:text-accent-foreground border-black"
                      )}>
                          <headerNavItem.icon className="h-4 w-4 mr-2" />
                          <span>{headerNavItem.label}</span>
                      </Button>
                  </Link>
              </nav>
            </div>

          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 lg:gap-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
