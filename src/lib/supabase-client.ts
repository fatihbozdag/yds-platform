// Demo mode for admin panels - no Firebase needed for development
const ADMIN_DEMO_DATA = {
  'profiles': [
    {
      id: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1',
      email: 'fbozdag1989@gmail.com',
      full_name: 'Fatih Bozdag',
      role: 'admin',
      permissions: {
        canCreateQuestions: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canModerateContent: true,
        canAccessAdminPanel: true
      },
      created_at: new Date('2025-09-27').toISOString(),
      updated_at: new Date('2025-09-27').toISOString()
    },
    {
      id: 'student-123',
      email: 'student@demo.com',
      full_name: 'Demo Student',
      role: 'student',
      created_at: new Date('2025-09-25').toISOString(),
      updated_at: new Date('2025-09-25').toISOString()
    }
  ],
  'tutor_questions': [
    {
      id: '1',
      student_id: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1',
      question_text: 'Reading comprehension konusunda zorlanıyorum. Hangi stratejileri önerirsiniz?',
      category: 'reading',
      status: 'pending',
      created_at: new Date('2025-09-20').toISOString(),
      updated_at: new Date('2025-09-20').toISOString(),
      profiles: {
        id: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1',
        full_name: 'Fatih Bozdag',
        email: 'fbozdag1989@gmail.com'
      }
    },
    {
      id: '2', 
      student_id: 'student-123',
      question_text: 'Grammar konularında hangi kaynaklardan çalışabilirim?',
      category: 'grammar',
      status: 'answered',
      created_at: new Date('2025-09-18').toISOString(),
      updated_at: new Date('2025-09-19').toISOString(),
      admin_response: 'Grammar konuları için önerilen kaynaklar...',
      responded_at: new Date('2025-09-19').toISOString(),
      profiles: {
        id: 'student-123',
        full_name: 'Demo Student',
        email: 'student@demo.com'
      }
    }
  ],
  'questions': [
    {
      id: '1',
      exam_id: '1',
      question_text: 'Reading the following passage carefully and answer the question.\n\nThe rapid advancement of artificial intelligence has sparked debates about its impact on employment. While some experts argue that AI will create new job opportunities, others fear widespread job displacement. The key lies in adapting our education systems and reskilling programs to prepare workers for an AI-driven economy.\n\nWhat is the main concern discussed in the passage?',
      option_a: 'The slow progress of artificial intelligence development',
      option_b: 'The impact of AI on employment and job markets',
      option_c: 'The lack of funding for AI research',
      option_d: 'The difficulty of programming AI systems',
      option_e: 'The high cost of implementing AI technology',
      correct_answer: 'B',
      explanation: 'The passage clearly states that AI advancement has "sparked debates about its impact on employment" and discusses both job creation and displacement concerns. This makes option B the correct answer.',
      order_index: 1,
      category: 'reading',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      created_by: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1'
    },
    {
      id: '2',
      exam_id: '1',
      question_text: 'Choose the best option to complete the sentence:\n\n"Despite _____ extensively for the exam, she felt nervous about the results."',
      option_a: 'to study',
      option_b: 'study',
      option_c: 'studying',
      option_d: 'studied',
      option_e: 'studies',
      correct_answer: 'C',
      explanation: 'After "despite" we need a gerund (verb + -ing). "Despite studying extensively" is the correct grammatical form. Despite is a preposition that requires a gerund or noun phrase.',
      order_index: 2,
      category: 'grammar',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      created_by: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1'
    },
    {
      id: '3',
      exam_id: '1',
      question_text: 'Read the following text and answer the question.\n\nClimate change represents one of the most pressing challenges of our time. Scientists have reached a consensus that human activities, particularly the emission of greenhouse gases, are the primary drivers of current climate change. The consequences include rising sea levels, extreme weather events, and disruptions to ecosystems worldwide.\n\nAccording to the passage, what is the main cause of current climate change?',
      option_a: 'Natural climate variations over time',
      option_b: 'Solar radiation changes',
      option_c: 'Human activities and greenhouse gas emissions',
      option_d: 'Volcanic eruptions and natural disasters',
      option_e: 'Changes in ocean currents',
      correct_answer: 'C',
      explanation: 'The passage explicitly states that "human activities, particularly the emission of greenhouse gases, are the primary drivers of current climate change." This directly corresponds to option C.',
      order_index: 3,
      category: 'reading',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      created_by: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1'
    },
    {
      id: '4',
      exam_id: '1',
      question_text: 'Select the grammatically correct sentence:',
      option_a: 'Neither the students nor the teacher were satisfied with the results.',
      option_b: 'Neither the students nor the teacher was satisfied with the results.',
      option_c: 'Neither the students nor the teacher have been satisfied with the results.',
      option_d: 'Neither the students nor the teacher are satisfied with the results.',
      option_e: 'Neither the students nor the teacher been satisfied with the results.',
      correct_answer: 'B',
      explanation: 'With "neither...nor" constructions, the verb agrees with the subject closest to it. Since "teacher" (singular) is closest to the verb, we use "was" (singular verb form).',
      order_index: 4,
      category: 'grammar',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      created_by: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1'
    },
    {
      id: '5',
      exam_id: '2',
      question_text: 'What does the word "ubiquitous" mean in the following sentence?\n\n"Smartphones have become ubiquitous in modern society, found in the hands of people across all age groups and socioeconomic backgrounds."',
      option_a: 'Expensive and exclusive',
      option_b: 'Present, appearing, or found everywhere',
      option_c: 'Difficult to use and understand',
      option_d: 'Rapidly changing and evolving',
      option_e: 'Connected to the internet',
      correct_answer: 'B',
      explanation: 'The context clue "found in the hands of people across all age groups and socioeconomic backgrounds" indicates that ubiquitous means widespread or present everywhere.',
      order_index: 1,
      category: 'vocabulary',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      created_by: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1'
    },
    {
      id: '6',
      exam_id: '2',
      question_text: 'Complete the sentence with the most appropriate phrase:\n\n"The research findings were so compelling that _____ the scientific community had to reconsider long-held theories."',
      option_a: 'even',
      option_b: 'although',
      option_c: 'despite',
      option_d: 'unless',
      option_e: 'whenever',
      correct_answer: 'A',
      explanation: '"Even" is used to emphasize something surprising or extreme. The sentence suggests that the findings were so compelling that they forced reconsideration, which is an extreme result.',
      order_index: 2,
      category: 'grammar',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      created_by: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1'
    }
  ],
  'exams': [
    {
      id: '1',
      title: 'YDS Deneme Sınavı 1',
      description: 'Reading ve Grammar sorularından oluşan kapsamlı deneme sınavı',
      total_questions: 4,
      duration_minutes: 60,
      is_active: true,
      created_at: new Date().toISOString(),
      created_by: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1'
    },
    {
      id: '2',
      title: 'YDS Deneme Sınavı 2',
      description: 'Vocabulary ve Grammar odaklı kısa sınav',
      total_questions: 2,
      duration_minutes: 30,
      is_active: true,
      created_at: new Date().toISOString(),
      created_by: '8SL2Eq5KcvZQnhmJxeI8hrD9Epv1'
    }
  ],
  'topics': [
    {
      id: '1',
      title: 'Reading Comprehension',
      description: 'Okuma anlama stratejileri ve teknikleri',
      content: `## Reading Comprehension Strategies

### 1. Skimming ve Scanning
Metni hızlıca gözden geçirerek ana fikri bulma (skimming) ve belirli bilgileri arama (scanning) teknikleri YDS'de kritik öneme sahiptir.

### 2. Context Clues
Bilinmeyen kelimelerin anlamını bağlamdan çıkarma yeteneği, YDS okuma sorularında başarının anahtarıdır.

### 3. Main Idea Identification
Her paragrafın ana fikrini belirleme ve metnin genel mesajını anlama becerileri üzerinde çalışın.

### 4. Inference Skills
Metinde doğrudan verilmeyen bilgileri çıkarımsama yeteneğini geliştirin.

### 5. Time Management
YDS'de zaman yönetimi kritiktir. Her soruya ortalama 2-3 dakika ayırmalısınız.`,
      category: 'reading',
      order: 1,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Grammar Essentials',
      description: 'Temel dilbilgisi kuralları',
      content: `## Essential Grammar Topics for YDS

### 1. Tense Usage
- Present Perfect vs Simple Past
- Future Continuous and Future Perfect
- Past Perfect Continuous usage

### 2. Conditional Sentences
- Type 0, 1, 2, 3 conditionals
- Mixed conditionals
- Unless, provided that, as long as

### 3. Relative Clauses
- Defining and non-defining relative clauses
- Reduced relative clauses
- Relative pronouns: who, which, whose, whom

### 4. Modal Verbs
- Ability, possibility, necessity
- Perfect modals (must have, could have, etc.)
- Modal-like expressions

### 5. Passive Voice
- All tenses in passive form
- Causative structures (have something done)
- Passive with modals`,
      category: 'grammar',
      order: 2,
      is_active: true,
      created_at: new Date().toISOString()
    }
  ],
  'exam_results': [
    {
      id: 'result-1',
      student_id: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1',
      exam_id: '1',
      score: 85,
      correct_count: 68,
      wrong_count: 10,
      empty_count: 2,
      answers: {
        '1': 'A',
        '2': 'C',
        '3': 'B',
        '4': 'D'
      },
      started_at: new Date('2025-09-25T10:00:00').toISOString(),
      completed_at: new Date('2025-09-25T13:00:00').toISOString()
    },
    {
      id: 'result-2',
      student_id: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1',
      exam_id: '2',
      score: 72,
      correct_count: 43,
      wrong_count: 15,
      empty_count: 2,
      answers: {
        '1': 'B',
        '2': 'A',
        '3': 'C'
      },
      started_at: new Date('2025-09-23T14:00:00').toISOString(),
      completed_at: new Date('2025-09-23T16:00:00').toISOString()
    },
    {
      id: 'result-3',
      student_id: 'student-123',
      exam_id: '1',
      score: 65,
      correct_count: 52,
      wrong_count: 20,
      empty_count: 8,
      answers: {
        '1': 'C',
        '2': 'B',
        '3': 'A'
      },
      started_at: new Date('2025-09-22T09:00:00').toISOString(),
      completed_at: new Date('2025-09-22T12:00:00').toISOString()
    }
  ],
  'study_goals': [
    {
      id: 'goal-1',
      student_id: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1',
      title: 'Haftalık 3 Sınav Hedefi',
      description: 'Her hafta en az 3 deneme sınavı çözmek',
      target_type: 'weekly_exams',
      target_value: 3,
      current_value: 2,
      deadline: new Date('2025-10-01').toISOString(),
      is_completed: false,
      created_at: new Date('2025-09-20').toISOString(),
      updated_at: new Date('2025-09-27').toISOString()
    },
    {
      id: 'goal-2',
      student_id: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1',
      title: 'YDS Hedef Puanı: 85',
      description: 'YDS sınavında 85 puan almayı hedefliyorum',
      target_type: 'target_score',
      target_value: 85,
      current_value: 78,
      deadline: new Date('2025-12-01').toISOString(),
      is_completed: false,
      created_at: new Date('2025-09-15').toISOString(),
      updated_at: new Date('2025-09-27').toISOString()
    }
  ],
  'study_reminders': [
    {
      id: 'reminder-1',
      student_id: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1',
      title: 'Günlük Çalışma Hatırlatması',
      message: 'Bugünkü çalışma seansınızı yapmayı unutmayın!',
      reminder_type: 'daily',
      reminder_time: '20:00',
      days_of_week: [1, 2, 3, 4, 5],
      is_active: true,
      created_at: new Date('2025-09-20').toISOString()
    },
    {
      id: 'reminder-2',
      student_id: '8SL2Eq5KcvZQnhmJxeI8hrD9Epv1',
      title: 'Haftalık Sınav Hatırlatması',
      message: 'Bu hafta henüz sınav çözmediniz. Bir deneme sınavı çözmeyi unutmayın!',
      reminder_type: 'weekly',
      reminder_time: '10:00',
      days_of_week: [1],
      is_active: true,
      created_at: new Date('2025-09-20').toISOString()
    }
  ]
}

