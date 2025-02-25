import { UserDetailView } from '@/components/views/UserDetailView';
import { notFound } from 'next/navigation';
import { generateDetailedUsersData } from '@/lib/db/actions/queries';

export default async function UserPage({
  params,
}: {
  params: { id: string; };
}) {
  const { id } = params;
  const users = await generateDetailedUsersData();
  const userDetail = users.find((user) => user.user.id === parseInt(id));

  if (!userDetail) {
    notFound();
  }

  return <UserDetailView userDetail={userDetail} />;
}
