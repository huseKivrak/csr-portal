import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { UserDetail } from '@/components/views/UserDetail';


export default async function UserPage({ params }: { params: { id: string; }; }) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, parseInt(params.id)),
    with: {
      vehicles: true,
      subscriptions: {
        with: {
          plan: true,
        },
      },
    },
  });
  if (!user) {
    throw new Error("Failed to fetch user data");
  }

  return (
    <div className="space-y-6">

      <UserDetail user={user} />

    </div>
  );
}