// Properly awaitable demo query builder that matches Supabase API
class DemoQueryBuilder {
  private tableName: string
  private selectColumns: string = '*'
  private whereConditions: Array<{field: string, value: any}> = []
  private orderField: string | null = null
  private orderDirection: 'asc' | 'desc' = 'desc'
  private queryType: 'select' | 'single' = 'select'

  constructor(tableName: string) {
    this.tableName = tableName
    console.log(`🏗️ Demo query builder for: ${tableName}`)
  }

  select(columns: string = '*') {
    this.selectColumns = columns
    this.queryType = 'select'
    return this
  }

  eq(column: string, value: any) {
    console.log(`🔍 Adding where condition: ${column} = ${value}`)
    this.whereConditions.push({field: column, value})
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderField = column
    this.orderDirection = options?.ascending ? 'asc' : 'desc'
    return this
  }

  single() {
    this.queryType = 'single'
    return this
  }

  // Make this object awaitable by implementing then/catch methods
  then(onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any) {
    return this.execute().then(onFulfilled, onRejected)
  }

  catch(onRejected?: (reason: any) => any) {
    return this.execute().catch(onRejected)
  }

  finally(onFinally?: () => void) {
    return this.execute().finally(onFinally)
  }

  private async execute() {
    console.log(`🔍 Demo executing ${this.queryType} query for ${this.tableName} with conditions:`, this.whereConditions)

    // Simulate small delay like real API
    await new Promise(resolve => setTimeout(resolve, 50))

    let data = [...(ADMIN_DEMO_DATA[this.tableName] || [])]

    // Apply where conditions
    for (const condition of this.whereConditions) {
      data = data.filter(item => item[condition.field] === condition.value)
    }

    // Apply ordering
    if (this.orderField) {
      data.sort((a, b) => {
        const aVal = a[this.orderField!]
        const bVal = b[this.orderField!]

        if (this.orderField === 'created_at' || this.orderField === 'updated_at') {
          const aTime = new Date(aVal).getTime()
          const bTime = new Date(bVal).getTime()
          return this.orderDirection === 'desc' ? bTime - aTime : aTime - bTime
        }

        if (aVal < bVal) return this.orderDirection === 'desc' ? 1 : -1
        if (aVal > bVal) return this.orderDirection === 'desc' ? -1 : 1
        return 0
      })
    }

    const result = this.queryType === 'single' ? (data[0] || null) : data

    console.log(`✅ Demo query result for ${this.tableName}:`, result)

    return {
      data: result,
      error: null
    }
  }

