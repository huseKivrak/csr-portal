'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routeLabels: Record<string, string> = {
  'dashboard': 'Dashboard',
  'users': 'Users',
  'users/[id]': 'User Details',
  'subscriptions': 'Subscriptions',
  'vehicles': 'Vehicles',
  'payments': 'Payments',
};

// Add this type for better type safety
type BreadcrumbSegment = {
  label: string;
  href: string;
  isCurrentPage: boolean;
};

export function Breadcrumbs() {
  const pathname = usePathname();

  // Extract userId from path if we're on a user detail page
  const userId = useMemo(() => {
    const segments = pathname.split('/');
    return segments[ 1 ] === 'users' && segments[ 2 ] ? segments[ 2 ] : null;
  }, [ pathname ]);

  //todo: fetch user name
  const userName = userId;

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbSegments: BreadcrumbSegment[] = [
      { label: 'Home', href: '/', isCurrentPage: segments.length === 0 }
    ];

    segments.forEach((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join('/')}`;
      let label = routeLabels[ segment ] || segment;

      // Handle user detail route
      if (segments[ 0 ] === 'users' && index === 1) {
        // TODO: Replace this with fetched user name
        label = userName || 'User Details';
      }

      breadcrumbSegments.push({
        label,
        href,
        isCurrentPage: index === segments.length - 1
      });
    });

    return breadcrumbSegments;
  }, [ pathname, userName ]);

  return (
    <Breadcrumb className="px-6 py-4 border-b">
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <BreadcrumbItem key={item.href}>
            {item.isCurrentPage ? (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}