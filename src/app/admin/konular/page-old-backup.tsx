'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { firebase } from '@/lib/firebase-client'
import { Topic } from '@/types'
import { generateSlug } from '@/lib/utils'

const topicSchema = z.object({
  title: z.string().min(2, 'Başlık en az 2 karakter olmalıdır'),
  content: z.string().min(10, 'İçerik en az 10 karakter olmalıdır'),
  order_index: z.number().min(0, 'Sıra numarası 0 veya daha büyük olmalıdır')
})

type TopicForm = z.infer<typeof topicSchema>

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'topics' | 'create' | 'preview'>('topics')
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [previewTopic, setPreviewTopic] = useState<Topic | null>(null)
  
  // Rich text editor states
  const [topicImage, setTopicImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [contentPreview, setContentPreview] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<TopicForm>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      order_index: 0
    }
  })

  const watchedContent = watch('content', '')
  const watchedTitle = watch('title', '')

  useEffect(() => {
    fetchTopics()
  }, [])

  useEffect(() => {
    // Update content preview when content changes
    setContentPreview(watchedContent)
  }, [watchedContent])

  const fetchTopics = async () => {
    setLoading(true)
    try {
      const { data, error } = await firebase
        .from('topics')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setTopics(data || [])
    } catch (error) {
      console.error('Error fetching topics:', error)
      alert('Konular yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Dosya boyutu 5MB\'dan büyük olamaz')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('Sadece resim dosyaları yüklenebilir')
        return
      }
      setTopicImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadTopicImage = async (): Promise<string | null> => {
    if (!topicImage) return null
    
    setUploadingImage(true)
    try {
      const fileExt = topicImage.name.split('.').pop()
      const fileName = `topic-${Date.now()}.${fileExt}`
      
      const { data, error } = await firebase.storage
        .from('topic-images')
        .upload(fileName, topicImage)

      if (error) throw error

      const { data: { publicUrl } } = firebase.storage
        .from('topic-images')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Resim yüklenirken hata oluştu')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const insertTextAtCursor = (text: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const currentValue = textarea.value
      const newValue = currentValue.substring(0, start) + text + currentValue.substring(end)
      
      setValue('content', newValue)
      textarea.focus()
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.setSelectionRange(start + text.length, start + text.length)
      }, 0)
    }
  }

  const formatText = (type: string) => {
    switch (type) {
      case 'bold':
        insertTextAtCursor('**Kalın metin**')
        break
      case 'italic':
        insertTextAtCursor('*İtalik metin*')
        break
      case 'heading':
        insertTextAtCursor('\n\n## Başlık\n\n')
        break
      case 'list':
        insertTextAtCursor('\n- Liste öğesi\n- Liste öğesi\n')
        break
      case 'numbered-list':
        insertTextAtCursor('\n1. Numaralı liste\n2. Numaralı liste\n')
        break
      case 'link':
        insertTextAtCursor('[Link metni](http://example.com)')
        break
      case 'code':
        insertTextAtCursor('`kod`')
        break
      case 'quote':
        insertTextAtCursor('\n> Alıntı metni\n')
        break
    }
  }

  const insertImageToContent = async () => {
    if (topicImage) {
      const imageUrl = await uploadTopicImage()
      if (imageUrl) {
        insertTextAtCursor(`\n\n![Açıklama](${imageUrl})\n\n`)
        setTopicImage(null)
        setImagePreview(null)
      }
    }
  }

  const handleCreateTopic = async (data: TopicForm) => {
    setSubmitting(true)
    try {
      const slug = generateSlug(data.title)
      
      const { error } = await firebase
        .from('topics')
        .insert({
          title: data.title,
          slug: slug,
          content: data.content,
          order_index: data.order_index
        })

      if (error) throw error

      await fetchTopics()
      setActiveTab('topics')
      reset()
      clearRichTextStates()
      alert('Konu başarıyla eklendi')
    } catch (error: unknown) {
      console.error('Error creating topic:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      
      if (errorMessage.includes('duplicate key value')) {
        alert('Bu başlıkta bir konu zaten var. Lütfen farklı bir başlık kullanın.')
      } else {
        alert('Konu eklenirken bir hata oluştu: ' + errorMessage)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditTopic = async (data: TopicForm) => {
    if (!editingTopic) return
    
    setSubmitting(true)
    try {
      const slug = generateSlug(data.title)
      
      const { error } = await firebase
        .from('topics')
        .update({
          title: data.title,
          slug: slug,
          content: data.content,
          order_index: data.order_index,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTopic.id)

      if (error) throw error

      await fetchTopics()
      setActiveTab('topics')
      setEditingTopic(null)
      reset()
      clearRichTextStates()
      alert('Konu başarıyla güncellendi')
    } catch (error: unknown) {
      console.error('Error updating topic:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      alert('Konu güncellenirken bir hata oluştu: ' + errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const startEditing = (topic: Topic) => {
    setEditingTopic(topic)
    setValue('title', topic.title)
    setValue('content', topic.content)
    setValue('order_index', topic.order_index)
    setActiveTab('create')
    clearRichTextStates()
  }

  const cancelEditing = () => {
    setEditingTopic(null)
    setActiveTab('topics')
    reset()
    clearRichTextStates()
  }

  const clearRichTextStates = () => {
    setTopicImage(null)
    setImagePreview(null)
    setContentPreview('')
  }

  const startPreview = (topic: Topic) => {
    setPreviewTopic(topic)
    setActiveTab('preview')
  }

  const formatMarkdownForDisplay = (content: string) => {
    // Simple markdown-to-HTML conversion for preview
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-2 mt-4">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mb-2 mt-3">$1</h3>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-200 px-1 rounded">$1</code>')
      .replace(/> (.*$)/gm, '<blockquote class="border-l-4 border-slate-300 pl-4 italic">$1</blockquote>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 underline" target="_blank">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded border my-4" />')
      .replace(/\n/g, '<br>')
  }

  const deleteTopic = async (topic: Topic) => {
    if (!confirm(`"${topic.title}" konusunu silmek istediğinizden emin misiniz?`)) {
      return
    }

    try {
      const { error } = await firebase
        .from('topics')
        .delete()
        .eq('id', topic.id)

      if (error) throw error

      await fetchTopics()
      alert('Konu başarıyla silindi')
    } catch (error: unknown) {
      console.error('Error deleting topic:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      alert('Konu silinirken bir hata oluştu: ' + errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Konular yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Konu Yönetimi</h1>
        <button
          onClick={() => {
            setActiveTab('create')
            setEditingTopic(null)
            reset()
            clearRichTextStates()
          }}
          className="btn-primary"
        >
          📝 Yeni Konu Ekle
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'topics', label: 'Konular', icon: '📚', count: topics.length },
            { id: 'create', label: editingTopic ? 'Konu Düzenle' : 'Konu Oluştur', icon: editingTopic ? '✏️' : '➕' },
            { id: 'preview', label: 'Önizleme', icon: '👁️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'topics' | 'create' | 'preview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.count !== undefined && <span className="text-xs">({tab.count})</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Topics Tab */}
      {activeTab === 'topics' && (
        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Mevcut Konular ({topics.length})
            </h2>
            
            {topics.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Henüz konu eklenmemiş.
              </div>
            ) : (
              <div className="space-y-3">
                {topics.map((topic, index) => (
                  <div key={topic.id} className="flex justify-between items-start p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          #{topic.order_index}
                        </span>
                        <h3 className="font-semibold text-slate-900">{topic.title}</h3>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        Slug: <code className="bg-slate-200 px-1 rounded">{topic.slug}</code>
                      </p>
                      <p className="text-sm text-slate-700 line-clamp-2">
                        {topic.content.length > 100 
                          ? topic.content.substring(0, 100) + '...'
                          : topic.content
                        }
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        Oluşturma: {new Date(topic.created_at).toLocaleDateString('tr-TR')} | 
                        Güncelleme: {new Date(topic.updated_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => startPreview(topic)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded"
                        title="Önizle"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => startEditing(topic)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium px-2 py-1 rounded"
                        title="Düzenle"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteTopic(topic)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded"
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Tab */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          {/* Rich Text Editor */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingTopic ? 'Konu Düzenle' : 'Yeni Konu Oluştur'}
            </h2>
            
            <form onSubmit={handleSubmit(editingTopic ? handleEditTopic : handleCreateTopic)} className="space-y-6">
              {/* Title and Order */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                    Konu Başlığı *
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    id="title"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Örn: Present Tenses"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="order_index" className="block text-sm font-medium text-slate-700 mb-2">
                    Sıralama
                  </label>
                  <input
                    {...register('order_index', { valueAsNumber: true })}
                    type="number"
                    id="order_index"
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                  {errors.order_index && (
                    <p className="mt-1 text-sm text-red-600">{errors.order_index.message}</p>
                  )}
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Konu İçeriği * 
                  <span className="text-xs text-slate-500 font-normal">(Markdown desteği)</span>
                </label>
                
                <div className="bg-slate-50 border border-slate-300 rounded-t-md p-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => formatText('bold')}
                      className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100"
                      title="Kalın (Bold)"
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      type="button"
                      onClick={() => formatText('italic')}
                      className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100"
                      title="İtalik (Italic)"
                    >
                      <em>I</em>
                    </button>
                    <button
                      type="button"
                      onClick={() => formatText('heading')}
                      className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100"
                      title="Başlık (Heading)"
                    >
                      H2
                    </button>
                    <div className="border-r border-slate-300 mx-1"></div>
                    <button
                      type="button"
                      onClick={() => formatText('list')}
                      className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100"
                      title="Liste (List)"
                    >
                      •
                    </button>
                    <button
                      type="button"
                      onClick={() => formatText('numbered-list')}
                      className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100"
                      title="Numaralı Liste"
                    >
                      1.
                    </button>
                    <div className="border-r border-slate-300 mx-1"></div>
                    <button
                      type="button"
                      onClick={() => formatText('link')}
                      className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100"
                      title="Link"
                    >
                      🔗
                    </button>
                    <button
                      type="button"
                      onClick={() => formatText('code')}
                      className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100"
                      title="Kod (Code)"
                    >
                      &lt;&gt;
                    </button>
                    <button
                      type="button"
                      onClick={() => formatText('quote')}
                      className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100"
                      title="Alıntı (Quote)"
                    >
                      &quot;
                    </button>
                  </div>
                </div>

                <textarea
                  {...register('content')}
                  id="content"
                  rows={12}
                  className="w-full px-3 py-2 border border-slate-300 border-t-0 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  placeholder="Konu anlatımını buraya yazın... Markdown formatını kullanabilirsiniz."
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Görsel Ekle (Opsiyonel)
                </label>
                
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      PNG, JPG, GIF formatları desteklenir. Maksimum boyut: 5MB
                    </p>
                  </div>
                  
                  {topicImage && (
                    <button
                      type="button"
                      onClick={insertImageToContent}
                      disabled={uploadingImage}
                      className="btn-secondary disabled:opacity-50"
                    >
                      {uploadingImage ? 'Yükleniyor...' : 'İçeriğe Ekle'}
                    </button>
                  )}
                </div>

                {imagePreview && (
                  <div className="mt-3">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-w-xs h-auto rounded border"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Kaydediliyor...' : editingTopic ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="btn-secondary"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (watchedTitle && watchedContent) {
                      setPreviewTopic({
                        id: 'preview',
                        title: watchedTitle,
                        content: watchedContent,
                        slug: generateSlug(watchedTitle),
                        order_index: 0,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      })
                      setActiveTab('preview')
                    } else {
                      alert('Önizleme için başlık ve içerik gerekli')
                    }
                  }}
                  className="btn-secondary"
                >
                  👁️ Önizle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && previewTopic && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Konu Önizlemesi</h2>
            <button
              onClick={() => setActiveTab(previewTopic.id === 'preview' ? 'create' : 'topics')}
              className="btn-secondary"
            >
              ← Geri Dön
            </button>
          </div>

          {/* Preview Content - How students will see it */}
          <div className="card p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                  Konu #{previewTopic.order_index}
                </span>
                <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
                <span className="text-sm text-slate-500">
                  {new Date(previewTopic.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-slate-900 mb-8">
                {previewTopic.title}
              </h1>

              <div 
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: formatMarkdownForDisplay(previewTopic.content) 
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}