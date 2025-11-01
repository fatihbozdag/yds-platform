import ExamHistoryClient from './ExamHistoryClient'

export async function generateStaticParams() {
  return []
}

export const dynamic = 'force-static'

export default function ExamHistoryPage() {
  return <ExamHistoryClient />
}
