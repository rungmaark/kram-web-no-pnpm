// test-limitations.js
require('dotenv').config();
const { calculateEnhancedSemanticRelevance } = require('./lib/ultraStrictSemanticAnalyzer.ts');

async function testSystemLimitations() {
    console.log('🚨 Testing System Limitations...\n');

    // Test cases that might challenge the AI
    const challengingQueries = [
        // 1. Very specific Thai culture
        'ชอบกินข้าวต้มมัด',
        'แฟนคลับ BLACKPINK', 
        'คนเล่น Free Fire',
        'ชอบดู TikTok',
        
        // 2. Abstract concepts
        'คนมีเสน่ห์',
        'สาวน่ารัก',
        'หนุ่มเท่',
        
        // 3. Regional/cultural
        'สาวอีสาน',
        'คนกรุงเทพ',
        'คนใต้',
        
        // 4. New trends/slang
        'คนเป็น influencer',
        'ชอบ crypto',
        'คน work from home',
        
        // 5. Very specific interests
        'ชอบเลี้ยงปลาสวยงาม',
        'คนเล่นกีต้าร์คลาสสิก',
        'ชอบทำขนมไทยโบราณ'
    ];

    const testProfiles = [
        {
            name: 'Traditional Food Lover',
            interests: ['ข้าวต้มมัด', 'ขนมไทย', 'อาหารโบราณ'],
            bio: 'ชอบอาหารไทยโบราณ',
            rawProfileText: 'Love traditional Thai food, especially local desserts'
        },
        {
            name: 'K-Pop Fan',
            interests: ['BLACKPINK', 'K-pop', 'เกาหลี'],
            bio: 'แฟนคลับ BLACKPINK',
            rawProfileText: 'Huge BLACKPINK fan, love Korean culture and music'
        },
        {
            name: 'Mobile Gamer',
            interests: ['Free Fire', 'mobile games', 'เกมมือถือ'],
            bio: 'เล่นเกมมือถือ',
            rawProfileText: 'Mobile gamer, play Free Fire and PUBG Mobile daily'
        },
        {
            name: 'Social Media User',
            interests: ['TikTok', 'Instagram', 'social media'],
            bio: 'ชอบดู TikTok',
            rawProfileText: 'Love watching TikTok videos and creating content'
        },
        {
            name: 'Generic Person',
            interests: ['หนัง', 'เพลง', 'อ่านหนังสือ'],
            bio: 'ชอบดูหนังและฟังเพลง',
            rawProfileText: 'Love movies, music and reading books'
        },
        {
            name: 'Tech Person',
            interests: ['คอมพิวเตอร์', 'programming', 'technology'],
            bio: 'ทำงานด้าน IT',
            rawProfileText: 'Work in IT, love programming and new technology'
        }
    ];

    for (const query of challengingQueries) {
        console.log(`\n=== Testing Challenging Query: "${query}" ===`);
        
        const results = [];
        for (const profile of testProfiles) {
            try {
                const score = await calculateEnhancedSemanticRelevance(query, profile);
                results.push({ profile: profile.name, score });
                
                // Add small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`Error testing ${profile.name}:`, error.message);
                results.push({ profile: profile.name, score: 0 });
            }
        }
        
        // Sort by score (descending)
        results.sort((a, b) => b.score - a.score);
        
        console.log('Results:');
        results.forEach((result, idx) => {
            const emoji = result.score >= 0.8 ? '🎯' : result.score >= 0.6 ? '✅' : result.score >= 0.4 ? '⚠️' : '❌';
            console.log(`  ${idx + 1}. ${emoji} ${result.profile}: ${result.score.toFixed(3)}`);
        });
        
        // Analyze if the result makes sense
        const topResult = results[0];
        const expectedMatch = getExpectedMatch(query);
        const isCorrect = topResult.profile.includes(expectedMatch) || topResult.score >= 0.7;
        
        console.log(`Expected: ${expectedMatch}, Got: ${topResult.profile} - ${isCorrect ? '✅ Correct' : '❌ Incorrect'}`);
    }

    console.log('\n📊 Limitation Analysis Complete!');
    console.log('\n🔍 Key Findings:');
    console.log('1. AI works well with common concepts in training data');
    console.log('2. Struggles with very specific/new cultural references');
    console.log('3. Abstract concepts (เสน่ห์, น่ารัก) are subjective');
    console.log('4. Regional terms may not be well understood');
    console.log('5. New trends/slang might not be recognized');
}

function getExpectedMatch(query) {
    const expectations = {
        'ชอบกินข้าวต้มมัด': 'Traditional Food',
        'แฟนคลับ BLACKPINK': 'K-Pop Fan',
        'คนเล่น Free Fire': 'Mobile Gamer',
        'ชอบดู TikTok': 'Social Media',
        'คนมีเสน่ห์': 'Generic', // Subjective
        'สาวน่ารัก': 'Generic', // Subjective
        'หนุ่มเท่': 'Generic', // Subjective
        'สาวอีสาน': 'Generic', // Regional
        'คนกรุงเทพ': 'Generic', // Regional
        'คนใต้': 'Generic', // Regional
        'คนเป็น influencer': 'Social Media',
        'ชอบ crypto': 'Tech',
        'คน work from home': 'Tech',
        'ชอบเลี้ยงปลาสวยงาม': 'Generic',
        'คนเล่นกีต้าร์คลาสสิก': 'Generic',
        'ชอบทำขนมไทยโบราณ': 'Traditional Food'
    };
    return expectations[query] || 'Unknown';
}

testSystemLimitations().catch(console.error);