  // UPDATE functionality
  update(updates: any) {
    return {
      eq: async (field: string, value: any) => {
        console.log(`🔄 Demo UPDATE for ${this.tableName} where ${field} = ${value}`, updates)

        // Simulate small delay
        await new Promise(resolve => setTimeout(resolve, 100))

        const data = ADMIN_DEMO_DATA[this.tableName] || []
        let updated = false

        for (let i = 0; i < data.length; i++) {
          if (data[i][field] === value) {
            // Update the item
            data[i] = { ...data[i], ...updates, updated_at: new Date().toISOString() }
            updated = true
            console.log(`✅ Updated item in ${this.tableName}:`, data[i])
            break
          }
        }

        if (!updated) {
          console.log(`❌ No item found to update in ${this.tableName} where ${field} = ${value}`)
          return { data: null, error: { message: 'No item found to update' } }
        }

        return { data: null, error: null }
      }
    }
  }

  // DELETE functionality
  delete() {
    return {
      eq: async (field: string, value: any) => {
        console.log(`🗑️ Demo DELETE from ${this.tableName} where ${field} = ${value}`)

        // Simulate small delay
        await new Promise(resolve => setTimeout(resolve, 100))

        const data = ADMIN_DEMO_DATA[this.tableName] || []
        const initialLength = data.length

        // Remove items that match the condition
        const newData = data.filter(item => item[field] !== value)
        ADMIN_DEMO_DATA[this.tableName] = newData

        const deletedCount = initialLength - newData.length
        console.log(`✅ Deleted ${deletedCount} items from ${this.tableName}`)

        if (deletedCount === 0) {
          return { data: null, error: { message: 'No item found to delete' } }
        }

        return { data: null, error: null }
      }
    }
  }

