// Demo data for testing without Supabase
import { Topic, Exam, Question, ExamResult, TutorQuestion, Profile, BookmarkedTopic, StudyGoal, StudyReminder } from '@/types'

// Demo users
export const demoProfiles: Profile[] = [
  {
    id: 'student-1',
    email: 'student@demo.com',
    full_name: 'Ahmet Yılmaz',
    role: 'student',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'admin-1', 
    email: 'admin@demo.com',
    full_name: 'Dr. Elif Kaya',
    role: 'admin',
    created_at: '2024-01-01T09:00:00Z'
  }
]

// Demo topics
export const demoTopics: Topic[] = [
  {
    id: 'topic-1',
    title: 'Present Tenses',
    slug: 'present-tenses',
    content: `# Present Tenses

Present tense İngilizce'de şimdiki zamanı ifade etmek için kullanılır. İki ana türü vardır:

## Present Simple (Geniş Zaman)

Present Simple, **düzenli olarak tekrarlanan eylemler** ve **genel gerçekler** için kullanılır.

### Yapısı:
- **Olumlu**: Subject + Verb (+ s/es for 3rd person)
- **Olumsuz**: Subject + do/does + not + Verb
- **Soru**: Do/Does + Subject + Verb?

### Örnekler:
- I **study** English every day. (Her gün İngilizce çalışırım.)
- She **works** at a hospital. (Hastanede çalışır.)
- They **don't** like coffee. (Kahve sevmezler.)

## Present Continuous (Şimdiki Zaman)

Present Continuous, **şu anda devam eden** eylemler için kullanılır.

### Yapısı:
- **Olumlu**: Subject + am/is/are + Verb-ing
- **Olumsuz**: Subject + am/is/are + not + Verb-ing  
- **Soru**: Am/Is/Are + Subject + Verb-ing?

### Örnekler:
- I **am studying** now. (Şu anda çalışıyorum.)
- She **is working** today. (Bugün çalışıyor.)
- They **are not watching** TV. (TV seyretmiyorlar.)

> **İpucu**: Present Continuous ile kullanılan zaman ifadeleri: now, at the moment, today, this week, currently`,
    order_index: 1,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'topic-2', 
    title: 'Past Tenses',
    slug: 'past-tenses',
    content: `# Past Tenses

Past tense geçmiş zamanı ifade etmek için kullanılır. Temel türleri:

## Past Simple (Geçmiş Zaman)

**Geçmişte tamamlanmış** eylemler için kullanılır.

### Yapısı:
- **Düzenli fiiller**: Verb + -ed
- **Düzensiz fiiller**: 2. hali kullanılır
- **Olumsuz**: Subject + did + not + Verb
- **Soru**: Did + Subject + Verb?

### Örnekler:
- I **visited** Paris last year. (Geçen yıl Paris'i ziyaret ettim.)
- She **didn't** come yesterday. (Dün gelmedi.)
- **Did** you **finish** your homework? (Ödevini bitirdin mi?)

## Past Continuous (Geçmiş Sürekli Zaman)

**Geçmişte belirli bir anda devam eden** eylemler için kullanılır.

### Yapısı:
- Subject + was/were + Verb-ing

### Örnekler:
- I **was studying** when you called. (Sen aradığında çalışıyordum.)
- They **were playing** football at 3 PM. (Saat 3'te futbol oynuyorlardı.)`,
    order_index: 2,
    created_at: '2024-01-12T11:00:00Z',
    updated_at: '2024-01-16T09:15:00Z'
  },
  {
    id: 'topic-3',
    title: 'Reading Comprehension Strategies', 
    slug: 'reading-comprehension-strategies',
    content: `# Reading Comprehension Strategies

YDS'de başarılı olmak için etkili okuma stratejilerini öğrenmek çok önemlidir.

## 1. Skimming (Hızlı Okuma)

Metnin **genel konusunu** anlamak için kullanılır.

### Teknik:
- Başlığı, alt başlıkları okuyun
- İlk ve son paragrafları okuyun  
- Her paragrafın ilk cümlesine bakın
- Anahtar kelimeleri tespit edin

## 2. Scanning (Tarama)

**Belirli bir bilgiyi** bulmak için kullanılır.

### Teknik:
- Soruda aranan kelimeyi tespit edin
- Metinde o kelimeyi arayın
- Kelime çevresindeki cümleleri okuyun
- Cevabı bulun

## 3. Detailed Reading (Detaylı Okuma)

**Derinlemesine anlama** için kullanılır.

### Teknik:
- Her cümleyi dikkatli okuyun
- Bilinmeyen kelimeleri bağlamdan anlamaya çalışın
- Paragraflar arası bağlantıları kurun
- Ana fikir ve destekleyici detayları ayırt edin

> **YDS İpucu**: Önce soruları okuyun, sonra metni okumaya başlayın. Bu şekilde neyi aradığınızı bilirsiniz.`,
    order_index: 3,
    created_at: '2024-01-14T16:00:00Z',
    updated_at: '2024-01-18T13:45:00Z'
  }
]

