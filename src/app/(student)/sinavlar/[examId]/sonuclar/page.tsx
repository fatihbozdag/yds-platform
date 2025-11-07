import ExamHistoryClient from './ExamHistoryClient'

export async function generateStaticParams(): Promise<{ examId: string }[]> {
  return []
}

export default function ExamHistoryPage() {
  return <ExamHistoryClient />
}
