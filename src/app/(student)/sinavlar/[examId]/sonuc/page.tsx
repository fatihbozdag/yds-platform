import ExamResultClient from './ExamResultClient'

export async function generateStaticParams(): Promise<{ examId: string }[]> {
  return []
}

export default function ExamResultPage() {
  return <ExamResultClient />
}
