"use client";

import { UserDetail } from "@/db/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import { CopyButton } from '@/components/ui/copy-button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { formatDateTime } from '@/lib/utils';
import { SubscriptionBadge } from '@/components/subscription-badge';
import { UserInfoCard } from '@/components/cards/user-info-card';
import { UserSubscriptionCard } from '@/components/cards/user-subscription-card';

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
    accessorKey: "user.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const userDetail = row.original;
      return (
        <Popover>
          <PopoverTrigger>
            <span className="cursor-pointer hover:underline">
              {userDetail.user.name}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-fit p-2">
            <UserInfoCard user={userDetail.user} />
          </PopoverContent>
        </Popover>
      );
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "subscriptions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Subscription" />,
    cell: ({ row }) => {
      const userDetail = row.original;

      return (
        <div className="flex justify-center">
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
    filterFn: "includesString",
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
