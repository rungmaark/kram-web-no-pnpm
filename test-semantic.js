// test-semantic.js
require('dotenv').config();
const { calculateEnhancedSemanticRelevance } = require('./lib/ultraStrictSemanticAnalyzer.ts');

async function testOptimizedSemanticAnalyzer() {
    console.log('🚀 Testing Optimized Semantic Analyzer...\n');

    const testQueries = ['MK', 'ชอบหมา', 'ชอบกิน', 'coffee lover', 'gamer', 'ชอบคอม', 'คอม'];
    
    const testProfiles = [
        {
            name: 'MK Lover',
            interests: ['MK Restaurant', 'สุกี้', 'อาหารญี่ปุ่น'],
            bio: 'ชอบกินสุกี้ที่ MK',
            rawProfileText: 'Love eating at MK Restaurant, especially their sukiyaki'
        },
        {
            name: 'Dog Lover',
            interests: ['หมา', 'สุนัข', 'Golden Retriever'],
            bio: 'รักหมามาก มีน้องหมา 2 ตัว',
            rawProfileText: 'Dog lover with 2 Golden Retrievers, love taking care of pets'
        },
        {
            name: 'Coffee Enthusiast',
            interests: ['กาแฟ', 'Starbucks', 'True Coffee'],
            bio: 'Coffee addict, visit cafes daily',
            rawProfileText: 'I love coffee and trying different cafes around Bangkok'
        },
        {
            name: 'Gamer',
            interests: ['เกม', 'League of Legends', 'gaming'],
            bio: 'Professional gamer',
            rawProfileText: 'Professional gamer, play LoL and Valorant competitively'
        },
        {
            name: 'Computer Person (Jay)',
            interests: ['คอมพิวเตอร์', 'programming', 'IT'],
            bio: 'ชอบคอมพิวเตอร์และเขียนโปรแกรม',
            rawProfileText: 'Love computers, programming, and technology. Work in IT field.'
        },
        {
            name: 'Random Person',
            interests: ['หนัง', 'ดนตรี', 'อ่านหนังสือ'],
            bio: 'ชอบดูหนังและฟังเพลง',
            rawProfileText: 'Love movies, music and reading books in free time'
        }
    ];

    for (const query of testQueries) {
        console.log(`\n=== Testing Query: "${query}" ===`);
        
        const results = [];
        for (const profile of testProfiles) {
            try {
                const score = await calculateEnhancedSemanticRelevance(query, profile);
                results.push({ profile: profile.name, score });
            } catch (error) {
                console.error(`Error testing ${profile.name}:`, error.message);
                results.push({ profile: profile.name, score: 0 });
            }
        }
        
        // Sort by score (descending)
        results.sort((a, b) => b.score - a.score);
        
        console.log('Results (sorted by relevance):');
        results.forEach((result, idx) => {
            const emoji = result.score >= 0.7 ? '🎯' : result.score >= 0.5 ? '✅' : result.score >= 0.3 ? '⚠️' : '❌';
            console.log(`  ${idx + 1}. ${emoji} ${result.profile}: ${result.score.toFixed(3)}`);
        });
    }

    console.log('\n✅ Optimized Semantic Testing Complete!');
}

testOptimizedSemanticAnalyzer().catch(console.error);