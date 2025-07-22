// test-advanced-search.js
require('dotenv').config();

async function testAdvancedSearch() {
    console.log('🚀 Testing Advanced Search Engine...\n');

    const testQueries = [
        'MK',
        'ชอบกิน', 
        'iPhone user',
        'คนชิล',
        'coffee lover',
        'gamer',
        'ชอบเที่ยว',
        'Starbucks'
    ];

    for (const query of testQueries) {
        console.log(`\n=== Testing Query: "${query}" ===`);
        
        try {
            const response = await fetch('http://localhost:3000/api/advanced-search', {
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
            
            console.log(`🎯 Query Type: ${data.debug.searchContext.queryType}`);
            console.log(`📋 Search Intents: ${data.debug.searchContext.searchIntents.join(', ')}`);
            console.log(`🔍 Expanded Queries: ${data.debug.searchContext.expandedQueries.slice(0, 3).join(', ')}`);
            console.log(`📊 Results: ${data.users.length} users found`);
            
            if (data.users.length > 0) {
                console.log(`\n🏆 Top 3 Results:`);
                data.users.slice(0, 3).forEach((user, idx) => {
                    console.log(`${idx + 1}. ${user.displayName} (@${user.username})`);
                    console.log(`   Match: ${user._debug.matchType} (${user._debug.confidence.toFixed(3)})`);
                    console.log(`   Relevance: ${user._debug.relevanceScore.toFixed(3)}`);
                    if (user._debug.matchReasons.length > 0) {
                        console.log(`   Reasons: ${user._debug.matchReasons.join(', ')}`);
                    }
                });
            } else {
                console.log('❌ No results found');
            }

            // Show filtering stats
            console.log(`\n📈 Filtering Stats:`);
            console.log(`   Total Candidates: ${data.debug.totalCandidates}`);
            console.log(`   After Filtering: ${data.debug.filteredCount}`);
            console.log(`   Final Results: ${data.debug.finalCount}`);
            console.log(`   Thresholds: Semantic=${data.debug.adaptiveThresholds.semanticThreshold.toFixed(2)}, Final=${data.debug.adaptiveThresholds.finalScoreThreshold.toFixed(2)}`);

        } catch (error) {
            console.error(`❌ Error testing "${query}":`, error.message);
        }
    }

    console.log('\n✅ Advanced Search Testing Complete!');
}

// Test search feedback
async function testSearchFeedback() {
    console.log('\n🔄 Testing Search Feedback System...');
    
    try {
        const response = await fetch('http://localhost:3000/api/advanced-search', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: 'MK',
                userId: '507f1f77bcf86cd799439011', // Example user ID
                action: 'CLICK',
                relevanceScore: 0.8
            })
        });

        if (response.ok) {
            console.log('✅ Search feedback recorded successfully');
        } else {
            console.log('❌ Failed to record search feedback');
        }
    } catch (error) {
        console.error('❌ Feedback test error:', error.message);
    }
}

// Run tests
async function runAllTests() {
    await testAdvancedSearch();
    await testSearchFeedback();
}

runAllTests().catch(console.error);