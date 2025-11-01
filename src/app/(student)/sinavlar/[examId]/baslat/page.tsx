import ExamStartClient from './ExamStartClient'

export async function generateStaticParams() {
  return []
}

export const dynamic = 'force-static'

export default function ExamStartPage() {
  return <ExamStartClient />
}
