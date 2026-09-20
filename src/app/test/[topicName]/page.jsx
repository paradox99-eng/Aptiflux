import QuizClient from './QuizClient';
import { Suspense } from 'react';

// Next.js 15 requires async params for server components
export default async function Page({ params }) {
  const { topicName } = await params;

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <QuizClient topicName={topicName} />
    </Suspense>
  );
}
