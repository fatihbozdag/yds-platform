import ExamStartClient from './ExamStartClient'

export async function generateStaticParams(): Promise<{ examId: string }[]> {
  return []
}

export default function ExamStartPage() {
  return <ExamStartClient />
}