// Demo exams
export const demoExams: Exam[] = [
  {
    id: 'exam-1',
    title: 'YDS Genel Deneme Sınavı 1',
    description: 'Genel seviye YDS deneme sınavı - Grammar ve Vocabulary ağırlıklı',
    topic_id: 'topic-1',
    duration_minutes: 180,
    total_questions: 10,
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: 'exam-2', 
    title: 'Reading Comprehension Test',
    description: 'Okuduğunu anlama becerinizi test edin',
    topic_id: 'topic-3',
    duration_minutes: 120,
    total_questions: 8,
    created_at: '2024-01-25T14:00:00Z'
  },
  {
    id: 'exam-3',
    title: 'Grammar Focus: Tenses',
    description: 'Present ve Past tense konularına odaklanan sınav',
    topic_id: 'topic-2', 
    duration_minutes: 90,
    total_questions: 6,
    created_at: '2024-01-28T09:00:00Z'
  }
]

// Demo questions for exam-1
export const demoQuestions: Question[] = [
  {
    id: 'q-1',
    exam_id: 'exam-1',
    question_text: 'She _______ to work by bus every morning.',
    option_a: 'go',
    option_b: 'goes', 
    option_c: 'going',
    option_d: 'gone',
    option_e: 'went',
    correct_answer: 'B',
    explanation: 'Present Simple tense\'de 3. tekil şahıs (she) için fiile "-s" eki getirilir. "Every morning" düzenli tekrar belirten ifade olduğu için Present Simple kullanılır.',
    order_index: 1
  },
  {
    id: 'q-2', 
    exam_id: 'exam-1',
    question_text: 'I _______ my homework when you called me yesterday.',
    option_a: 'do',
    option_b: 'did',
    option_c: 'was doing',
    option_d: 'have done',
    option_e: 'had done',
    correct_answer: 'C',
    explanation: 'Geçmişte belirli bir anda devam eden eylem için Past Continuous (was/were + V-ing) kullanılır. "When you called" ifadesi belirli bir anı gösterir.',
    order_index: 2
  },
  {
    id: 'q-3',
    exam_id: 'exam-1', 
    question_text: 'Choose the correct meaning of "prevalent": The disease is prevalent in tropical regions.',
    option_a: 'rare',
    option_b: 'dangerous',
    option_c: 'widespread', 
    option_d: 'unknown',
    option_e: 'curable',
    correct_answer: 'C',
    explanation: '"Prevalent" yaygın, hâkim anlamına gelir. Cümlede "tropikal bölgelerde yaygın" anlamında kullanılmıştır. "Widespread" (yaygın) ile aynı anlamdır.',
    order_index: 3
  },
  {
    id: 'q-4',
    exam_id: 'exam-1',
    question_text: 'They _______ English for three years before they moved to London.',
    option_a: 'study',
    option_b: 'studied',
    option_c: 'were studying', 
    option_d: 'had studied',
    option_e: 'have studied',
    correct_answer: 'D',
    explanation: 'Geçmişte iki olay varsa, önce gerçekleşen olay için Past Perfect (had + V3) kullanılır. İngilizce öğrenmek, Londra\'ya taşınmadan önce gerçekleşmiştir.',
    order_index: 4
  },
  {
    id: 'q-5',
    exam_id: 'exam-1',
    question_text: 'Which sentence is grammatically correct?',
    option_a: 'He don\'t like coffee.',
    option_b: 'She are studying now.',
    option_c: 'They doesn\'t work here.',
    option_d: 'We don\'t have time.',
    option_e: 'I doesn\'t understand.',
    correct_answer: 'D', 
    explanation: 'D seçeneği doğru. "We" (biz) için "don\'t" kullanılır. Diğer seçeneklerde özne-yardımcı fiil uyumsuzlukları vardır.',
    order_index: 5
  },
  {
    id: 'q-6',
    exam_id: 'exam-1',
    question_text: '_______ is essential for language learning.',
    option_a: 'Practice',
    option_b: 'Practicing',
    option_c: 'To practice',
    option_d: 'Practiced', 
    option_e: 'Practices',
    correct_answer: 'A',
    explanation: 'Cümlenin öznesi olarak gerund (V-ing) kullanılabilir ama burada "practice" isim olarak kullanılmış. "Practice" (pratik/alıştırma) daha uygun.',
    order_index: 6
  },
  {
    id: 'q-7',
    exam_id: 'exam-1', 
    question_text: 'The meeting _______ at 9 AM tomorrow.',
    option_a: 'start',
    option_b: 'starts',
    option_c: 'starting',
    option_d: 'started',
    option_e: 'will start',
    correct_answer: 'B',
    explanation: 'Programlanmış gelecek olaylar için Present Simple kullanılabilir. "Tomorrow" gelecek zaman belirtse de sabit program/takvim için Present Simple tercih edilir.',
    order_index: 7
  },
  {
    id: 'q-8',
    exam_id: 'exam-1',
    question_text: 'Choose the synonym of "comprehensive": The report provides a comprehensive analysis.',
    option_a: 'brief',
    option_b: 'incomplete', 
    option_c: 'thorough',
    option_d: 'partial',
    option_e: 'shallow',
    correct_answer: 'C',
    explanation: '"Comprehensive" kapsamlı, eksiksiz anlamına gelir. "Thorough" (detaylı, kapsamlı) ile aynı anlamdır.',
    order_index: 8
  },
  {
    id: 'q-9', 
    exam_id: 'exam-1',
    question_text: 'If I _______ enough money, I would travel around the world.',
    option_a: 'have',
    option_b: 'had',
    option_c: 'will have',
    option_d: 'would have',
    option_e: 'having',
    correct_answer: 'B',
    explanation: 'Type 2 Conditional (gerçek olmayan durum) yapısı: If + Past Simple, would + V1. Bu yapıda "had" kullanılır.',
    order_index: 9
  },
  {
    id: 'q-10',
    exam_id: 'exam-1',
    question_text: 'She asked me _______ I could help her with the project.',
    option_a: 'that',
    option_b: 'if', 
    option_c: 'what',
    option_d: 'when',
    option_e: 'why',
    correct_answer: 'B',
    explanation: 'Reported questions (dolaylı sorular) yes/no soruları için "if" veya "whether" kullanılır. Burada "if" uygun.',
    order_index: 10
  },

  // Exam 2 Questions - Reading Comprehension
  {
    id: 'q-11',
    exam_id: 'exam-2',
    question_text: 'Read the passage and answer the question:\n\n"Climate change represents one of the most significant challenges facing humanity in the 21st century. Rising global temperatures, caused primarily by increased greenhouse gas emissions, are leading to more frequent extreme weather events, rising sea levels, and shifts in agricultural patterns. Scientists worldwide agree that immediate action is required to mitigate these effects."\n\nWhat is the main cause of climate change according to the passage?',
    option_a: 'Extreme weather events',
    option_b: 'Rising sea levels',
    option_c: 'Increased greenhouse gas emissions',
    option_d: 'Agricultural pattern shifts',
    option_e: 'Scientific research',
    correct_answer: 'C',
    explanation: 'Metinde "Rising global temperatures, caused primarily by increased greenhouse gas emissions" ifadesi ana nedeni açıkça belirtmektedir.',
    order_index: 1
  },
  {
    id: 'q-12',
    exam_id: 'exam-2',
    question_text: 'Choose the word that best completes the sentence: The new policy will have a _______ impact on the company\'s future growth.',
    option_a: 'negligible',
    option_b: 'profound',
    option_c: 'temporary',
    option_d: 'questionable',
    option_e: 'limited',
    correct_answer: 'B',
    explanation: 'Bağlamda şirketin gelecekteki büyümesi üzerinde etkili bir politikadan bahsediliyor. "Profound" (derin, köklü) en uygun seçenektir.',
    order_index: 2
  },
  {
    id: 'q-13',
    exam_id: 'exam-2',
    question_text: 'The author\'s primary purpose in the passage about renewable energy is to:',
    option_a: 'criticize current energy policies',
    option_b: 'explain technical processes',
    option_c: 'advocate for sustainable solutions',
    option_d: 'compare different energy sources',
    option_e: 'predict future developments',
    correct_answer: 'C',
    explanation: 'Yenilenebilir enerji hakkındaki metinlerde genellikle sürdürülebilir çözümleri savunan bir yaklaşım benimser.',
    order_index: 3
  },
  {
    id: 'q-14',
    exam_id: 'exam-2',
    question_text: 'Which of the following is NOT mentioned as a consequence of climate change?',
    option_a: 'More frequent extreme weather',
    option_b: 'Rising sea levels',
    option_c: 'Agricultural shifts',
    option_d: 'Economic recession',
    option_e: 'Temperature increases',
    correct_answer: 'D',
    explanation: 'Metinde ekonomik durgunluk (economic recession) iklim değişikliğinin bir sonucu olarak belirtilmemiştir.',
    order_index: 4
  },
  {
    id: 'q-15',
    exam_id: 'exam-2',
    question_text: 'The word "mitigate" in the context means:',
    option_a: 'to increase',
    option_b: 'to ignore',
    option_c: 'to reduce',
    option_d: 'to study',
    option_e: 'to prevent',
    correct_answer: 'C',
    explanation: '"Mitigate" hafifletmek, azaltmak anlamına gelir. Olumsuz etkileri azaltmak için eylem gerektiği bağlamında kullanılmıştır.',
    order_index: 5
  },
  {
    id: 'q-16',
    exam_id: 'exam-2',
    question_text: 'Based on the passage, scientists\' attitude toward climate action can be described as:',
    option_a: 'optimistic',
    option_b: 'uncertain',
    option_c: 'urgent',
    option_d: 'indifferent',
    option_e: 'skeptical',
    correct_answer: 'C',
    explanation: '"Immediate action is required" ifadesi bilim insanlarının acil eylem gerektiği konusundaki tutumunu gösterir.',
    order_index: 6
  },
  {
    id: 'q-17',
    exam_id: 'exam-2',
    question_text: 'The passage suggests that climate change affects:',
    option_a: 'only coastal areas',
    option_b: 'primarily developing countries',
    option_c: 'various aspects of life',
    option_d: 'mainly agricultural regions',
    option_e: 'only future generations',
    correct_answer: 'C',
    explanation: 'Metin hava olayları, deniz seviyesi, tarım gibi yaşamın çeşitli alanlarına etki ettiğini belirtir.',
    order_index: 7
  },
  {
    id: 'q-18',
    exam_id: 'exam-2',
    question_text: 'The tone of the passage about climate change is:',
    option_a: 'alarmist',
    option_b: 'informative',
    option_c: 'promotional',
    option_d: 'critical',
    option_e: 'humorous',
    correct_answer: 'B',
    explanation: 'Metin iklim değişikliği hakkında objektif bilgiler sunarak bilgilendirici bir ton kullanır.',
    order_index: 8
  },

  // Exam 3 Questions - Grammar Focus
  {
    id: 'q-19',
    exam_id: 'exam-3',
    question_text: 'By the time you arrive, we _______ dinner.',
    option_a: 'will finish',
    option_b: 'will have finished',
    option_c: 'are finishing',
    option_d: 'finished',
    option_e: 'have finished',
    correct_answer: 'B',
    explanation: '"By the time" ifadesi Future Perfect Tense gerektirir. Gelecekte belirli bir zamanda tamamlanmış olacak eylemi ifade eder.',
    order_index: 1
  },
  {
    id: 'q-20',
    exam_id: 'exam-3',
    question_text: 'I wish I _______ more time to study for the exam.',
    option_a: 'have',
    option_b: 'had',
    option_c: 'will have',
    option_d: 'would have',
    option_e: 'am having',
    correct_answer: 'B',
    explanation: '"I wish" yapısından sonra şimdiki zamanda gerçekleşmesi mümkün olmayan durumlar için Past Simple kullanılır.',
    order_index: 2
  },
  {
    id: 'q-21',
    exam_id: 'exam-3',
    question_text: 'The book _______ by millions of people worldwide.',
    option_a: 'has read',
    option_b: 'has been read',
    option_c: 'is reading',
    option_d: 'reads',
    option_e: 'was reading',
    correct_answer: 'B',
    explanation: 'Passive Voice yapısı gerekir. Present Perfect Passive: has/have + been + V3. Kitap okunur (edilgen), kendisi okumaz.',
    order_index: 3
  },
  {
    id: 'q-22',
    exam_id: 'exam-3',
    question_text: 'Neither John nor his brothers _______ coming to the party.',
    option_a: 'is',
    option_b: 'are',
    option_c: 'was',
    option_d: 'were',
    option_e: 'been',
    correct_answer: 'B',
    explanation: '"Neither...nor" yapısında fiil, "nor"dan sonraki özneye göre çekimlenir. "Brothers" çoğul olduğu için "are" kullanılır.',
    order_index: 4
  },
  {
    id: 'q-23',
    exam_id: 'exam-3',
    question_text: 'He would have passed the test if he _______ harder.',
    option_a: 'studied',
    option_b: 'had studied',
    option_c: 'studies',
    option_d: 'was studying',
    option_e: 'would study',
    correct_answer: 'B',
    explanation: 'Type 3 Conditional yapısı: If + Past Perfect, would have + V3. Geçmişte gerçekleşmemiş durumu ifade eder.',
    order_index: 5
  },
  {
    id: 'q-24',
    exam_id: 'exam-3',
    question_text: 'The students were made _______ their homework before leaving.',
    option_a: 'finish',
    option_b: 'to finish',
    option_c: 'finishing',
    option_d: 'finished',
    option_e: 'finishes',
    correct_answer: 'B',
    explanation: '"Be made to do" yapısı kullanılır. Passive yapıda "make" fiilinden sonra "to" infinitive gelir.',
    order_index: 6
  }
]

