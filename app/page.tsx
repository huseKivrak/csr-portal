import Link from 'next/link';
import { generateUsersTableData } from '@/db/queries';
import { DataTable } from '@/components/ui/data-table/data-table';
import { columns } from './(csr)/users/columns';



export default async function Home() {
  const users = await generateUsersTableData();
  return (
    <div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
