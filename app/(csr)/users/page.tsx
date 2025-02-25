
import { generateDetailedUsersData } from "@/lib/db/actions/queries";
import { columns } from './columns';
import { DataTable } from '@/components/data-table/data-table';
import { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';

export default async function UsersPage() {

  const data = await generateDetailedUsersData();

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      <Suspense fallback={<DataTableSkeleton />}>
        <DataTable columns={columns} data={data} />
      </Suspense>
    </div>
  );
}
