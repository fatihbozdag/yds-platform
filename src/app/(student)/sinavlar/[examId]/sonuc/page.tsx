import ExamResultClient from './ExamResultClient'

export async function generateStaticParams() {
  return []
}

export const dynamic = 'force-static'

export default function ExamResultPage() {
  return <ExamResultClient />
}
