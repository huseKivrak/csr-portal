'use client';

import { Breadcrumbs } from '@/components/ui/app-breadcrumbs';
import { ModeToggle } from './mode-toggle';

export function Navbar() {
  return (
    <nav className="bg-background">
      <div className="flex h-12 items-center px-2 w-full justify-between">
        <div className="flex-1">
          <Breadcrumbs />
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}