import LessonClient from './LessonClient'

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return []
}

export default function LessonPage() {
  return <LessonClient />
}
