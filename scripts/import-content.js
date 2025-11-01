#!/usr/bin/env node

/**
 * Content Import Script
 * Imports YDS curriculum content from JSON files into the platform
 */

const fs = require('fs');
const path = require('path');

// Content directory
const CONTENT_DIR = path.join(__dirname, '../../content');

// Content files for Section 1
const SECTION_1_FILES = [
  'section_1_1_kelime_dilbilgisi.json',
  'section_1_2_cumle_tamamlama.json',
  'section_1_3_anlamca_en_yakin.json',
  'section_1_4_paragraf_tamamlama.json',
  'section_1_5_diyalog_tamamlama.json',
  'section_1_6_ceviri.json',
  'section_1_7_okudugunu_anlama.json'
];

/**
 * Load all content files
 */
function loadContent() {
  const allContent = [];

  for (const file of SECTION_1_FILES) {
    const filePath = path.join(CONTENT_DIR, file);

    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      allContent.push(content);
      console.log(`✓ Loaded: ${file}`);
    } catch (error) {
      console.error(`✗ Error loading ${file}:`, error.message);
    }
  }

  return allContent;
}

/**
 * Transform content into platform format
 */
function transformContent(contentArray) {
  const transformed = [];

  for (const section of contentArray) {
    // Check if section has topics array
    if (!section || !Array.isArray(section.topics)) {
      console.warn(`⚠ Section missing topics array:`, section);
      continue;
    }

    for (const topic of section.topics) {
      transformed.push({
        id: topic.id,
        name: topic.name,
        content: topic.content,
        examples: topic.examples || [],
        exercises: (topic.exercises || []).map(ex => {
          if (typeof ex === 'string') return ex;
          return `${ex.question}\n\nCevap: ${ex.answer}\nAçıklama: ${ex.explanation}`;
        })
      });
    }
  }

  return transformed;
}

/**
 * Update curriculum with content
 */
function updateCurriculum(transformedContent) {
  // Create a map for quick lookup
  const contentMap = {};
  transformedContent.forEach(item => {
    contentMap[item.id] = item;
  });

  return contentMap;
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting YDS Content Import\n');

  // Load content
  console.log('📂 Loading content files...');
  const content = loadContent();
  console.log(`\n✓ Loaded ${content.length} sections\n`);

  // Transform content
  console.log('🔄 Transforming content...');
  const transformed = transformContent(content);
  console.log(`✓ Transformed ${transformed.length} topics\n`);

  // Create content map
  const contentMap = updateCurriculum(transformed);

  // Save to output file
  const outputPath = path.join(__dirname, '../public/curriculum-content.json');
  fs.writeFileSync(outputPath, JSON.stringify(contentMap, null, 2));
  console.log(`✓ Saved content map to: ${outputPath}\n`);

  // Statistics
  console.log('📊 Import Statistics:');
  console.log(`   - Total topics: ${transformed.length}`);
  console.log(`   - Total examples: ${transformed.reduce((sum, t) => sum + (t.examples?.length || 0), 0)}`);
  console.log(`   - Total exercises: ${transformed.reduce((sum, t) => sum + (t.exercises?.length || 0), 0)}`);

  console.log('\n✅ Import completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Run the dev server: npm run dev');
  console.log('   2. Go to Admin > Konu Yönetimi');
  console.log('   3. The content will be available for all Section 1 topics');
}

// Run
main();
