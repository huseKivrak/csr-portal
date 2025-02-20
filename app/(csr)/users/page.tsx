import { SelectUser } from "@/db/types";
import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "./columns";
import { generateUsersTableData } from "@/db/queries";
import { Suspense } from 'react';
import { SkeletonTable } from "@/components/ui/data-table/skeleton-table";

async function getData() {
  const users = await generateUsersTableData();
  return users;
}


export default async function UsersPage() {
  const data = await getData();


  return (
    <div className="container mx-auto py-10">
      <Suspense fallback={<SkeletonTable />}>
        <DataTable columns={columns} data={data} />
      </Suspense>

    </div>
  );
}
