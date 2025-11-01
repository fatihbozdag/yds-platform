'use client'

import { useState, useEffect } from 'react'
import { firebase } from '@/lib/firebase-client'

// Hierarchical Topic Structure
interface TopicCategory {
  id: string
  name: string
  description: string
  priority: 'A' | 'B' | 'C'
  order_index: number
  parent_id: string | null
  level: number
  children?: TopicCategory[]
  content?: string
  examples?: string[]
  exercises?: string[]
  is_expanded?: boolean
}

// YDS Curriculum Template
const YDS_CURRICULUM_TEMPLATE: TopicCategory[] = [
  {
    id: '1',
    name: 'Sınav Soru Tipleri ve Strateji',
    description: 'YDS sınav formatı, soru tipleri ve çözüm stratejileri',
    priority: 'A',
    order_index: 1,
    parent_id: null,
    level: 1,
    children: [
      {
        id: '1.1',
        name: 'A. Kelime ve Dilbilgisi (tek cümle soruları)',
        description: 'Context-based vocabulary ve grammar yapıları',
        priority: 'A',
        order_index: 1,
        parent_id: '1',
        level: 2,
        children: [
          { id: '1.1.1', name: 'Context-based vocabulary (bağlama göre anlam)', priority: 'A', order_index: 1, parent_id: '1.1', level: 3 },
          { id: '1.1.2', name: 'Eşanlam/karşıt anlam, yakın anlam ayrımları', priority: 'A', order_index: 2, parent_id: '1.1', level: 3 },
          { id: '1.1.3', name: 'Deyimsel kullanımlar, çok sözcüklü fiiller (phrasal verbs)', priority: 'A', order_index: 3, parent_id: '1.1', level: 3 },
          { id: '1.1.4', name: 'Sözcük türü/biçimbirim: ad, sıfat, zarf, fiil uyumu', priority: 'A', order_index: 4, parent_id: '1.1', level: 3 },
          { id: '1.1.5', name: 'Tense/Aspect uyumu, subject-verb agreement', priority: 'A', order_index: 5, parent_id: '1.1', level: 3 },
          { id: '1.1.6', name: 'Edatlar ve kalıplaşmış prepositional yapılar', priority: 'A', order_index: 6, parent_id: '1.1', level: 3 },
          { id: '1.1.7', name: 'Cümle içi tutarlılık: paralellik, uyum, zamir referansı', priority: 'A', order_index: 7, parent_id: '1.1', level: 3 }
        ]
      },
      {
        id: '1.2',
        name: 'B. Cümle Tamamlama',
        description: 'Mantıksal bağlar ve cümle yapısı',
        priority: 'A',
        order_index: 2,
        parent_id: '1',
        level: 2,
        children: [
          { id: '1.2.1', name: 'Mantıksal bağlar: sebep-sonuç, zıtlık, koşul, amaç', priority: 'A', order_index: 1, parent_id: '1.2', level: 3 },
          { id: '1.2.2', name: 'Bağlaç ailesi: although, however, therefore, as, if, unless', priority: 'A', order_index: 2, parent_id: '1.2', level: 3 },
          { id: '1.2.3', name: 'Bilgi yapısı: konu cümlesi, öncül-sonuç, örnekleme', priority: 'A', order_index: 3, parent_id: '1.2', level: 3 },
          { id: '1.2.4', name: 'Negasyon, kiplik (modality) ve olasılık işaretleri', priority: 'A', order_index: 4, parent_id: '1.2', level: 3 }
        ]
      },
      {
        id: '1.3',
        name: 'C. Anlamca En Yakın Cümle (Restatement)',
        description: 'Paraphrasing ve cümle dönüşümleri',
        priority: 'A',
        order_index: 3,
        parent_id: '1',
        level: 2,
        children: [
          { id: '1.3.1', name: 'Etken-edilgen dönüşümleri', priority: 'A', order_index: 1, parent_id: '1.3', level: 3 },
          { id: '1.3.2', name: 'Adlaştırma/yeniden ifade: that-clause, V-ing, nominalization', priority: 'A', order_index: 2, parent_id: '1.3', level: 3 },
          { id: '1.3.3', name: 'Zaman ve kip eşdeğerlikleri, olasılık dereceleri', priority: 'A', order_index: 3, parent_id: '1.3', level: 3 },
          { id: '1.3.4', name: 'Kapsam daraltma/genişletme, niceliklendiriciler', priority: 'A', order_index: 4, parent_id: '1.3', level: 3 },
          { id: '1.3.5', name: 'Çift olumsuz ve kapsam tuzakları', priority: 'A', order_index: 5, parent_id: '1.3', level: 3 }
        ]
      },
      {
        id: '1.4',
        name: 'D. Paragraf Tamamlama',
        description: 'Cohesion ve coherence',
        priority: 'A',
        order_index: 4,
        parent_id: '1',
        level: 2,
        children: [
          { id: '1.4.1', name: 'Uyum ve bağlaşıklık: işaretleyiciler, referans', priority: 'A', order_index: 1, parent_id: '1.4', level: 3 },
          { id: '1.4.2', name: 'Tutarlı konu gelişimi: konu cümlesi, destek, sonuç', priority: 'A', order_index: 2, parent_id: '1.4', level: 3 },
          { id: '1.4.3', name: 'Ton, tavır, değerlendirme ipuçları', priority: 'A', order_index: 3, parent_id: '1.4', level: 3 }
        ]
      },
      {
        id: '1.5',
        name: 'E. Diyalog Tamamlama',
        description: 'Spoken discourse ve pragmatics',
        priority: 'B',
        order_index: 5,
        parent_id: '1',
        level: 2,
        children: [
          { id: '1.5.1', name: 'Kayıt ve nezaket: resmi-yarı resmi-gündelik', priority: 'B', order_index: 1, parent_id: '1.5', level: 3 },
          { id: '1.5.2', name: 'Söylem kalıpları: öneri, rica, kabul-reddetme', priority: 'B', order_index: 2, parent_id: '1.5', level: 3 },
          { id: '1.5.3', name: 'Eşleşen komşu çiftler: soru-cevap, teklif-kabul', priority: 'B', order_index: 3, parent_id: '1.5', level: 3 }
        ]
      },
      {
        id: '1.6',
        name: 'F. Çeviri (EN→TR, TR→EN)',
        description: 'Translation strategies',
        priority: 'A',
        order_index: 6,
        parent_id: '1',
        level: 2,
        children: [
          { id: '1.6.1', name: 'Fiil zamanı/kip örtüşmeleri', priority: 'A', order_index: 1, parent_id: '1.6', level: 3 },
          { id: '1.6.2', name: 'Özne düşüklüğü ve adlaştırma', priority: 'A', order_index: 2, parent_id: '1.6', level: 3 },
          { id: '1.6.3', name: 'Edatlı yapılar ve light-verb karşılıkları', priority: 'A', order_index: 3, parent_id: '1.6', level: 3 },
          { id: '1.6.4', name: 'Belirtililik-belirsizlik ve artikel kullanımı', priority: 'A', order_index: 4, parent_id: '1.6', level: 3 },
          { id: '1.6.5', name: 'Sözdizimsel sıkışıklık ve bilgi akışı', priority: 'A', order_index: 5, parent_id: '1.6', level: 3 },
          { id: '1.6.6', name: 'Terminoloji: genel akademik kelime dağarcığı', priority: 'A', order_index: 6, parent_id: '1.6', level: 3 }
        ]
      },
      {
        id: '1.7',
        name: 'G. Okuduğunu Anlama (uzun parça)',
        description: 'Reading comprehension strategies',
        priority: 'A',
        order_index: 7,
        parent_id: '1',
        level: 2,
        children: [
          { id: '1.7.1', name: 'Ana fikir, çıkarım, ayrıntı, yazarın tutumu', priority: 'A', order_index: 1, parent_id: '1.7', level: 3 },
          { id: '1.7.2', name: 'Metin yapısı: problem-çözüm, sebep-sonuç, karşılaştırma', priority: 'A', order_index: 2, parent_id: '1.7', level: 3 },
          { id: '1.7.3', name: 'Söylem işaretleri üzerinden çözümleme', priority: 'A', order_index: 3, parent_id: '1.7', level: 3 },
          { id: '1.7.4', name: 'Zaman yönetimi ve öncelikli soru sırası', priority: 'A', order_index: 4, parent_id: '1.7', level: 3 }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Dilbilgisi ve Cümle Yapıları',
    description: 'Grammar konuları ve yapılar',
    priority: 'A',
    order_index: 2,
    parent_id: null,
    level: 1,
    children: [
      {
        id: '2.1',
        name: 'Zaman-Görünüş (Tense-Aspect)',
        priority: 'A',
        order_index: 1,
        parent_id: '2',
        level: 2,
        children: [
          { id: '2.1.1', name: 'Present/Past/Future simple vs. continuous vs. perfect', priority: 'A', order_index: 1, parent_id: '2.1', level: 3 },
          { id: '2.1.2', name: 'Durumsal uyum: zaman zarfları, sıralı olaylar', priority: 'A', order_index: 2, parent_id: '2.1', level: 3 },
          { id: '2.1.3', name: 'Aktarım: by the time, no sooner...than, hardly...when', priority: 'A', order_index: 3, parent_id: '2.1', level: 3 }
        ]
      },
      {
        id: '2.2',
        name: 'Kiplik ve Tutum (Modality)',
        priority: 'A',
        order_index: 2,
        parent_id: '2',
        level: 2,
        children: [
          { id: '2.2.1', name: 'Olasılık, zorunluluk, çıkarım: must/may/might/can\'t have V-ed', priority: 'A', order_index: 1, parent_id: '2.2', level: 3 },
          { id: '2.2.2', name: 'Öneri-eleştiri: should/ought to/had better, would rather', priority: 'A', order_index: 2, parent_id: '2.2', level: 3 },
          { id: '2.2.3', name: 'Karşı olgusal yorumlar ve edimsel değer', priority: 'A', order_index: 3, parent_id: '2.2', level: 3 }
        ]
      },
      {
        id: '2.3',
        name: 'Koşul Yapıları',
        priority: 'A',
        order_index: 3,
        parent_id: '2',
        level: 2,
        children: [
          { id: '2.3.1', name: 'Zero, Type 1-2-3, mixed conditionals', priority: 'A', order_index: 1, parent_id: '2.3', level: 3 },
          { id: '2.3.2', name: 'Inversion with conditionals: Had I known, Were it not for', priority: 'A', order_index: 2, parent_id: '2.3', level: 3 },
          { id: '2.3.3', name: 'Unless, provided/providing that, on condition that', priority: 'A', order_index: 3, parent_id: '2.3', level: 3 }
        ]
      },
      {
        id: '2.4',
        name: 'Edatlar ve Kalıplar',
        priority: 'A',
        order_index: 4,
        parent_id: '2',
        level: 2,
        children: [
          { id: '2.4.1', name: 'Preposition + noun/verb/adjective kalıpları', priority: 'A', order_index: 1, parent_id: '2.4', level: 3 },
          { id: '2.4.2', name: 'Zaman, yer, araç ve sebep edatları', priority: 'A', order_index: 2, parent_id: '2.4', level: 3 },
          { id: '2.4.3', name: 'Phrasal verbs ile çakışma', priority: 'A', order_index: 3, parent_id: '2.4', level: 3 }
        ]
      },
      {
        id: '2.5',
        name: 'Yan Tümceler',
        priority: 'A',
        order_index: 5,
        parent_id: '2',
        level: 2,
        children: [
          { id: '2.5.1', name: 'Relative clauses: defining/non-defining, reduction', priority: 'A', order_index: 1, parent_id: '2.5', level: 3 },
          { id: '2.5.2', name: 'Noun clauses: that/wh-clause, reported speech', priority: 'A', order_index: 2, parent_id: '2.5', level: 3 },
          { id: '2.5.3', name: 'Adverbial clauses: reason, contrast, concession, condition', priority: 'A', order_index: 3, parent_id: '2.5', level: 3 }
        ]
      },
      {
        id: '2.6',
        name: 'Çatı ve Ettirgenlik',
        priority: 'A',
        order_index: 6,
        parent_id: '2',
        level: 2,
        children: [
          { id: '2.6.1', name: 'Passive voice varyantları, by-phrase, get-passive', priority: 'A', order_index: 1, parent_id: '2.6', level: 3 },
          { id: '2.6.2', name: 'Causative: have/get something done', priority: 'A', order_index: 2, parent_id: '2.6', level: 3 }
        ]
      },
      {
        id: '2.7',
        name: 'Ad-Sıfat-Zarf Sistematiği',
        priority: 'B',
        order_index: 7,
        parent_id: '2',
        level: 2,
        children: [
          { id: '2.7.1', name: 'Sıfat sırası, zarf konumları, derece zarfı', priority: 'B', order_index: 1, parent_id: '2.7', level: 3 },
          { id: '2.7.2', name: 'Paralellik (not only...but also), correlative conjunctions', priority: 'B', order_index: 2, parent_id: '2.7', level: 3 }
        ]
      },
      {
        id: '2.8',
        name: 'Artikel-Belirtililik ve Nicelik',
        priority: 'A',
        order_index: 8,
        parent_id: '2',
        level: 2,
        children: [
          { id: '2.8.1', name: 'a/an, the, zero article; soyut isimlerde kullanım', priority: 'A', order_index: 1, parent_id: '2.8', level: 3 },
          { id: '2.8.2', name: 'Much/many, few/little, plenty of, a great deal of', priority: 'A', order_index: 2, parent_id: '2.8', level: 3 }
        ]
      },
      {
        id: '2.9',
        name: 'Fiilimsi Yapılar',
        priority: 'B',
        order_index: 9,
        parent_id: '2',
        level: 2,
        children: [
          { id: '2.9.1', name: 'Gerund vs. infinitive, bare infinitive', priority: 'B', order_index: 1, parent_id: '2.9', level: 3 },
          { id: '2.9.2', name: 'Participle chains, absolute constructions', priority: 'B', order_index: 2, parent_id: '2.9', level: 3 }
        ]
      },
      {
        id: '2.10',
        name: 'Sözdizimi ve Bilgi Yapısı',
        priority: 'B',
        order_index: 10,
        parent_id: '2',
        level: 2,
        children: [
          { id: '2.10.1', name: 'It-cleft/wh-cleft, fronting, inversion for emphasis', priority: 'B', order_index: 1, parent_id: '2.10', level: 3 },
          { id: '2.10.2', name: 'Ellipsis ve substitution; bağlaşıklık araçları', priority: 'B', order_index: 2, parent_id: '2.10', level: 3 }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Kelime Hazinesi (Vocabulary) ve Sözcük Ailesi',
    description: 'Vocabulary building ve word families',
    priority: 'A',
    order_index: 3,
    parent_id: null,
    level: 1,
    children: [
      {
        id: '3.1',
        name: 'Akademik Kelime Listesi (AWL)',
        description: 'Academic Word List systematik çalışma',
        priority: 'A',
        order_index: 1,
        parent_id: '3',
        level: 2,
        children: [
          { id: '3.1.1', name: 'Alt-listeler halinde çalışma', priority: 'A', order_index: 1, parent_id: '3.1', level: 3 },
          { id: '3.1.2', name: 'Kök-ek analizi, türevler', priority: 'A', order_index: 2, parent_id: '3.1', level: 3 }
        ]
      },
      {
        id: '3.2',
        name: 'Kollokasyonlar',
        description: 'Collocations ve word combinations',
        priority: 'A',
        order_index: 2,
        parent_id: '3',
        level: 2,
        children: [
          { id: '3.2.1', name: 'Verb-noun, adjective-noun, adverb-adjective eşleşmeleri', priority: 'A', order_index: 1, parent_id: '3.2', level: 3 },
          { id: '3.2.2', name: 'Yanlış arkadaşlar ve Türkçe etkisiyle yapılan hatalar', priority: 'A', order_index: 2, parent_id: '3.2', level: 3 }
        ]
      },
      {
        id: '3.3',
        name: 'Phrasal Verbs ve Çok Sözcüklü Birimler',
        description: 'Multi-word verbs',
        priority: 'B',
        order_index: 3,
        parent_id: '3',
        level: 2,
        children: [
          { id: '3.3.1', name: 'take up, bring about, set out vs. literal anlamlardan ayrışma', priority: 'B', order_index: 1, parent_id: '3.3', level: 3 }
        ]
      },
      {
        id: '3.4',
        name: 'Sözcük Oluşumu',
        description: 'Word formation',
        priority: 'B',
        order_index: 4,
        parent_id: '3',
        level: 2,
        children: [
          { id: '3.4.1', name: 'Prefix anlam grupları: un-, dis-, mis-, over-, under-', priority: 'B', order_index: 1, parent_id: '3.4', level: 3 },
          { id: '3.4.2', name: 'Suffix anlam grupları: -tion, -ment, -ity', priority: 'B', order_index: 2, parent_id: '3.4', level: 3 }
        ]
      },
      {
        id: '3.5',
        name: 'Alan Terminolojisi (YÖKDİL için)',
        description: 'Field-specific terminology',
        priority: 'B',
        order_index: 5,
        parent_id: '3',
        level: 2,
        children: [
          { id: '3.5.1', name: 'Sosyal Bilimler: policy, institution, agency, discourse, paradigm', priority: 'B', order_index: 1, parent_id: '3.5', level: 3 },
          { id: '3.5.2', name: 'Fen Bilimleri: specimen, yield, magnitude, velocity, conservation', priority: 'B', order_index: 2, parent_id: '3.5', level: 3 },
          { id: '3.5.3', name: 'Sağlık Bilimleri: diagnosis, cohort, prevalence, comorbidity, placebo', priority: 'B', order_index: 3, parent_id: '3.5', level: 3 }
        ]
      },
      {
        id: '3.6',
        name: 'Bağlamsal Çözüm Teknikleri',
        description: 'Context clues',
        priority: 'A',
        order_index: 6,
        parent_id: '3',
        level: 2,
        children: [
          { id: '3.6.1', name: 'Tanım, örnek, zıtlık, sebep-sonuç işaretlerinden anlam çıkarma', priority: 'A', order_index: 1, parent_id: '3.6', level: 3 },
          { id: '3.6.2', name: 'Morfolojik ipuçları, üst-alt kavram ilişkileri', priority: 'A', order_index: 2, parent_id: '3.6', level: 3 }
        ]
      }
    ]
  },
  {
    id: '4',
    name: 'Okuma Becerisi ve Metin Analizi',
    description: 'Reading strategies ve text analysis',
    priority: 'A',
    order_index: 4,
    parent_id: null,
    level: 1,
    children: [
      {
        id: '4.1',
        name: 'Metin Türleri',
        description: 'Text types',
        priority: 'A',
        order_index: 1,
        parent_id: '4',
        level: 2,
        children: [
          { id: '4.1.1', name: 'Araştırma özeti, literatür genel bakışı, yöntem-bulgu yorumu', priority: 'A', order_index: 1, parent_id: '4.1', level: 3 },
          { id: '4.1.2', name: 'Pop-sci metinler ve haber analizi', priority: 'A', order_index: 2, parent_id: '4.1', level: 3 }
        ]
      },
      {
        id: '4.2',
        name: 'Sorularda İstenen Bilişsel İşlemler',
        description: 'Cognitive operations in questions',
        priority: 'A',
        order_index: 2,
        parent_id: '4',
        level: 2,
        children: [
          { id: '4.2.1', name: 'Ana fikir-destek cümlesi ayrımı', priority: 'A', order_index: 1, parent_id: '4.2', level: 3 },
          { id: '4.2.2', name: 'Tavır/ton belirteçleri: unfortunately, arguably, ostensibly, allegedly', priority: 'A', order_index: 2, parent_id: '4.2', level: 3 },
          { id: '4.2.3', name: 'Retorik işlevler: tanım, karşılaştırma, sınıflandırma, nedenleme, örnekleme', priority: 'A', order_index: 3, parent_id: '4.2', level: 3 }
        ]
      },
      {
        id: '4.3',
        name: 'Kohesyon/Konherens',
        description: 'Cohesion and coherence',
        priority: 'A',
        order_index: 3,
        parent_id: '4',
        level: 2,
        children: [
          { id: '4.3.1', name: 'Bağlaç envanteri ve işlev sınıfları', priority: 'A', order_index: 1, parent_id: '4.3', level: 3 },
          { id: '4.3.2', name: 'Zamir-referans zinciri, tekrar, eşdeğer adlandırma, hiponimi', priority: 'A', order_index: 2, parent_id: '4.3', level: 3 }
        ]
      }
    ]
  },
  {
    id: '5',
    name: 'Çeviri Becerileri (EN↔TR)',
    description: 'Translation skills',
    priority: 'A',
    order_index: 5,
    parent_id: null,
    level: 1,
    children: [
      {
        id: '5.1',
        name: 'Zaman/Kip Eşleştirmeleri',
        description: 'Tense matching',
        priority: 'A',
        order_index: 1,
        parent_id: '5',
        level: 2,
        children: [
          { id: '5.1.1', name: 'Present perfect ↔ Türkçede bitmişlik ve sonuç değeri', priority: 'A', order_index: 1, parent_id: '5.1', level: 3 },
          { id: '5.1.2', name: 'Continuous ↔ süreklilik/alışkanlık karşılıkları', priority: 'A', order_index: 2, parent_id: '5.1', level: 3 },
          { id: '5.1.3', name: 'Modality ve kanıt değeri: must have V-ed, may/might', priority: 'A', order_index: 3, parent_id: '5.1', level: 3 }
        ]
      },
      {
        id: '5.2',
        name: 'Bilgi Akışı ve Cümle Uzunluğu',
        description: 'Information flow',
        priority: 'A',
        order_index: 2,
        parent_id: '5',
        level: 2,
        children: [
          { id: '5.2.1', name: 'Uzun cümle bölme, yan tümceleri öne/arkaya alma', priority: 'A', order_index: 1, parent_id: '5.2', level: 3 },
          { id: '5.2.2', name: 'Adlaştırma → fiilleştirme stratejileri', priority: 'A', order_index: 2, parent_id: '5.2', level: 3 }
        ]
      },
      {
        id: '5.3',
        name: 'Sabit Kalıplar ve Terimler',
        description: 'Fixed expressions',
        priority: 'B',
        order_index: 3,
        parent_id: '5',
        level: 2,
        children: [
          { id: '5.3.1', name: 'cause of vs. reason for; in terms of; with respect to; in light of', priority: 'B', order_index: 1, parent_id: '5.3', level: 3 }
        ]
      },
      {
        id: '5.4',
        name: 'Sık Hata Noktaları',
        description: 'Common errors',
        priority: 'A',
        order_index: 4,
        parent_id: '5',
        level: 2,
        children: [
          { id: '5.4.1', name: 'Artikel zorunluluğu, sayılabilirlik', priority: 'A', order_index: 1, parent_id: '5.4', level: 3 },
          { id: '5.4.2', name: 'Preposition hataları ve Türkçedeki ilgeçlerin aktarımı', priority: 'A', order_index: 2, parent_id: '5.4', level: 3 },
          { id: '5.4.3', name: 'Paralel yapı ve eşgüdüm', priority: 'A', order_index: 3, parent_id: '5.4', level: 3 }
        ]
      }
    ]
  },
  {
    id: '6',
    name: 'YÖKDİL Alan Odakları',
    description: 'Field-specific content for YÖKDİL',
    priority: 'B',
    order_index: 6,
    parent_id: null,
    level: 1,
    children: [
      {
        id: '6.1',
        name: 'Sosyal Bilimler',
        description: 'Social sciences',
        priority: 'B',
        order_index: 1,
        parent_id: '6',
        level: 2,
        children: [
          { id: '6.1.1', name: 'Söylem belirteçleri, argümantasyon işaretleri', priority: 'B', order_index: 1, parent_id: '6.1', level: 3 },
          { id: '6.1.2', name: 'Kavram kümeleri: identity, inequality, policy, institution, narrative', priority: 'B', order_index: 2, parent_id: '6.1', level: 3 }
        ]
      },
      {
        id: '6.2',
        name: 'Fen Bilimleri',
        description: 'Natural sciences',
        priority: 'B',
        order_index: 2,
        parent_id: '6',
        level: 2,
        children: [
          { id: '6.2.1', name: 'Tanım-özellik-işlev cümleleri, deneysel süreç anlatımı', priority: 'B', order_index: 1, parent_id: '6.2', level: 3 },
          { id: '6.2.2', name: 'Nicel ifade: increase/decrease, respectively, approximately', priority: 'B', order_index: 2, parent_id: '6.2', level: 3 }
        ]
      },
      {
        id: '6.3',
        name: 'Sağlık Bilimleri',
        description: 'Health sciences',
        priority: 'B',
        order_index: 3,
        parent_id: '6',
        level: 2,
        children: [
          { id: '6.3.1', name: 'Epidemiyoloji terminolojisi', priority: 'B', order_index: 1, parent_id: '6.3', level: 3 },
          { id: '6.3.2', name: 'Çalışma tasarımları: RCT, cohort, case-control', priority: 'B', order_index: 2, parent_id: '6.3', level: 3 },
          { id: '6.3.3', name: 'Risk, odds, prevalence/incidence, confounder, outcome measures', priority: 'B', order_index: 3, parent_id: '6.3', level: 3 }
        ]
      }
    ]
  },
  {
    id: '7',
    name: 'Sınav Teknikleri ve Zaman Yönetimi',
    description: 'Test-taking strategies',
    priority: 'A',
    order_index: 7,
    parent_id: null,
    level: 1,
    children: [
      {
        id: '7.1',
        name: 'Çeldirici Analizi',
        description: 'Distractor analysis',
        priority: 'A',
        order_index: 1,
        parent_id: '7',
        level: 2,
        children: [
          { id: '7.1.1', name: 'Anlamsal kaydırma, kapsam farklılığı', priority: 'A', order_index: 1, parent_id: '7.1', level: 3 },
          { id: '7.1.2', name: 'Mutlaklık işaretleri (always/never)', priority: 'A', order_index: 2, parent_id: '7.1', level: 3 },
          { id: '7.1.3', name: 'Negasyon oyunu, çift olumsuz, modal kaydırma', priority: 'A', order_index: 3, parent_id: '7.1', level: 3 }
        ]
      },
      {
        id: '7.2',
        name: 'Süre Yönetimi',
        description: 'Time management',
        priority: 'A',
        order_index: 2,
        parent_id: '7',
        level: 2,
        children: [
          { id: '7.2.1', name: '80 soru/180 dakika için tur bazlı çözüm', priority: 'A', order_index: 1, parent_id: '7.2', level: 3 },
          { id: '7.2.2', name: '"Yüksek getirili" soru türlerinin öne alınması', priority: 'A', order_index: 2, parent_id: '7.2', level: 3 }
        ]
      },
      {
        id: '7.3',
        name: 'Hata Günlüğü ve Geri Besleme',
        description: 'Error log and feedback',
        priority: 'A',
        order_index: 3,
        parent_id: '7',
        level: 2,
        children: [
          { id: '7.3.1', name: 'Hataları konuya değil "gerekçe türüne" göre etiketleme', priority: 'A', order_index: 1, parent_id: '7.3', level: 3 },
          { id: '7.3.2', name: '3 tekrar kuralı: aynı gerekçeyle üçüncü hata → strateji güncellemesi', priority: 'A', order_index: 2, parent_id: '7.3', level: 3 }
        ]
      },
      {
        id: '7.4',
        name: 'Deneme Simülasyonu',
        description: 'Mock test simulation',
        priority: 'B',
        order_index: 4,
        parent_id: '7',
        level: 2,
        children: [
          { id: '7.4.1', name: 'Gerçek oturum koşulları, optik işaretleme provası', priority: 'B', order_index: 1, parent_id: '7.4', level: 3 },
          { id: '7.4.2', name: 'Duygu düzenleme: ilk 10 dakikada sabitleme rutini', priority: 'B', order_index: 2, parent_id: '7.4', level: 3 }
        ]
      }
    ]
  },
  {
    id: '8',
    name: 'Ek Listeler ve Kaynak Haritaları',
    description: 'Reference lists and resources',
    priority: 'A',
    order_index: 8,
    parent_id: null,
    level: 1,
    children: [
      {
        id: '8.1',
        name: 'Bağlaç ve Söylem İşaretleri Mini-Kataloğu',
        description: 'Connectors catalog',
        priority: 'A',
        order_index: 1,
        parent_id: '8',
        level: 2,
        children: [
          { id: '8.1.1', name: 'Sebep: because, since, as, owing to, due to', priority: 'A', order_index: 1, parent_id: '8.1', level: 3 },
          { id: '8.1.2', name: 'Zıtlık: although, even though, whereas, while, despite, in spite of', priority: 'A', order_index: 2, parent_id: '8.1', level: 3 },
          { id: '8.1.3', name: 'Sonuç: therefore, thus, hence, consequently, as a result', priority: 'A', order_index: 3, parent_id: '8.1', level: 3 },
          { id: '8.1.4', name: 'Koşul: if, unless, provided that, in case, as long as', priority: 'A', order_index: 4, parent_id: '8.1', level: 3 },
          { id: '8.1.5', name: 'Ek bilgi/sıralama: moreover, furthermore, in addition, besides', priority: 'A', order_index: 5, parent_id: '8.1', level: 3 }
        ]
      },
      {
        id: '8.2',
        name: 'Öncelikli Phrasal Verbs',
        description: 'High-priority phrasal verbs',
        priority: 'B',
        order_index: 2,
        parent_id: '8',
        level: 2,
        children: [
          { id: '8.2.1', name: 'bring about, account for, stem from, result in, give rise to', priority: 'B', order_index: 1, parent_id: '8.2', level: 3 },
          { id: '8.2.2', name: 'set off, carry out, put forward, point out, look into', priority: 'B', order_index: 2, parent_id: '8.2', level: 3 }
        ]
      },
      {
        id: '8.3',
        name: 'Sık Görülen Preposition Kalıpları',
        description: 'Common preposition patterns',
        priority: 'B',
        order_index: 3,
        parent_id: '8',
        level: 2,
        children: [
          { id: '8.3.1', name: 'responsible for, associated with, capable of, distinct from', priority: 'B', order_index: 1, parent_id: '8.3', level: 3 },
          { id: '8.3.2', name: 'conducive to, consistent with, compatible with, contrary to', priority: 'B', order_index: 2, parent_id: '8.3', level: 3 },
          { id: '8.3.3', name: 'in accordance with', priority: 'B', order_index: 3, parent_id: '8.3', level: 3 }
        ]
      },
      {
        id: '8.4',
        name: 'Sözcük Ailesi Çalışma Şablonu',
        description: 'Word family templates',
        priority: 'B',
        order_index: 4,
        parent_id: '8',
        level: 2,
        children: [
          { id: '8.4.1', name: 'act → action, activity, activation, inaction, proactive, reactive', priority: 'B', order_index: 1, parent_id: '8.4', level: 3 },
          { id: '8.4.2', name: 'analyze → analysis, analyst, analytical, analytically', priority: 'B', order_index: 2, parent_id: '8.4', level: 3 }
        ]
      }
    ]
  }
]

export default function HierarchicalTopicsPage() {
  const [curriculum, setCurriculum] = useState<TopicCategory[]>([])
  const [selectedTopic, setSelectedTopic] = useState<TopicCategory | null>(null)
  const [editingTopic, setEditingTopic] = useState<TopicCategory | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<'all' | 'A' | 'B' | 'C'>('all')
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    content: '',
    examples: '',
    exercises: ''
  })
  const [showAddSubtopicModal, setShowAddSubtopicModal] = useState(false)
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false)
  const [newSubtopic, setNewSubtopic] = useState({
    name: '',
    description: '',
    priority: 'B' as 'A' | 'B' | 'C'
  })
  const [newExercise, setNewExercise] = useState('')

  useEffect(() => {
    loadCurriculum()
  }, [])

  const loadCurriculum = async () => {
    try {
      // Try to load from curriculum-hierarchical.json first
      const response = await fetch('/curriculum-hierarchical.json')
      if (response.ok) {
        const data = await response.json()
        setCurriculum(data)
        // Also save to localStorage for offline access
        localStorage.setItem('yds_curriculum', JSON.stringify(data))
        return
      }
    } catch (error) {
      console.error('Error loading curriculum from file:', error)
    }

    // Fallback to localStorage or template
    const stored = localStorage.getItem('yds_curriculum')
    if (stored) {
      setCurriculum(JSON.parse(stored))
    } else {
      setCurriculum(YDS_CURRICULUM_TEMPLATE)
      localStorage.setItem('yds_curriculum', JSON.stringify(YDS_CURRICULUM_TEMPLATE))
    }
  }

  const saveCurriculum = (newCurriculum: TopicCategory[]) => {
    setCurriculum(newCurriculum)
    localStorage.setItem('yds_curriculum', JSON.stringify(newCurriculum))
  }

  const toggleExpand = (topicId: string) => {
    const updateExpanded = (topics: TopicCategory[]): TopicCategory[] => {
      return topics.map(topic => {
        if (topic.id === topicId) {
          return { ...topic, is_expanded: !topic.is_expanded }
        }
        if (topic.children) {
          return { ...topic, children: updateExpanded(topic.children) }
        }
        return topic
      })
    }
    saveCurriculum(updateExpanded(curriculum))
  }

  const expandAll = () => {
    const expand = (topics: TopicCategory[]): TopicCategory[] => {
      return topics.map(topic => ({
        ...topic,
        is_expanded: true,
        children: topic.children ? expand(topic.children) : undefined
      }))
    }
    saveCurriculum(expand(curriculum))
  }

  const collapseAll = () => {
    const collapse = (topics: TopicCategory[]): TopicCategory[] => {
      return topics.map(topic => ({
        ...topic,
        is_expanded: false,
        children: topic.children ? collapse(topic.children) : undefined
      }))
    }
    saveCurriculum(collapse(curriculum))
  }

  const getPriorityColor = (priority: 'A' | 'B' | 'C') => {
    const colors = {
      A: 'bg-red-100 text-red-800 border-red-200',
      B: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      C: 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[priority]
  }

  const getLevelIndent = (level: number) => {
    return `${(level - 1) * 1.5}rem`
  }

  const renderTopicTree = (topics: TopicCategory[]) => {
    return topics.map(topic => {
      const hasChildren = topic.children && topic.children.length > 0
      const isExpanded = topic.is_expanded

      return (
        <div key={topic.id} className="topic-item">
          <div
            className="flex items-center p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border-l-2 border-transparent hover:border-blue-500"
            style={{ paddingLeft: getLevelIndent(topic.level) }}
            onClick={() => setSelectedTopic(topic)}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpand(topic.id)
                }}
                className="mr-2 p-1 hover:bg-slate-200 rounded transition-transform"
                style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
              >
                ▶
              </button>
            )}

            {!hasChildren && <span className="mr-2 w-6"></span>}

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(topic.priority)}`}>
                  {topic.priority}
                </span>
                <h3 className="font-semibold text-slate-900">{topic.name}</h3>
              </div>
              {topic.description && (
                <p className="text-sm text-slate-600">{topic.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hasChildren && (
                <span className="text-xs text-slate-500">
                  {topic.children?.length} alt konu
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingTopic(topic)
                }}
                className="text-blue-600 hover:text-blue-800 p-1"
                title="Düzenle"
              >
                ✏️
              </button>
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="topic-children">
              {renderTopicTree(topic.children!)}
            </div>
          )}
        </div>
      )
    })
  }

  const loadTemplate = () => {
    if (confirm('Mevcut müfredatın üzerine şablon yüklenecek. Devam etmek istiyor musunuz?')) {
      saveCurriculum(YDS_CURRICULUM_TEMPLATE)
      setShowTemplateModal(false)
      alert('YDS müfredatı başarıyla yüklendi!')
    }
  }

  const openEditModal = (topic: TopicCategory) => {
    setEditingTopic(topic)
    setEditForm({
      content: topic.content || '',
      examples: topic.examples?.join('\n') || '',
      exercises: topic.exercises?.join('\n') || ''
    })
    setShowEditModal(true)
  }

  const saveContent = () => {
    if (!editingTopic) return

    const updateTopicContent = (topics: TopicCategory[]): TopicCategory[] => {
      return topics.map(topic => {
        if (topic.id === editingTopic.id) {
          return {
            ...topic,
            content: editForm.content,
            examples: editForm.examples.split('\n').filter(e => e.trim()),
            exercises: editForm.exercises.split('\n').filter(e => e.trim())
          }
        }
        if (topic.children) {
          return { ...topic, children: updateTopicContent(topic.children) }
        }
        return topic
      })
    }

    const updatedCurriculum = updateTopicContent(curriculum)
    saveCurriculum(updatedCurriculum)

    // Update selected topic if it's the one being edited
    if (selectedTopic?.id === editingTopic.id) {
      const findUpdatedTopic = (topics: TopicCategory[]): TopicCategory | null => {
        for (const topic of topics) {
          if (topic.id === editingTopic.id) return topic
          if (topic.children) {
            const found = findUpdatedTopic(topic.children)
            if (found) return found
          }
        }
        return null
      }
      setSelectedTopic(findUpdatedTopic(updatedCurriculum))
    }

    setShowEditModal(false)
    setEditingTopic(null)
  }

  const openAddSubtopicModal = (parentTopic: TopicCategory) => {
    setEditingTopic(parentTopic)
    setNewSubtopic({
      name: '',
      description: '',
      priority: 'B'
    })
    setShowAddSubtopicModal(true)
  }

  const addSubtopic = () => {
    if (!editingTopic || !newSubtopic.name.trim()) return

    const addSubtopicToTree = (topics: TopicCategory[]): TopicCategory[] => {
      return topics.map(topic => {
        if (topic.id === editingTopic.id) {
          const newId = `${topic.id}.${(topic.children?.length || 0) + 1}`
          const newChild: TopicCategory = {
            id: newId,
            name: newSubtopic.name,
            description: newSubtopic.description,
            priority: newSubtopic.priority,
            order_index: (topic.children?.length || 0) + 1,
            parent_id: topic.id,
            level: topic.level + 1,
            children: []
          }
          return {
            ...topic,
            children: [...(topic.children || []), newChild],
            is_expanded: true
          }
        }
        if (topic.children) {
          return { ...topic, children: addSubtopicToTree(topic.children) }
        }
        return topic
      })
    }

    const updatedCurriculum = addSubtopicToTree(curriculum)
    saveCurriculum(updatedCurriculum)

    // Update selected topic
    if (selectedTopic?.id === editingTopic.id) {
      const findUpdatedTopic = (topics: TopicCategory[]): TopicCategory | null => {
        for (const topic of topics) {
          if (topic.id === editingTopic.id) return topic
          if (topic.children) {
            const found = findUpdatedTopic(topic.children)
            if (found) return found
          }
        }
        return null
      }
      setSelectedTopic(findUpdatedTopic(updatedCurriculum))
    }

    setShowAddSubtopicModal(false)
    setEditingTopic(null)
  }

  const openAddExerciseModal = (topic: TopicCategory) => {
    setEditingTopic(topic)
    setNewExercise('')
    setShowAddExerciseModal(true)
  }

  const addExercise = () => {
    if (!editingTopic || !newExercise.trim()) return

    const addExerciseToTopic = (topics: TopicCategory[]): TopicCategory[] => {
      return topics.map(topic => {
        if (topic.id === editingTopic.id) {
          return {
            ...topic,
            exercises: [...(topic.exercises || []), newExercise.trim()]
          }
        }
        if (topic.children) {
          return { ...topic, children: addExerciseToTopic(topic.children) }
        }
        return topic
      })
    }

    const updatedCurriculum = addExerciseToTopic(curriculum)
    saveCurriculum(updatedCurriculum)

    // Update selected topic
    if (selectedTopic?.id === editingTopic.id) {
      const findUpdatedTopic = (topics: TopicCategory[]): TopicCategory | null => {
        for (const topic of topics) {
          if (topic.id === editingTopic.id) return topic
          if (topic.children) {
            const found = findUpdatedTopic(topic.children)
            if (found) return found
          }
        }
        return null
      }
      setSelectedTopic(findUpdatedTopic(updatedCurriculum))
    }

    setShowAddExerciseModal(false)
    setEditingTopic(null)
    setNewExercise('')
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Hiyerarşik Konu Yönetimi</h1>
            <p className="text-slate-600">YDS müfredat yapısı ve içerik yönetimi</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="btn-secondary"
            >
              📋 Şablon Yükle
            </button>
            <button className="btn-primary">
              + Yeni Kategori Ekle
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Konu ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tüm Öncelikler</option>
            <option value="A">Öncelik A</option>
            <option value="B">Öncelik B</option>
            <option value="C">Öncelik C</option>
          </select>

          <div className="flex gap-2">
            <button onClick={expandAll} className="btn-secondary btn-sm">
              ⊕ Tümünü Aç
            </button>
            <button onClick={collapseAll} className="btn-secondary btn-sm">
              ⊖ Tümünü Kapat
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic Tree */}
        <div className="lg:col-span-2">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Müfredat Ağacı</h2>
              <span className="text-sm text-slate-600">
                {curriculum.length} ana kategori
              </span>
            </div>

            <div className="space-y-1 max-h-[800px] overflow-y-auto">
              {curriculum.length > 0 ? (
                renderTopicTree(curriculum)
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p className="mb-4">Henüz konu eklenmemiş</p>
                  <button onClick={() => setShowTemplateModal(true)} className="btn-primary">
                    YDS Şablonunu Yükle
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Topic Details Panel */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-4">
            {selectedTopic ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(selectedTopic.priority)}`}>
                      Öncelik {selectedTopic.priority}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">
                      {selectedTopic.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                {selectedTopic.description && (
                  <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-1">Açıklama</h4>
                    <p className="text-sm text-slate-600">{selectedTopic.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Seviye</p>
                    <p className="font-semibold">Level {selectedTopic.level}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Sıra</p>
                    <p className="font-semibold">#{selectedTopic.order_index}</p>
                  </div>
                </div>

                {selectedTopic.children && selectedTopic.children.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">
                      Alt Konular ({selectedTopic.children.length})
                    </h4>
                    <ul className="space-y-1">
                      {selectedTopic.children.map(child => (
                        <li key={child.id} className="text-sm text-slate-600 flex items-center gap-2">
                          <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                          {child.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t space-y-2">
                  <button
                    onClick={() => openEditModal(selectedTopic)}
                    className="btn-primary w-full"
                  >
                    ✏️ İçerik Düzenle
                  </button>
                  <button
                    onClick={() => openAddSubtopicModal(selectedTopic)}
                    className="btn-secondary w-full"
                  >
                    + Alt Konu Ekle
                  </button>
                  <button
                    onClick={() => openAddExerciseModal(selectedTopic)}
                    className="btn-secondary w-full"
                  >
                    📝 Alıştırma Ekle
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p className="mb-2">👆</p>
                <p>Detayları görmek için bir konu seçin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">YDS Müfredat Şablonu</h2>

            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>Bu şablon şunları içerir:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                <li>Sınav Soru Tipleri ve Strateji (7 alt kategori, 32 konu)</li>
                <li>Dilbilgisi ve Cümle Yapıları (10 alt kategori, 28 konu)</li>
                <li>Öncelik seviyeleri (A, B, C)</li>
                <li>Hiyerarşik yapı (3 seviye)</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">1. Sınav Soru Tipleri ve Strateji</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Kelime ve Dilbilgisi (7 alt konu)</li>
                  <li>• Cümle Tamamlama (4 alt konu)</li>
                  <li>• Anlamca En Yakın Cümle (5 alt konu)</li>
                  <li>• Paragraf Tamamlama (3 alt konu)</li>
                  <li>• Diyalog Tamamlama (3 alt konu)</li>
                  <li>• Çeviri (6 alt konu)</li>
                  <li>• Okuduğunu Anlama (4 alt konu)</li>
                </ul>
              </div>

              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">2. Dilbilgisi ve Cümle Yapıları</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Zaman-Görünüş (3 alt konu)</li>
                  <li>• Kiplik ve Tutum (3 alt konu)</li>
                  <li>• Koşul Yapıları (3 alt konu)</li>
                  <li>• Edatlar ve Kalıplar (3 alt konu)</li>
                  <li>• Yan Tümceler (3 alt konu)</li>
                  <li>• Çatı ve Ettirgenlik (2 alt konu)</li>
                  <li>• Ad-Sıfat-Zarf Sistematiği (2 alt konu)</li>
                  <li>• Artikel-Belirtililik (2 alt konu)</li>
                  <li>• Fiilimsi Yapılar (2 alt konu)</li>
                  <li>• Sözdizimi ve Bilgi Yapısı (2 alt konu)</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={loadTemplate} className="btn-primary flex-1">
                ✓ Şablonu Yükle
              </button>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="btn-secondary flex-1"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Edit Modal */}
      {showEditModal && editingTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">İçerik Düzenle</h2>
                <p className="text-slate-600">{editingTopic.name}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Content Section */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  📝 Konu İçeriği
                </label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  className="w-full h-40 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Konu hakkında detaylı açıklama ve öğrenci notları yazın..."
                />
                <p className="text-xs text-slate-500 mt-1">
                  Öğrencilerin göreceği ana içerik metni
                </p>
              </div>

              {/* Examples Section */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  💡 Örnekler (Her satır bir örnek)
                </label>
                <textarea
                  value={editForm.examples}
                  onChange={(e) => setEditForm({ ...editForm, examples: e.target.value })}
                  className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                  placeholder="I have been studying English for 5 years.&#10;She had finished her homework before dinner.&#10;They will have completed the project by next week."
                />
                <p className="text-xs text-slate-500 mt-1">
                  Her satıra bir örnek cümle yazın
                </p>
              </div>

              {/* Exercises Section */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  📚 Alıştırmalar (Her satır bir alıştırma)
                </label>
                <textarea
                  value={editForm.exercises}
                  onChange={(e) => setEditForm({ ...editForm, exercises: e.target.value })}
                  className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                  placeholder="Complete: I ___ (study) English since 2019.&#10;Choose: She ___ her work when I arrived. (finished/had finished)&#10;Translate: 5 yıldır İngilizce öğreniyorum."
                />
                <p className="text-xs text-slate-500 mt-1">
                  Her satıra bir alıştırma sorusu yazın
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                onClick={saveContent}
                className="btn-primary flex-1"
              >
                ✓ Kaydet
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingTopic(null)
                }}
                className="btn-secondary flex-1"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subtopic Modal */}
      {showAddSubtopicModal && editingTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">Alt Konu Ekle</h2>
                <p className="text-slate-600">{editingTopic.name} için yeni alt konu</p>
              </div>
              <button
                onClick={() => setShowAddSubtopicModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Konu Adı *
                </label>
                <input
                  type="text"
                  value={newSubtopic.name}
                  onChange={(e) => setNewSubtopic({ ...newSubtopic, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: Present Perfect Tense"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={newSubtopic.description}
                  onChange={(e) => setNewSubtopic({ ...newSubtopic, description: e.target.value })}
                  className="w-full h-24 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Konu hakkında kısa açıklama..."
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Öncelik
                </label>
                <div className="flex gap-3">
                  {(['A', 'B', 'C'] as const).map(priority => (
                    <button
                      key={priority}
                      onClick={() => setNewSubtopic({ ...newSubtopic, priority })}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        newSubtopic.priority === priority
                          ? priority === 'A' ? 'bg-red-500 text-white' :
                            priority === 'B' ? 'bg-yellow-500 text-white' :
                            'bg-green-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Öncelik {priority}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                onClick={addSubtopic}
                disabled={!newSubtopic.name.trim()}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓ Ekle
              </button>
              <button
                onClick={() => {
                  setShowAddSubtopicModal(false)
                  setEditingTopic(null)
                }}
                className="btn-secondary flex-1"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddExerciseModal && editingTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">Alıştırma Ekle</h2>
                <p className="text-slate-600">{editingTopic.name}</p>
              </div>
              <button
                onClick={() => setShowAddExerciseModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Exercise Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  📝 Alıştırma Sorusu *
                </label>
                <textarea
                  value={newExercise}
                  onChange={(e) => setNewExercise(e.target.value)}
                  className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                  placeholder="Örn: Complete the sentence: I ___ (study) English for 5 years."
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-1">
                  Tek bir alıştırma sorusu yazın
                </p>
              </div>

              {/* Current Exercises */}
              {editingTopic.exercises && editingTopic.exercises.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">
                    Mevcut Alıştırmalar ({editingTopic.exercises.length})
                  </h4>
                  <ul className="space-y-2 max-h-40 overflow-y-auto">
                    {editingTopic.exercises.map((exercise, idx) => (
                      <li key={idx} className="text-sm text-slate-600 flex items-start gap-2 p-2 bg-slate-50 rounded">
                        <span className="text-blue-600 font-semibold">{idx + 1}.</span>
                        <span className="flex-1">{exercise}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                onClick={addExercise}
                disabled={!newExercise.trim()}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓ Ekle
              </button>
              <button
                onClick={() => {
                  setShowAddExerciseModal(false)
                  setEditingTopic(null)
                  setNewExercise('')
                }}
                className="btn-secondary flex-1"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}