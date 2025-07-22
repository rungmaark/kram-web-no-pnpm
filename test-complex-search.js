// test-complex-search.js
require('dotenv').config();

async function testComplexSearch() {
    console.log('🔥 Testing Complex Search Queries...\n');

    const testQueries = [
        'เด็กมก.ที่ชอบหมา ชอบกิน MK',
        'MK',
        'ชอบหมา',
        'ชอบกิน',
        'ชอบคอม',
        'คอม',
        'coffee lover who plays games',
        'iPhone user ชอบกาแฟ'
    ];

    for (const query of testQueries) {
        console.log(`\n=== Testing: "${query}" ===`);
        
        try {
            const response = await fetch('http://localhost:3000/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query })
            });

            if (!response.ok) {
                console.error(`❌ HTTP Error: ${response.status}`);
                const errorText = await response.text();
                console.error('Error details:', errorText);
                continue;
            }

            const data = await response.json();
            
            console.log(`🎯 Query Type: ${data.debug.queryType}`);
            console.log(`📊 Results: ${data.users.length} users found`);
            console.log(`🔍 Filtering: ${data.debug.filteredCount}/${data.debug.totalCandidates} passed`);
            console.log(`📈 Thresholds: S=${data.debug.thresholds.semantic}, V=${data.debug.thresholds.vector}, F=${data.debug.thresholds.final}`);
            
            if (data.users.length > 0) {
                console.log(`\n🏆 Top Results:`);
                data.users.slice(0, 3).forEach((user, idx) => {
                    console.log(`${idx + 1}. ${user.displayName} (@${user.username})`);
                    console.log(`   Final: ${user._debug.finalScore?.toFixed(3)}, Semantic: ${user._debug.semanticRelevance?.toFixed(3)}`);
                });
            } else {
                console.log('❌ No results found (as expected for strict filtering)');
            }

        } catch (error) {
            console.error(`❌ Error testing "${query}":`, error.message);
        }
    }

    console.log('\n✅ Complex Search Testing Complete!');
}

testComplexSearch().catch(console.error);