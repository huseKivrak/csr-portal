import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { UserDetailView } from '@/components/views/UserDetailView';
import { notFound } from 'next/navigation';
import { generateDetailedUsersData } from '@/lib/db/actions/queries';

export default async function UserPage({ params }: { params: { id: string; }; }) {
  const users = await generateDetailedUsersData();
  const userDetail = users.find((user) => user.user.id === parseInt(params.id));

  if (!userDetail) {
    notFound();
  }

  return <UserDetailView userDetail={userDetail} />;
}
