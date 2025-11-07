import ExamAnalysisClient from './ExamAnalysisClient'

export async function generateStaticParams(): Promise<{ examId: string }[]> {
  return []
}

export default function ExamAnalysisPage() {
  return <ExamAnalysisClient />
}
