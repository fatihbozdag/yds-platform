import FlashcardsClient from './FlashcardsClient'

export async function generateStaticParams(): Promise<{ setId: string }[]> {
  return []
}

export default function FlashcardsPage() {
  return <FlashcardsClient />
}
