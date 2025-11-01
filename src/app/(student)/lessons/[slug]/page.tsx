import LessonClient from './LessonClient'

export async function generateStaticParams() {
  return []
}

export const dynamic = 'force-static'

export default function LessonPage() {
  return <LessonClient />
}
