import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",


        // for subscription badges: displays the value in the child <span> within an indicator
        "destructive-indicator":
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80 [&>span]:bg-destructive-foreground/20 [&>span]:ml-1 [&>span]:inline-flex [&>span]:h-5 [&>span]:w-5 [&>span]:items-center [&>span]:justify-center [&>span]:rounded-full",
        "success-indicator":
          "border-transparent bg-chart-3 text-primary-foreground shadow hover:bg-chart-3/80 [&>span]:bg-primary-foreground/20 [&>span]:ml-1 [&>span]:inline-flex [&>span]:h-5 [&>span]:w-5 [&>span]:items-center [&>span]:justify-center [&>span]:rounded-full",
        "mixed-indicator":
          "border-transparent bg-chart-1 text-primary-foreground shadow hover:bg-chart-1/80 [&>span]:bg-primary-foreground/20 [&>span]:ml-1 [&>span]:inline-flex [&>span]:h-5 [&>span]:w-6 [&>span]:items-center [&>span]:justify-center [&>span]:rounded-full [&>span]:text-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
