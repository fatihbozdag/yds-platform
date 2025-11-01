'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'
import { Topic, BookmarkedTopic } from '@/types'

interface BookmarkedTopicWithDetails extends BookmarkedTopic {
  topic: Topic
}

export default function FavoritesPage() {
  const router = useRouter()
  const [bookmarkedTopics, setBookmarkedTopics] = useState<BookmarkedTopicWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookmarkedTopics()
  }, [])

  const fetchBookmarkedTopics = async () => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get bookmarked topics with topic details
      const { data: bookmarks } = await firebase
        .from('bookmarked_topics')
        .select(`
          *,
          topics (
            id,
            title,
            slug,
            content,
            order_index,
            created_at,
            updated_at
          )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      if (bookmarks) {
        // Transform the data to match our interface
        const transformedBookmarks = bookmarks.map((bookmark: any) => ({
          ...bookmark,
          topic: bookmark.topics
        }))
        setBookmarkedTopics(transformedBookmarks)
      }
    } catch (error) {
      console.error('Error fetching bookmarked topics:', error)
      alert('Favoriler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const removeBookmark = async (topicId: string) => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) return

      const { error } = await firebase
        .from('bookmarked_topics')
        .delete()
        .eq('student_id', user.id)
        .eq('topic_id', topicId)

      if (!error) {
        setBookmarkedTopics(prev => prev.filter(bt => bt.topic_id !== topicId))
      }
    } catch (error) {
      console.error('Error removing bookmark:', error)
      alert('Favori kaldırılırken bir hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Favorileriniz yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Favori Konularım</h1>
        <p className="text-slate-600">
          İşaretlediğiniz konuları buradan takip edebilir ve kolayca erişebilirsiniz
        </p>
      </div>

      {/* Empty State */}
      {bookmarkedTopics.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Henüz favori konu yok
          </h3>
          <p className="text-slate-600 mb-6">
            Konu sayfalarında ⭐ butonuna tıklayarak konuları favorilerinize ekleyebilirsiniz
          </p>
          <Link href="/konular" className="btn-primary">
            Konulara Göz At
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarkedTopics.map((bookmarkedTopic) => (
            <div key={bookmarkedTopic.id} className="card p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {bookmarkedTopic.topic.title}
                    </h3>
                    <span className="text-sm text-slate-500">
                      Konu {bookmarkedTopic.topic.order_index}
                    </span>
                  </div>
                  
                  <div className="text-slate-700 mb-4">
                    {bookmarkedTopic.topic.content.length > 200 
                      ? `${bookmarkedTopic.topic.content.substring(0, 200)}...`
                      : bookmarkedTopic.topic.content
                    }
                  </div>

                  <div className="text-sm text-slate-500">
                    Favorilere eklendi: {new Date(bookmarkedTopic.created_at).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-6">
                  <Link 
                    href={`/konular/${bookmarkedTopic.topic.slug}`}
                    className="btn-primary"
                  >
                    Konuya Git
                  </Link>
                  <button
                    onClick={() => removeBookmark(bookmarkedTopic.topic_id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                    title="Favorilerden kaldır"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/konular" className="card p-4 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-medium text-slate-900">Tüm Konular</div>
              <div className="text-sm text-slate-600">Diğer konuları keşfedin</div>
            </div>
          </Link>
          <Link href="/sinavlar" className="card p-4 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium text-slate-900">Sınavlar</div>
              <div className="text-sm text-slate-600">Pratik yapmaya başlayın</div>
            </div>
          </Link>
          <Link href="/ilerleme" className="card p-4 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-slate-900">İlerleme</div>
              <div className="text-sm text-slate-600">Performansınızı inceleyin</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}