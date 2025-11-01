import ExamAnalysisClient from './ExamAnalysisClient'

export async function generateStaticParams() {
  return []
}

export const dynamic = 'force-static'

export default function ExamAnalysisPage() {
  return <ExamAnalysisClient />
}
