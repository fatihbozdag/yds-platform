import ExamTakeClient from './ExamTakeClient'

export async function generateStaticParams(): Promise<{ examId: string }[]> {
  return []
}

export default function ExamTakePage() {
  return <ExamTakeClient />
}
