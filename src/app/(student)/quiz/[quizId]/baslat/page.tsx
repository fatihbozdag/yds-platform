import QuizClient from './QuizClient'

export async function generateStaticParams(): Promise<{ quizId: string }[]> {
  return []
}

export default function QuizPage() {
  return <QuizClient />
}
