import TopicClient from './TopicClient';

export default async function Page({ params }) {
  const { topicName } = await params;

  return (
    <TopicClient topicName={topicName} />
  );
}
