import QuestionDetailClient from './QuestionDetailClient'

export async function generateStaticParams(): Promise<{ questionId: string }[]> {
  return []
}

export default function QuestionDetailPage() {
  return <QuestionDetailClient />
}