// Demo exam results
export const demoExamResults: ExamResult[] = [
  {
    id: 'result-1',
    student_id: 'student-1',
    exam_id: 'exam-1', 
    score: 85,
    correct_count: 8,
    wrong_count: 2,
    empty_count: 0,
    answers: {
      'q-1': 'B',
      'q-2': 'C', 
      'q-3': 'C',
      'q-4': 'D',
      'q-5': 'A', // wrong
      'q-6': 'A',
      'q-7': 'B',
      'q-8': 'C',
      'q-9': 'A', // wrong
      'q-10': 'B'
    },
    started_at: '2024-02-01T10:00:00Z',
    completed_at: '2024-02-01T12:30:00Z'
  },
  {
    id: 'result-2',
    student_id: 'student-1',
    exam_id: 'exam-2',
    score: 75,
    correct_count: 6,
    wrong_count: 2, 
    empty_count: 0,
    answers: {},
    started_at: '2024-02-03T14:00:00Z', 
    completed_at: '2024-02-03T16:00:00Z'
  },
  {
    id: 'result-3',
    student_id: 'student-1',
    exam_id: 'exam-3',
    score: 90,
    correct_count: 5,
    wrong_count: 1,
    empty_count: 0,
    answers: {},
    started_at: '2024-02-05T09:00:00Z',
    completed_at: '2024-02-05T10:30:00Z'
  }
]

