"use client";

import { UserDetail } from "@/db/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table/column-header';
import { CopyButton } from '@/components/copy-button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDateTime } from '@/lib/utils';
import { SubscriptionBadge } from '@/components/subscription-badge';
import { UserSubscriptionCard } from '@/components/cards/user-subscription-card';
import Link from 'next/link';

export const columns: ColumnDef<UserDetail>[] = [
  {
    id: "name",
    accessorKey: "user.name",
    filterFn: "includesString",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const userDetail = row.original;
      return (
        <Link href={`/users/${userDetail.user.id}`} prefetch={true}>
          <span className="cursor-pointer hover:underline">
            {userDetail.user.name}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "subscriptions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Subscription" />,
    cell: ({ row }) => {
      const userDetail = row.original;

      return (
        <div className="">
          {!userDetail.subscriptions?.length ? (
            <Badge variant="outline">N/A</Badge>
          ) : (
            <Popover>
              <PopoverTrigger>
                <SubscriptionBadge subscriptions={userDetail.subscriptions} />
              </PopoverTrigger>
              <PopoverContent className="w-fit p-2">
                <UserSubscriptionCard userDetail={userDetail} />
              </PopoverContent>
            </Popover>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "user.email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const email = row.original.user.email;
      return (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{email}</span>
          <CopyButton content={email} />
        </div>
      );
    },
  },
  {
    accessorKey: "last_wash_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Wash" />,
    cell: ({ row }) => {
      const lastWash = row.original.last_wash_date;

      return (
        <div className="flex flex-col gap-1">
          {lastWash ? formatDateTime(lastWash, false) : 'N/A'}
        </div>
      );
    },
  },
];
