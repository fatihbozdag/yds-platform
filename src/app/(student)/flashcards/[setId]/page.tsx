import FlashcardsClient from './FlashcardsClient'

export async function generateStaticParams() {
  return []
}

export const dynamic = 'force-static'

export default function FlashcardsPage() {
  return <FlashcardsClient />
}
