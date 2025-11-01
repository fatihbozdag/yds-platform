/**
 * Script to sync curriculum-content.json with admin panel structure
 * Converts flat topic structure to hierarchical format
 */

const fs = require('fs');
const path = require('path');

// Read the curriculum content
const curriculumPath = path.join(__dirname, '../public/curriculum-content.json');
const curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));

// Define the hierarchical structure mapping
const hierarchicalStructure = {
  "1": {
    name: "Temel Dil Bilgisi ve Kelime",
    description: "Vocabulary, Grammar, and Sentence Structure",
    sections: {
      "1.1": { name: "Kelime ve Dilbilgisi", description: "Vocabulary and basic grammar" },
      "1.2": { name: "Cümle Tamamlama", description: "Sentence completion" },
      "1.3": { name: "İleri Dilbilgisi", description: "Advanced grammar structures" }
    }
  },
  "2": {
    name: "Okuma Becerileri",
    description: "Reading Skills and Comprehension",
    sections: {
      "2.1": { name: "Okuduğunu Anlama", description: "Reading comprehension skills" },
      "2.2": { name: "Paragraf Tamamlama", description: "Paragraph completion / Cloze test" },
      "2.3": { name: "Cümleler Arası Uyumsuzluk", description: "Finding irrelevant sentences" }
    }
  },
  "3": {
    name: "Diyalog Tamamlama",
    description: "Dialogue Completion",
    sections: {
      "3.1": { name: "Diyalog Becerileri", description: "Dialogue completion skills" }
    }
  },
  "4": {
    name: "Akademik Kelime Hazinesi",
    description: "Academic Vocabulary by Discipline",
    sections: {
      "4.1": { name: "Alana Özgü Kelimeler", description: "Field-specific vocabulary" }
    }
  },
  "5": {
    name: "Sınav Teknikleri",
    description: "Test-Taking Strategies",
    sections: {
      "5.1": { name: "Soru Türleri ve Stratejiler", description: "Question types and strategies" }
    }
  }
};

// Convert flat structure to hierarchical
function convertToHierarchical() {
  const result = [];

  // Group topics by major section
  const topicsBySection = {};

  Object.entries(curriculum).forEach(([id, topic]) => {
    const parts = id.split('.');
    const majorSection = parts[0];
    const subSection = parts.slice(0, 2).join('.');

    if (!topicsBySection[majorSection]) {
      topicsBySection[majorSection] = {};
    }
    if (!topicsBySection[majorSection][subSection]) {
      topicsBySection[majorSection][subSection] = [];
    }
    topicsBySection[majorSection][subSection].push({ id, ...topic });
  });

  // Build hierarchical structure
  Object.entries(hierarchicalStructure).forEach(([majorId, majorData]) => {
    const majorSection = {
      id: majorId,
      name: majorData.name,
      description: majorData.description,
      priority: 'A',
      order_index: parseInt(majorId),
      parent_id: null,
      level: 1,
      children: []
    };

    Object.entries(majorData.sections).forEach(([subId, subData]) => {
      const subSection = {
        id: subId,
        name: subData.name,
        description: subData.description,
        priority: 'A',
        order_index: parseInt(subId.split('.')[1]),
        parent_id: majorId,
        level: 2,
        children: []
      };

      // Add topics to subsection
      if (topicsBySection[majorId] && topicsBySection[majorId][subId]) {
        topicsBySection[majorId][subId].forEach((topic, idx) => {
          subSection.children.push({
            id: topic.id,
            name: topic.name,
            description: topic.content?.substring(0, 100) + '...',
            priority: 'A',
            order_index: idx + 1,
            parent_id: subId,
            level: 3,
            content: topic.content,
            examples: topic.examples,
            exercises: topic.exercises
          });
        });
      }

      majorSection.children.push(subSection);
    });

    result.push(majorSection);
  });

  return result;
}

// Generate the hierarchical curriculum
const hierarchicalCurriculum = convertToHierarchical();

// Save to a new file that can be imported by both admin and student pages
const outputPath = path.join(__dirname, '../public/curriculum-hierarchical.json');
fs.writeFileSync(outputPath, JSON.stringify(hierarchicalCurriculum, null, 2), 'utf8');

console.log('✅ Successfully converted curriculum to hierarchical structure');
console.log(`📄 Output saved to: ${outputPath}`);
console.log(`📊 Total sections: ${hierarchicalCurriculum.length}`);
console.log(`📚 Total topics: ${Object.keys(curriculum).length}`);
