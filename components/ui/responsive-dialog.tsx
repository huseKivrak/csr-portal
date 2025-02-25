import * as React from "react";

import { cn } from "@/lib/utils";
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface ResponsiveDialogProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ResponsiveDialog({
  children,
  trigger,

  className,
  open,
  onOpenChange,
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [ isOpen, setIsOpen ] = React.useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isControlled = open !== undefined;
  const showOpen = isControlled ? open : isOpen;
  const setShowOpen = isControlled ? onOpenChange : setIsOpen;

  if (isDesktop) {
    return (
      <Dialog open={showOpen} onOpenChange={setShowOpen}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className={cn("sm:max-w-[425px]", className)}>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={showOpen} onOpenChange={setShowOpen}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent>
        <div className={cn("px-4", className)}>
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

