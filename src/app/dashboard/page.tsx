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
  Building2,
  Search,
  PlusCircle,
  Command
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import DashboardCMS, { 
  AdminClubManager, 
  ClubRepManager, 
  AdminNewsManager, 
  ClubRepNewsManager, 
  AdminCoursesManager, 
  ClubRepCoursesManager 
} from './cms';

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
  // NEW state for UI enhancements
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut for command palette (⌘K / Ctrl+K)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const quickActions = [
    { id: 'qa-club', label: 'Create Club', section: 'clubs', icon: Users },
    { id: 'qa-news', label: 'Publish News', section: 'news', icon: Newspaper },
    { id: 'qa-course', label: 'Add Course', section: 'courses', icon: BookOpen },
    { id: 'qa-settings', label: 'Open Settings', section: 'settings', icon: Settings },
  ];

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
      {/* Command Palette */}
      {commandOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCommandOpen(false)} />
          <div className="relative z-10 w-full max-w-xl rounded-xl border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                placeholder="Type a command or search…"
                className="flex-1 bg-transparent outline-none text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">ESC</kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2 space-y-1 text-sm">
              {quickActions.filter(a => a.label.toLowerCase().includes(searchQuery.toLowerCase())).map(action => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => { setActiveSection(action.section); setCommandOpen(false); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{action.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground capitalize">{action.section}</span>
                  </button>
                );
              })}
              {quickActions.filter(a => a.label.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">No commands found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden bg-card border-b" style={{paddingLeft: sidebarCollapsed ? '0' : undefined}}>
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
                {getInitials(userData.email || '')}
              </AvatarFallback>
            </Avatar>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 group bg-sidebar border-r border-sidebar-border transform transition-all duration-300 ease-in-out lg:static lg:inset-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          sidebarCollapsed ? "w-20" : "w-64"
        )}>
          {/* Collapse Toggle */}
          <div className="hidden lg:flex items-center justify-end px-2 pt-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarCollapsed(v => !v)}>
              {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4 rotate-45" />}
            </Button>
          </div>
          {/* Sidebar Header */}
          <div className={cn("p-6 border-b border-sidebar-border", sidebarCollapsed && "p-4")}> 
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-sm">SC</span>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h2 className="text-lg font-headline font-semibold text-sidebar-foreground">SOSADE CMS</h2>
                  <p className="text-xs text-sidebar-foreground/70">Content Management</p>
                </div>
              )}
            </div>
          </div>

          {/* User Profile */}
          <div className={cn("p-6 border-b border-sidebar-border", sidebarCollapsed && "p-4")}> 
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-accent text-accent-foreground">
                  {getInitials(userData.email || '')}
                </AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{userData.email}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {getRoleIcon(userData.role)}
                    <Badge variant="secondary" className={cn("text-xs", getRoleColor(userData.role))}>{userData.role.replace('_',' ')}</Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                    activeSection === item.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-foreground/10"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Sign Out & Command Palette Button */}
          <div className={cn("p-4 border-t border-sidebar-border space-y-2", sidebarCollapsed && "p-2")}> 
            <Button
              variant="ghost"
              onClick={() => setCommandOpen(true)}
              className={cn("w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-foreground/10 gap-2", sidebarCollapsed && "justify-center")}
            >
              <Command className="h-4 w-4" />
              {!sidebarCollapsed && <span>Command (⌘K)</span>}
            </Button>
            <Button
              variant="ghost"
              onClick={signOut}
              className={cn("w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-foreground/10 gap-2", sidebarCollapsed && "justify-center")}
            >
              <LogOut className="h-5 w-5" />
              {!sidebarCollapsed && <span>Sign Out</span>}
            </Button>
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
        <div className={cn("flex-1 lg:ml-0", sidebarCollapsed ? "lg:pl-20" : "lg:pl-0")}> 
          {/* Desktop Header (enhanced) */}
          <div className="hidden lg:block sticky top-0 z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b">
            <div className="px-6 py-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-headline font-semibold tracking-tight">
                    {sidebarItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-muted-foreground text-sm">Manage your content and settings</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-md border bg-background w-72">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder="Quick search (⌘K)"
                      className="flex-1 bg-transparent outline-none text-sm"
                      onFocus={() => setCommandOpen(true)}
                      readOnly
                    />
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">⌘K</kbd>
                  </div>
                  <Button onClick={() => setCommandOpen(true)} variant="outline" className="gap-2">
                    <PlusCircle className="h-4 w-4" /> Quick Action
                  </Button>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      {getInitials(userData.email || '')}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              {activeSection === 'overview' && (
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="rounded-lg border bg-gradient-to-br from-accent/10 to-transparent p-4 flex flex-col justify-between">
                    <div className="text-xs font-medium text-muted-foreground">Clubs</div>
                    <div className="flex items-end justify-between mt-3">
                      <span className="text-2xl font-bold">12</span>
                      <Users className="h-5 w-5 text-accent" />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">+2 since last month</p>
                  </div>
                  <div className="rounded-lg border bg-gradient-to-br from-accent/10 to-transparent p-4 flex flex-col justify-between">
                    <div className="text-xs font-medium text-muted-foreground">News</div>
                    <div className="flex items-end justify-between mt-3">
                      <span className="text-2xl font-bold">8</span>
                      <Newspaper className="h-5 w-5 text-accent" />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">+1 this week</p>
                  </div>
                  <div className="rounded-lg border bg-gradient-to-br from-accent/10 to-transparent p-4 flex flex-col justify-between">
                    <div className="text-xs font-medium text-muted-foreground">Courses</div>
                    <div className="flex items-end justify-between mt-3">
                      <span className="text-2xl font-bold">24</span>
                      <BookOpen className="h-5 w-5 text-accent" />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">+3 this month</p>
                  </div>
                  <div className="rounded-lg border bg-gradient-to-br from-accent/10 to-transparent p-4 flex flex-col justify-between">
                    <div className="text-xs font-medium text-muted-foreground">Role</div>
                    <div className="flex items-end justify-between mt-3">
                      <span className="text-xl font-semibold capitalize">{userData.role.replace('_',' ')}</span>
                      {getRoleIcon(userData.role)}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Access level</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 space-y-10">
            {activeSection === 'overview' && (
              <div className="space-y-10">
                {/* Quick Actions */}
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">Quick Actions</h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {quickActions.map(action => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => { setActiveSection(action.section); }}
                          className="group relative overflow-hidden rounded-xl border bg-card hover:shadow-md transition-shadow p-4 text-left"
                        >
                          <div className="flex items-center justify-between">
                            <Icon className="h-5 w-5 text-accent" />
                            <span className="text-xs text-muted-foreground capitalize">{action.section}</span>
                          </div>
                          <div className="mt-4 font-medium group-hover:text-accent transition-colors text-sm">{action.label}</div>
                          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Existing Overview Cards + Welcome (original content preserved) */}
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
              </div>
            )}

            {activeSection === 'clubs' && (
              <div className="space-y-6">
                {userData.role === 'admin' ? (
                  <AdminClubManager />
                ) : userData.role === 'club_rep' && userData.clubId ? (
                  <ClubRepManager clubId={userData.clubId} />
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <div className="text-muted-foreground">
                        <p>No access to club management.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeSection === 'news' && (
              <div className="space-y-6">
                {userData.role === 'admin' ? (
                  <AdminNewsManager />
                ) : userData.role === 'club_rep' && userData.clubId ? (
                  <ClubRepNewsManager clubId={userData.clubId} />
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <div className="text-muted-foreground">
                        <p>No access to news management.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeSection === 'courses' && (
              <div className="space-y-6">
                {userData.role === 'admin' ? (
                  <AdminCoursesManager />
                ) : userData.role === 'club_rep' && userData.clubId ? (
                  <ClubRepCoursesManager clubId={userData.clubId} />
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <div className="text-muted-foreground">
                        <p>No access to course management.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
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