// Demo tutor questions
export const demoTutorQuestions: TutorQuestion[] = [
  {
    id: 'tq-1',
    student_id: 'student-1',
    question_text: 'Present Perfect ile Past Simple arasındaki farkı tam olarak anlayamadım. Özellikle "for" ve "since" kullanımında karışıklık yaşıyorum. Detaylı açıklayabilir misiniz?',
    status: 'answered',
    admin_response: `Mükemmel bir soru! Bu ikisi arasındaki fark gerçekten önemli:

**Present Perfect:**
- Geçmişte başlayıp şimdi devam eden durumlar
- "For" + süre (for 3 years) 
- "Since" + başlangıç noktası (since 2020)
- Örnek: "I have lived here for 5 years."

**Past Simple:**
- Geçmişte tamamlanmış eylemler
- Belirli zaman ifadeleri (yesterday, last week)
- Örnek: "I lived in Istanbul for 2 years." (artık orada yaşamıyorum)

Özetle: Present Perfect = geçmiş + şimdi bağlantısı
Past Simple = sadece geçmiş`,
    created_at: '2024-02-02T15:30:00Z',
    answered_at: '2024-02-02T16:45:00Z'
  },
  {
    id: 'tq-2', 
    student_id: 'student-1',
    question_text: 'YDS sınavında zaman yönetimi konusunda sıkıntı yaşıyorum. Reading kısmında çok fazla zaman harcıyorum. Ne önerirsiniz?',
    status: 'pending',
    created_at: '2024-02-06T11:20:00Z'
  }
]

