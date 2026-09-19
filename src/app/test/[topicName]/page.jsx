import QuizClient from './QuizClient';

// Next.js 15 requires async params for server components
export default async function Page({ params }) {
  const { topicName } = await params;

  return (
    <QuizClient topicName={topicName} />
  );
}
