"use client";

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Newspaper, 
  BookOpen, 
  Settings, 
  LogOut, 
  Menu,
  X,
  User,
  Shield,
  Building2
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import DashboardCMS from './cms';

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'clubs', label: 'Clubs', icon: Users },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function DashboardPage() {
  const { user, userData, signOut, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <span className="text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Access Required</CardTitle>
            <CardDescription>You need to be logged in to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
        <Link href="/login">
              <Button className="w-full">Go to Login</Button>
        </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'club_rep':
        return <Building2 className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'club_rep':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden bg-card border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-headline font-semibold">Dashboard</h1>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-accent text-accent-foreground text-xs">
              {getInitials(userData.email)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-sidebar-border">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-accent-foreground font-bold text-sm">SC</span>
                </div>
                <div>
                  <h2 className="text-lg font-headline font-semibold text-sidebar-foreground">
                    SOSADE CMS
                  </h2>
                  <p className="text-xs text-sidebar-foreground/70">Content Management</p>
                </div>
              </div>
            </div>

            {/* User Profile */}
            <div className="p-6 border-b border-sidebar-border">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    {getInitials(userData.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {userData.email}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    {getRoleIcon(userData.role)}
                    <Badge variant="secondary" className={cn("text-xs", getRoleColor(userData.role))}>
                      {userData.role.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                      activeSection === item.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-foreground/10"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Sign Out */}
            <div className="p-4 border-t border-sidebar-border">
              <Button
                variant="ghost"
                onClick={signOut}
                className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-foreground/10"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Desktop Header */}
          <div className="hidden lg:block bg-card border-b">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-headline font-semibold">
                    {sidebarItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-muted-foreground">
                    Manage your content and settings
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{userData.email}</p>
                    <div className="flex items-center space-x-1 justify-end">
                      {getRoleIcon(userData.role)}
                      <Badge variant="secondary" className={cn("text-xs", getRoleColor(userData.role))}>
                        {userData.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      {getInitials(userData.email)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Clubs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-xs text-muted-foreground">
                        +2 from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Active News
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8</div>
                      <p className="text-xs text-muted-foreground">
                        +1 from last week
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Courses Available
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">24</div>
                      <p className="text-xs text-muted-foreground">
                        +3 new this month
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Welcome to SOSADE CMS</CardTitle>
                    <CardDescription>
                      Manage your content efficiently with our modern content management system.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 bg-accent rounded-full"></div>
                        <span className="text-sm">You are logged in as <strong>{userData.role.replace('_', ' ')}</strong></span>
                      </div>
                      {userData.clubId && (
                        <div className="flex items-center space-x-3">
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">Managing club: <strong>{userData.clubId}</strong></span>
                        </div>
                      )}
                      <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Last login: <strong>Today</strong></span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {(activeSection === 'clubs' || activeSection === 'news' || activeSection === 'courses') && (
        <DashboardCMS />
            )}

            {activeSection === 'settings' && (
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">{userData.email}</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(userData.role)}
                      <Badge variant="secondary" className={getRoleColor(userData.role)}>
                        {userData.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  {userData.clubId && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Club ID</label>
                        <p className="text-sm text-muted-foreground">{userData.clubId}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
