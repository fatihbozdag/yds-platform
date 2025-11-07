import TopicDetailClient from './TopicDetailClient'

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return []
}

export default function TopicDetailPage() {
  return <TopicDetailClient />
}
