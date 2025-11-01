import QuizClient from './QuizClient'

export async function generateStaticParams() {
  return []
}

export const dynamic = 'force-static'

export default function QuizPage() {
  return <QuizClient />
}
