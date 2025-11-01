import TopicDetailClient from './TopicDetailClient'

export async function generateStaticParams() {
  return []
}

export const dynamic = 'force-static'

export default function TopicDetailPage() {
  return <TopicDetailClient />
}
