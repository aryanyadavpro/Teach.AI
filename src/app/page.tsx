import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user?.role === 'TEACHER') {
    redirect('/teacher/dashboard');
  } else {
    redirect('/student/dashboard');
  }
}