// Demo bookmarked topics
export const demoBookmarkedTopics: BookmarkedTopic[] = [
  {
    id: 'bookmark-1',
    student_id: 'student-1',
    topic_id: 'topic-1',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'bookmark-2', 
    student_id: 'student-1',
    topic_id: 'topic-3',
    created_at: '2024-01-20T14:30:00Z'
  }
]

// Demo study goals
export const demoStudyGoals: StudyGoal[] = [
  {
    id: 'goal-1',
    student_id: 'student-1',
    title: 'Haftada 3 Sınav Çöz',
    description: 'Her hafta en az 3 deneme sınavı çözerek pratik yapmak',
    target_type: 'weekly_exams',
    target_value: 3,
    current_value: 1,
    deadline: '2024-12-31T23:59:59Z',
    is_completed: false,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 'goal-2',
    student_id: 'student-1', 
    title: 'YDS Hedef Puan: 85',
    description: 'YDS sınavından 85 puan almak',
    target_type: 'target_score',
    target_value: 85,
    current_value: 72,
    is_completed: false,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-20T16:45:00Z'
  },
  {
    id: 'goal-3',
    student_id: 'student-1',
    title: 'Günlük 30 Dakika Çalışma',
    description: 'Her gün en az 30 dakika YDS çalışması yapmak',
    target_type: 'daily_time',
    target_value: 30,
    current_value: 25,
    is_completed: false,
    created_at: '2024-01-05T09:00:00Z',
    updated_at: '2024-01-25T12:00:00Z'
  }
]

