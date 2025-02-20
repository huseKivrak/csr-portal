"use client";

import { UserDetail } from "@/db/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import { UserHoverCard } from '@/components/ui/user-hover-card';
import { makeVehicleTitle, formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import { CopyButton } from '@/components/ui/copy-button';

export const columns: ColumnDef<UserDetail>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Link href={`users/${user.id}`} className="hover:underline">
          <UserHoverCard user={row.original} />
        </Link>
      );
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "subscriptions",
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Subscription" />,
    cell: ({ row }) => {
      const subscription = row.original.subscriptions?.[ 0 ];
      const isOverdue = row.original.is_overdue;

      if (!subscription) {
        return <Badge variant="outline">No subscription</Badge>;
      }

      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant={isOverdue ? "destructive" : "secondary"}>
              {formatDateTime(subscription.next_payment_date, false)}
            </Badge>
            {isOverdue && <span className="text-destructive text-sm">Overdue</span>}
          </div>
          <span className="text-xs text-muted-foreground">
            Next payment
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const email = row.original.email;
      return (
        <div className="flex">
          {email}
          <CopyButton content={email} />
        </div>
      );
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "lastWash",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Wash" />,
    cell: ({ row }) => {
      const date = row.original.last_wash;
      const washCount = row.original.washes?.length || 0;

      return (
        <div className="flex flex-col gap-1">
          <div className="text-sm">
            {date ? formatDateTime(date) : 'No washes'}
          </div>
          {washCount > 0 && (
            <span className="text-xs text-muted-foreground">
              Total washes: {washCount}
            </span>
          )}
        </div>
      );
    },
  },
  // {
  //   accessorKey: "updatedAt",
  //   header: ({ column }) => <DataTableColumnHeader column={column} title="Last Updated" />,
  //   cell: ({ row }) => (
  //     <div className="text-sm text-muted-foreground">
  //       {row.original.updated_at ? formatDateTime(row.original.updated_at) : 'No updates'}
  //     </div>
  //   ),
  // },
];
