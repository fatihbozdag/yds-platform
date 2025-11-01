import ExamTakeClient from './ExamTakeClient'

export async function generateStaticParams() {
  return []
}

export const dynamic = 'force-static'

export default function ExamTakePage() {
  return <ExamTakeClient />
}
