import { type Session } from 'next-auth';
import { type AppType } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Geist } from 'next/font/google';
import { useState, useEffect, Fragment } from 'react';

import { api } from '@/utils/api';

import '@/styles/globals.css';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/sidebar';
import { useRouter } from 'next/router';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const geist = Geist({
  subsets: ['latin']
});

const queryClient = new QueryClient();

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps }
}) => {
  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);

  useEffect(() => {
    const path = router.asPath.split(/[?#]/)[0]!;
    const segments = path.split('/').filter(Boolean);

    setBreadcrumbs(
      segments.map((seg) => {
        if (/^\d+$/.test(seg)) return 'Details';
        return seg.charAt(0).toUpperCase() + seg.slice(1);
      })
    );
  }, [router.asPath]);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <Fragment key={index}>
                      <BreadcrumbItem>
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage>{crumb}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={`/${crumb.toLowerCase()}`}>{crumb}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator>/</BreadcrumbSeparator>
                      )}
                    </Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <main className={cn('p-4', geist.className)}>
              <Component {...pageProps} />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
};

export default api.withTRPC(MyApp);
