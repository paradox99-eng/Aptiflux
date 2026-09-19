// Simple seeded PRNG
function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return { year: d.getUTCFullYear(), week: weekNo };
}

export function generateWeeklyQuiz(questionsData) {
    const now = new Date();
    const { year, week } = getWeekNumber(now);
    
    // Create a deterministic seed based on year and week
    const seed = year * 100 + week;
    const rand = mulberry32(seed);

    // Flatten all subtopics from all categories
    const allSubtopics = [];
    Object.keys(questionsData).forEach(catKey => {
        const cat = questionsData[catKey];
        // Group questions by subtopic
        const subtopicMap = {};
        cat.questions.forEach(q => {
            if (!subtopicMap[q.subtopic]) subtopicMap[q.subtopic] = [];
            subtopicMap[q.subtopic].push(q);
        });
        
        Object.keys(subtopicMap).forEach(sub => {
            if (subtopicMap[sub].length >= 5) { // Ensure at least 5 questions
                allSubtopics.push({
                    categoryTitle: cat.title,
                    subtopic: sub,
                    questions: subtopicMap[sub]
                });
            }
        });
    });

    if (allSubtopics.length < 2) {
        throw new Error("Not enough subtopics with at least 5 questions.");
    }

    // Pick 2 random distinct subtopics
    const index1 = Math.floor(rand() * allSubtopics.length);
    let index2 = Math.floor(rand() * allSubtopics.length);
    while (index2 === index1) {
        index2 = Math.floor(rand() * allSubtopics.length);
    }

    const topic1 = allSubtopics[index1];
    const topic2 = allSubtopics[index2];

    // Helper to pick a sequential block of 5 questions (e.g. 1-5, 6-10, 11-15)
    const pickSequential5 = (questionsList) => {
        // Find how many blocks of 5 are available in this subtopic
        const numBlocks = Math.floor(questionsList.length / 5);
        // Pick a random block
        const blockIndex = Math.floor(rand() * numBlocks);
        const startIndex = blockIndex * 5;
        // Slice exactly 5 sequential questions
        return questionsList.slice(startIndex, startIndex + 5);
    };

    const q1To5 = pickSequential5(topic1.questions).map((q, idx) => ({ ...q, weeklyIndex: idx + 1, weeklyTopic: topic1.subtopic }));
    const q6To10 = pickSequential5(topic2.questions).map((q, idx) => ({ ...q, weeklyIndex: idx + 6, weeklyTopic: topic2.subtopic }));

    return {
        weekId: `${year}-W${week}`,
        topics: [topic1.subtopic, topic2.subtopic],
        questions: [...q1To5, ...q6To10]
    };
}
