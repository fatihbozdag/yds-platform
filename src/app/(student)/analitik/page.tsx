'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { firebase } from '@/lib/firebase-client'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface AnalyticsData {
  timeBasedPerformance: any[]
  topicPerformance: any[]
  difficultyAnalysis: any[]
  studyPatterns: any[]
  weeklyActivity: any[]
  skillsRadar: any[]
  streakData: any[]
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'all'>('month')
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'speed' | 'consistency'>('accuracy')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeFrame])

  const fetchAnalyticsData = async () => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Generate comprehensive analytics data (in real app, this would come from database)
      const mockAnalytics: AnalyticsData = {
        timeBasedPerformance: [
          { time: '09:00', accuracy: 85, count: 12 },
          { time: '11:00', accuracy: 78, count: 8 },
          { time: '14:00', accuracy: 82, count: 15 },
          { time: '16:00', accuracy: 90, count: 20 },
          { time: '19:00', accuracy: 88, count: 25 },
          { time: '21:00', accuracy: 75, count: 18 },
          { time: '23:00', accuracy: 70, count: 10 }
        ],
        topicPerformance: [
          { topic: 'Tenses', accuracy: 85, totalQuestions: 45, avgTime: 120, difficulty: 'Medium' },
          { topic: 'Prepositions', accuracy: 92, totalQuestions: 38, avgTime: 90, difficulty: 'Easy' },
          { topic: 'Reading', accuracy: 78, totalQuestions: 52, avgTime: 180, difficulty: 'Hard' },
          { topic: 'Vocabulary', accuracy: 88, totalQuestions: 60, avgTime: 75, difficulty: 'Easy' },
          { topic: 'Grammar', accuracy: 82, totalQuestions: 42, avgTime: 135, difficulty: 'Medium' },
          { topic: 'Modal Verbs', accuracy: 76, totalQuestions: 28, avgTime: 105, difficulty: 'Hard' }
        ],
        difficultyAnalysis: [
          { level: 'Easy', accuracy: 90, count: 98, avgTime: 85 },
          { level: 'Medium', accuracy: 83, count: 87, avgTime: 125 },
          { level: 'Hard', accuracy: 77, count: 80, avgTime: 165 }
        ],
        studyPatterns: [
          { pattern: 'Morning Study', frequency: 35, performance: 88 },
          { pattern: 'Evening Study', frequency: 45, performance: 85 },
          { pattern: 'Weekend Intensive', frequency: 20, performance: 82 }
        ],
        weeklyActivity: [
          { day: 'Pzt', questions: 25, accuracy: 85, studyTime: 45 },
          { day: 'Sal', questions: 30, accuracy: 88, studyTime: 60 },
          { day: 'Çar', questions: 18, accuracy: 82, studyTime: 30 },
          { day: 'Per', questions: 35, accuracy: 90, studyTime: 75 },
          { day: 'Cum', questions: 28, accuracy: 86, studyTime: 50 },
          { day: 'Cmt', questions: 45, accuracy: 92, studyTime: 90 },
          { day: 'Paz', questions: 40, accuracy: 89, studyTime: 80 }
        ],
        skillsRadar: [
          { skill: 'Vocabulary', score: 88, max: 100 },
          { skill: 'Grammar', score: 82, max: 100 },
          { skill: 'Reading', score: 78, max: 100 },
          { skill: 'Listening', score: 85, max: 100 },
          { skill: 'Writing', score: 80, max: 100 },
          { skill: 'Speaking', score: 75, max: 100 }
        ],
        streakData: [
          { date: '2024-01-15', streak: 5, questions: 20 },
          { date: '2024-01-16', streak: 6, questions: 25 },
          { date: '2024-01-17', streak: 7, questions: 18 },
          { date: '2024-01-18', streak: 8, questions: 30 },
          { date: '2024-01-19', streak: 9, questions: 22 },
          { date: '2024-01-20', streak: 10, questions: 28 },
          { date: '2024-01-21', streak: 11, questions: 35 }
        ]
      }

      setAnalyticsData(mockAnalytics)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return '#10B981' // Green
    if (score >= 70) return '#3B82F6' // Blue
    if (score >= 55) return '#F59E0B' // Yellow
    return '#EF4444' // Red
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Easy': return '#10B981'
      case 'Medium': return '#F59E0B'
      case 'Hard': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316']

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Analitik veriler yükleniyor..." />
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card variant="glass" padding="lg" className="text-center">
          <div className="text-slate-400 text-8xl mb-6">📊</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Veri bulunamadı</h2>
          <p className="text-lg text-slate-600 mb-6">Analizler için daha fazla sınav çözmeniz gerekiyor.</p>
          <Button variant="primary" href="/sinavlar">
            Sınavlara Git
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-3xl">📊</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Öğrenme Analitiği</h1>
          <p className="text-lg text-slate-600">
            Detaylı performans analiziniz ve öğrenme trendleriniz
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <Card variant="glass" padding="md" className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            {[
              { id: 'week', label: 'Bu Hafta', icon: '📅' },
              { id: 'month', label: 'Bu Ay', icon: '📆' },
              { id: 'all', label: 'Tüm Zamanlar', icon: '📈' }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={timeFrame === tab.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTimeFrame(tab.id as 'week' | 'month' | 'all')}
                icon={<span>{tab.icon}</span>}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Metrik:</span>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="accuracy">Doğruluk Oranı</option>
              <option value="speed">Çözüm Hızı</option>
              <option value="consistency">Tutarlılık</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card variant="glass" padding="md" hover className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-3xl font-bold text-blue-600 mb-2">85%</h3>
          <p className="text-sm text-slate-600 mb-1">Genel Başarı</p>
          <Badge variant="success" size="sm">+3% bu ay</Badge>
        </Card>

        <Card variant="glass" padding="md" hover className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-3xl font-bold text-green-600 mb-2">265</h3>
          <p className="text-sm text-slate-600 mb-1">Toplam Soru</p>
          <Badge variant="success" size="sm">+45 bu hafta</Badge>
        </Card>

        <Card variant="glass" padding="md" hover className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">🔥</span>
          </div>
          <h3 className="text-3xl font-bold text-purple-600 mb-2">11</h3>
          <p className="text-sm text-slate-600 mb-1">Günlük Seri</p>
          <Badge variant="secondary" size="sm">Rekor: 15 gün</Badge>
        </Card>

        <Card variant="glass" padding="md" hover className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-3xl font-bold text-orange-600 mb-2">127</h3>
          <p className="text-sm text-slate-600 mb-1">Ortalama Süre (sn)</p>
          <Badge variant="warning" size="sm">-15sn geliştirme</Badge>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Time-based Performance */}
        <Card variant="glass" padding="lg">
          <CardHeader
            title="🕐 Saatlere Göre Performans"
            subtitle="Günün hangi saatlerinde daha başarılısınız?"
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.timeBasedPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis domain={[0, 100]} stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#3B82F6" 
                  strokeWidth={3} 
                  name="Doğruluk %"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card variant="glass" padding="lg">
          <CardHeader
            title="📅 Haftalık Aktivite"
            subtitle="Haftanın günlerine göre çalışma aktiviteniz"
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Bar dataKey="questions" fill="#3B82F6" name="Soru Sayısı" radius={[4, 4, 0, 0]} />
                <Bar dataKey="accuracy" fill="#10B981" name="Doğruluk %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skills Radar */}
        <Card variant="glass" padding="lg">
          <CardHeader
            title="🎯 Yetenek Haritası"
            subtitle="Farklı beceri alanlarındaki güçlü yönleriniz"
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={analyticsData.skillsRadar}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12, fill: '#64748b' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Radar
                  name="Puan"
                  dataKey="score"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Difficulty Analysis */}
        <Card variant="glass" padding="lg">
          <CardHeader
            title="⚡ Zorluk Analizi"
            subtitle="Farklı zorluk seviyelerindeki performansınız"
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.difficultyAnalysis}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ level, accuracy }) => `${level}: %${accuracy}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.difficultyAnalysis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getDifficultyColor(entry.level)} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Topic Performance Table */}
      <Card variant="glass" padding="lg" className="mb-8">
        <CardHeader
          title="📚 Konu Bazlı Performans"
          subtitle="Her konudaki detaylı performans analiziniz"
        />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-4 px-4 font-semibold text-slate-900">Konu</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-900">Doğruluk</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-900">Soru Sayısı</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-900">Ort. Süre</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-900">Zorluk</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-900">Trend</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topicPerformance.map((topic, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-slate-900">{topic.topic}</td>
                    <td className="text-center py-4 px-4">
                      <span 
                        className="font-bold text-lg"
                        style={{ color: getPerformanceColor(topic.accuracy) }}
                      >
                        %{topic.accuracy}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4 text-slate-700">{topic.totalQuestions}</td>
                    <td className="text-center py-4 px-4 text-slate-700">{topic.avgTime}s</td>
                    <td className="text-center py-4 px-4">
                      <Badge 
                        variant="secondary" 
                        size="sm"
                        style={{ 
                          backgroundColor: getDifficultyColor(topic.difficulty) + '20',
                          color: getDifficultyColor(topic.difficulty)
                        }}
                      >
                        {topic.difficulty}
                      </Badge>
                    </td>
                    <td className="text-center py-4 px-4 text-2xl">
                      {topic.accuracy >= 85 ? '📈' : topic.accuracy >= 70 ? '➡️' : '📉'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Study Recommendations */}
      <Card variant="glass" padding="lg" className="mb-8">
        <CardHeader
          title="💡 Kişiselleştirilmiş Öneriler"
          subtitle="Performansınızı artırmak için özel önerilerimiz"
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🎯</span>
                </div>
                <h4 className="font-semibold text-blue-900">Odaklanmanız Gereken Alan</h4>
              </div>
              <p className="text-blue-800 text-sm leading-relaxed">
                Modal Verbs konusunda %76 başarınız var. Bu alanda daha fazla pratik yaparak 
                %85 hedefine ulaşabilirsiniz.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">⭐</span>
                </div>
                <h4 className="font-semibold text-green-900">Güçlü Yönünüz</h4>
              </div>
              <p className="text-green-800 text-sm leading-relaxed">
                Prepositions konusunda %92 başarıyla mükemmel performans gösteriyorsunuz. 
                Bu başarınızı sürdürün!
              </p>
            </div>

            <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">⏰</span>
                </div>
                <h4 className="font-semibold text-purple-900">En Verimli Saatiniz</h4>
              </div>
              <p className="text-purple-800 text-sm leading-relaxed">
                16:00-17:00 arası en yüksek performansınızı gösteriyorsunuz (%90). 
                Zor konuları bu saatlerde çalışın.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🚀</span>
                </div>
                <h4 className="font-semibold text-orange-900">Motivasyon</h4>
              </div>
              <p className="text-orange-800 text-sm leading-relaxed">
                11 günlük çalışma seriniz harika! Hedefiniz olan 15 günlük seriye 4 gün kaldı.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Insights */}
      <Card variant="glass" padding="lg">
        <CardHeader
          title="🧠 Öğrenme İçgörüleri"
          subtitle="Verilerinizden çıkarılan önemli bulgular"
        />
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">📈</span>
              </div>
              <div>
                <div className="font-semibold text-slate-900 mb-2">Performans Trendi</div>
                <div className="text-slate-700 text-sm leading-relaxed">
                  Son 30 günde %3 geliştirme gösterdiniz. Bu trend devam ederse 3 ay içinde %90 başarıya ulaşabilirsiniz.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-green-50 rounded-xl border border-slate-200">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">⚡</span>
              </div>
              <div>
                <div className="font-semibold text-slate-900 mb-2">Hız Analizi</div>
                <div className="text-slate-700 text-sm leading-relaxed">
                  Ortalama çözüm süreniz 127 saniye. Hedef YDS süresi olan 90 saniyeye ulaşmak için günde 5 soru daha çözün.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl border border-slate-200">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <div className="font-semibold text-slate-900 mb-2">Tutarlılık Skoru</div>
                <div className="text-slate-700 text-sm leading-relaxed">
                  Performans tutarlılığınız %82. Daha düzenli çalışma saatleri ile bu oranı %90'a çıkarabilirsiniz.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}