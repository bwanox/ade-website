'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  GraduationCap,
  Bot,
  Shield,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '../ui/button';
import * as React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { cn } from '@/lib/utils';

const navLinks = [
  {
    label: 'Home',
    href: '#',
    icon: Home,
  },
  {
    label: 'Programs & Courses',
    icon: GraduationCap,
    sublinks: [
      { label: 'CP1', href: '#' },
      { label: 'CP2', href: '#' },
      { label: 'Software Engineering', href: '#' },
      { label: 'Industrial', href: '#' },
      { label: 'Cybersecurity', href: '#' },
    ],
  },
  {
    label: 'Student Clubs',
    icon: Bot,
    sublinks: [
      { label: 'Robotics', href: '#student-clubs' },
      { label: 'Electronics', href: '#student-clubs' },
      { label: 'Humanitarian', href: '#student-clubs' },
    ],
  },
  {
    label: 'Resources & SOS',
    href: '#',
    icon: Shield,
  },
];

const SubMenu = ({
  link,
}: {
  link: (typeof navLinks)[0];
}) => {
  const { open } = useSidebar();
  if (!link.sublinks) return null;

  return (
    <Accordion.Root type="single" collapsible>
      <Accordion.Item value={link.label} className="border-none">
        <Accordion.Trigger asChild>
          <SidebarMenuButton
            className="w-full"
          >
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                    <link.icon />
                    <span>{link.label}</span>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </div>
          </SidebarMenuButton>
        </Accordion.Trigger>
        <Accordion.Content className="text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
          <ul className={cn("flex flex-col gap-1 pl-11 pr-2 py-2", !open && "hidden")}>
            {link.sublinks.map((sublink) => (
              <li key={sublink.label}>
                <Link
                  href={sublink.href}
                  className="block text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground py-1"
                >
                  {sublink.label}
                </Link>
              </li>
            ))}
          </ul>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="items-center">
            <Link href="/" className="flex items-center gap-2">
                <Logo className="text-accent" />
                <span className="text-xl font-bold font-headline text-primary-foreground group-data-[collapsible=icon]:hidden">NexusConnect</span>
            </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navLinks.map((link) => (
              <SidebarMenuItem key={link.label}>
                {link.sublinks ? (
                  <SubMenu link={link} />
                ) : (
                  <SidebarMenuButton asChild tooltip={link.label}>
                    <Link href={link.href}>
                      <link.icon />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
