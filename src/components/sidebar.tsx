import {
  Home,
  DoorOpen,
  Search,
  Star,
  Heart,
  TrendingUp,
  Bookmark,
  User,
  Settings,
  Sparkles,
  BarChart3,
  LogOut,
  ChevronUp
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from './ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from './ui/button';
import Link from 'next/link';

const mainItems = [
  {
    title: 'Home',
    url: '/',
    icon: Home
  },
  {
    title: 'Discover',
    url: '/animes',
    icon: Search
  },
  {
    title: 'AI Recommendations',
    url: '/recommendations',
    icon: Sparkles
  },
  {
    title: 'Trending',
    url: '/trending',
    icon: TrendingUp
  }
];

const libraryItems = [
  {
    title: 'Favorites',
    url: '/favorites',
    icon: Heart
  },
  {
    title: 'Watchlist',
    url: '/profile/watchlist',
    icon: Bookmark
  },
  {
    title: 'Completed',
    url: '/completed',
    icon: Star
  },
  {
    title: 'Stats',
    url: '/stats',
    icon: BarChart3
  }
];

const accountItems = [
  {
    title: 'Profile',
    url: '/profile',
    icon: User
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings
  }
];

export function AppSidebar() {
  const { data: session, status } = useSession();
  const sidebar = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {sidebar.open ? (
          <Link href="/" className="text-muted-foreground mx-auto flex items-center text-2xl">
            <span className="text-primary font-extrabold transition-all hover:rotate-5">Taste</span>
            Loop
          </Link>
        ) : (
          <Link href="/" className="text-muted-foreground mx-auto flex items-center text-2xl">
            <span className="text-primary font-extrabold transition-all hover:rotate-10">T</span>L
          </Link>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>My Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {libraryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {status === 'authenticated' ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                className="w-full justify-start transition-colors hover:bg-white/5"
                size="lg"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image ?? ''} />
                  <AvatarFallback className="text-xs">
                    {session.user.name?.charAt(0).toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                {sidebar.open && (
                  <>
                    <div className="flex min-w-0 flex-1 flex-col items-start">
                      <span className="truncate text-sm font-medium">
                        {session.user?.name ?? 'User'}
                      </span>
                      <span className="text-muted-foreground truncate text-xs">
                        {session.user?.email}
                      </span>
                    </div>
                  </>
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" side={sidebar.open ? 'top' : 'right'}>
              {accountItems.map((item) => (
                <DropdownMenuItem key={item.title} asChild>
                  <Link href={item.url} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => void signOut()}
                className="flex items-center gap-2 text-red-600 focus:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <SidebarMenuButton
            onClick={() => void signIn()}
            className="w-full justify-start"
            size="lg"
          >
            <DoorOpen className="h-4 w-4" />
            {sidebar.open && <span>Sign In</span>}
          </SidebarMenuButton>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