// Demo study reminders
export const demoStudyReminders: StudyReminder[] = [
  {
    id: 'reminder-1',
    student_id: 'student-1',
    title: 'Günlük Çalışma Hatırlatması',
    message: 'YDS çalışma zamanı! Günlük hedefinize ulaşmaya az kaldı.',
    reminder_type: 'daily',
    reminder_time: '19:00',
    days_of_week: [1, 2, 3, 4, 5], // Weekdays
    is_active: true,
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: 'reminder-2',
    student_id: 'student-1',
    title: 'Haftalık Sınav Hatırlatması',
    message: 'Bu hafta kaç sınav çözdünüz? Hedefinize ulaşmak için zaman daralıyor!',
    reminder_type: 'weekly',
    reminder_time: '10:00',
    days_of_week: [1], // Monday
    is_active: true,
    created_at: '2024-01-01T10:00:00Z'
  }
]

// Demo data store
export class DemoDataStore {
  private static instance: DemoDataStore
  private currentUser: Profile | null = null

  static getInstance(): DemoDataStore {
    if (!DemoDataStore.instance) {
      DemoDataStore.instance = new DemoDataStore()
    }
    return DemoDataStore.instance
  }

  // Auth methods
  async signIn(email: string): Promise<Profile | null> {
    const user = demoProfiles.find(p => p.email === email)
    if (user) {
      this.currentUser = user
      return user
    }
    return null
  }

  async signOut(): Promise<void> {
    this.currentUser = null
  }

  getCurrentUser(): Profile | null {
    return this.currentUser
  }

  // Data methods
  getTopics(): Topic[] {
    return demoTopics
  }

  getTopicBySlug(slug: string): Topic | null {
    return demoTopics.find(t => t.slug === slug) || null
  }

  getExams(): Exam[] {
    return demoExams
  }

  getExamById(id: string): Exam | null {
    return demoExams.find(e => e.id === id) || null
  }

