import { UserDetailView } from '@/components/views/UserDetailView';
import { notFound } from 'next/navigation';
import { generateDetailedUsersData } from '@/lib/db/actions/queries';

type tParams = Promise<{ id: string; }>;
export default async function UserPage({
  params,
}: {
  params: tParams;
}) {
  const { id } = await params;
  const users = await generateDetailedUsersData();
  const userDetail = users.find((user) => user.user.id === parseInt(id));

  if (!userDetail) {
    notFound();
  }

  return <UserDetailView userDetail={userDetail} />;
}