  // INSERT functionality
  insert(newData: any | any[]) {
    return {
      select: async () => {
        console.log(`➕ Demo INSERT into ${this.tableName}`, newData)

        // Simulate small delay
        await new Promise(resolve => setTimeout(resolve, 100))

        // Initialize table data if not exists
        if (!ADMIN_DEMO_DATA[this.tableName]) {
          ADMIN_DEMO_DATA[this.tableName] = []
        }

        const data = ADMIN_DEMO_DATA[this.tableName]
        const itemsToInsert = Array.isArray(newData) ? newData : [newData]
        const insertedItems = []

        for (const item of itemsToInsert) {
          // Generate a unique ID if not provided
          const newItem = {
            id: item.id || `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...item,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString()
          }

          data.push(newItem)
          insertedItems.push(newItem)
          console.log(`✅ Inserted item into ${this.tableName}:`, newItem)
        }

        return {
          data: Array.isArray(newData) ? insertedItems : insertedItems[0],
          error: null
        }
      }
    }
  }
}

// Demo auth for compatibility
const demoAuth = {
  signInWithPassword: async ({ email, password }: any) => {
    // Import real Firebase auth for actual login
    const { supabase: firebaseSupabase } = await import('./firebase-client-simple')
    return firebaseSupabase.auth.signInWithPassword({ email, password })
  },

  signUp: async (params: any) => {
    const { supabase: firebaseSupabase } = await import('./firebase-client-simple')
    return firebaseSupabase.auth.signUp(params)
  },

  signOut: async () => {
    const { supabase: firebaseSupabase } = await import('./firebase-client-simple')
    return firebaseSupabase.auth.signOut()
  },

  getUser: async () => {
    const { supabase: firebaseSupabase } = await import('./firebase-client-simple')
    return firebaseSupabase.auth.getUser()
  }
}

// Demo supabase client
export const supabase = {
  auth: demoAuth,
  
  from: (tableName: string) => {
    return new DemoQueryBuilder(tableName)
  }
}