  getQuestionsByExamId(examId: string): Question[] {
    return demoQuestions.filter(q => q.exam_id === examId)
  }

  getExamResults(studentId: string): ExamResult[] {
    return demoExamResults.filter(r => r.student_id === studentId)
  }

  getTutorQuestions(studentId: string): TutorQuestion[] {
    return demoTutorQuestions.filter(q => q.student_id === studentId)
  }

  // Mock async methods
  async createExamResult(result: Omit<ExamResult, 'id'>): Promise<ExamResult> {
    const newResult: ExamResult = {
      ...result,
      id: `result-${Date.now()}`
    }
    demoExamResults.push(newResult)
    return newResult
  }

  async createTutorQuestion(question: Omit<TutorQuestion, 'id'>): Promise<TutorQuestion> {
    const newQuestion: TutorQuestion = {
      ...question, 
      id: `tq-${Date.now()}`
    }
    demoTutorQuestions.push(newQuestion)
    return newQuestion
  }

  // Bookmark methods
  getBookmarkedTopics(studentId: string): BookmarkedTopic[] {
    return demoBookmarkedTopics.filter(b => b.student_id === studentId)
  }

  async createBookmark(bookmark: Omit<BookmarkedTopic, 'id'>): Promise<BookmarkedTopic> {
    const newBookmark: BookmarkedTopic = {
      ...bookmark,
      id: `bookmark-${Date.now()}`
    }
    demoBookmarkedTopics.push(newBookmark)
    return newBookmark
  }

  async deleteBookmark(studentId: string, topicId: string): Promise<void> {
    const index = demoBookmarkedTopics.findIndex(
      b => b.student_id === studentId && b.topic_id === topicId
    )
    if (index > -1) {
      demoBookmarkedTopics.splice(index, 1)
    }
  }

  isTopicBookmarked(studentId: string, topicId: string): boolean {
    return demoBookmarkedTopics.some(
      b => b.student_id === studentId && b.topic_id === topicId
    )
  }

  // Study Goals methods
  getStudyGoals(studentId: string): StudyGoal[] {
    return demoStudyGoals.filter(g => g.student_id === studentId)
  }

  async createStudyGoal(goal: Omit<StudyGoal, 'id'>): Promise<StudyGoal> {
    const newGoal: StudyGoal = {
      ...goal,
      id: `goal-${Date.now()}`
    }
    demoStudyGoals.push(newGoal)
    return newGoal
  }

  async updateStudyGoal(goalId: string, updates: Partial<StudyGoal>): Promise<StudyGoal | null> {
    const goalIndex = demoStudyGoals.findIndex(g => g.id === goalId)
    if (goalIndex > -1) {
      demoStudyGoals[goalIndex] = { ...demoStudyGoals[goalIndex], ...updates, updated_at: new Date().toISOString() }
      return demoStudyGoals[goalIndex]
    }
    return null
  }

  async deleteStudyGoal(goalId: string): Promise<void> {
    const index = demoStudyGoals.findIndex(g => g.id === goalId)
    if (index > -1) {
      demoStudyGoals.splice(index, 1)
    }
  }

  // Study Reminders methods
  getStudyReminders(studentId: string): StudyReminder[] {
    return demoStudyReminders.filter(r => r.student_id === studentId)
  }

  async createStudyReminder(reminder: Omit<StudyReminder, 'id'>): Promise<StudyReminder> {
    const newReminder: StudyReminder = {
      ...reminder,
      id: `reminder-${Date.now()}`
    }
    demoStudyReminders.push(newReminder)
    return newReminder
  }

  async updateStudyReminder(reminderId: string, updates: Partial<StudyReminder>): Promise<StudyReminder | null> {
    const reminderIndex = demoStudyReminders.findIndex(r => r.id === reminderId)
    if (reminderIndex > -1) {
      demoStudyReminders[reminderIndex] = { ...demoStudyReminders[reminderIndex], ...updates }
      return demoStudyReminders[reminderIndex]
    }
    return null
  }

  async deleteStudyReminder(reminderId: string): Promise<void> {
    const index = demoStudyReminders.findIndex(r => r.id === reminderId)
    if (index > -1) {
      demoStudyReminders.splice(index, 1)
    }
  }
}