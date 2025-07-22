// demo-learning-system.js
require('dotenv').config();

async function demoLearningSystem() {
    console.log('🧠 Demo: Search Learning System\n');

    // Simulate user search behavior
    const searchSessions = [
        {
            query: "MK",
            userActions: [
                { userId: "user1", action: "CLICK", relevanceScore: 0.9 },
                { userId: "user2", action: "VIEW", relevanceScore: 0.7 },
                { userId: "user3", action: "SKIP", relevanceScore: 0.3 },
                { userId: "user4", action: "LIKE", relevanceScore: 0.95 },
                { userId: "user5", action: "DISLIKE", relevanceScore: 0.2 }
            ]
        },
        {
            query: "ชอบกิน",
            userActions: [
                { userId: "user6", action: "SKIP", relevanceScore: 0.2 },
                { userId: "user7", action: "SKIP", relevanceScore: 0.3 },
                { userId: "user8", action: "VIEW", relevanceScore: 0.6 },
                { userId: "user9", action: "SKIP", relevanceScore: 0.25 },
                { userId: "user10", action: "CLICK", relevanceScore: 0.8 }
            ]
        }
    ];

    // Step 1: Record search feedback
    console.log('📊 Step 1: Recording Search Feedback...');
    for (const session of searchSessions) {
        console.log(`\nQuery: "${session.query}"`);
        
        for (const action of session.userActions) {
            try {
                const response = await fetch('http://localhost:3000/api/advanced-search', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: session.query,
                        userId: action.userId,
                        action: action.action,
                        relevanceScore: action.relevanceScore
                    })
                });

                if (response.ok) {
                    console.log(`  ✅ ${action.action} by ${action.userId} (score: ${action.relevanceScore})`);
                } else {
                    console.log(`  ❌ Failed to record ${action.action} by ${action.userId}`);
                }
            } catch (error) {
                console.log(`  ❌ Error: ${error.message}`);
            }
        }
    }

    // Step 2: Test adaptive thresholds
    console.log('\n📈 Step 2: Testing Adaptive Thresholds...');
    
    for (const session of searchSessions) {
        try {
            const response = await fetch('http://localhost:3000/api/advanced-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: session.query })
            });

            if (response.ok) {
                const data = await response.json();
                const thresholds = data.debug.adaptiveThresholds;
                
                console.log(`\nQuery: "${session.query}"`);
                console.log(`  Semantic Threshold: ${thresholds.semanticThreshold.toFixed(3)}`);
                console.log(`  Vector Threshold: ${thresholds.vectorThreshold.toFixed(3)}`);
                console.log(`  Final Threshold: ${thresholds.finalScoreThreshold.toFixed(3)}`);
                console.log(`  Results Found: ${data.users.length}`);
                
                // Calculate expected success rate
                const positiveActions = session.userActions.filter(a => 
                    ['CLICK', 'VIEW', 'LIKE'].includes(a.action)
                ).length;
                const successRate = positiveActions / session.userActions.length;
                console.log(`  Expected Success Rate: ${(successRate * 100).toFixed(1)}%`);
                
            } else {
                console.log(`  ❌ Failed to get results for "${session.query}"`);
            }
        } catch (error) {
            console.log(`  ❌ Error testing "${session.query}": ${error.message}`);
        }
    }

    // Step 3: Compare with default thresholds
    console.log('\n🔄 Step 3: Comparison with Default Thresholds...');
    console.log('Default Thresholds:');
    console.log('  Semantic: 0.500');
    console.log('  Vector: 0.600'); 
    console.log('  Final: 0.350');
    console.log('\nAdaptive Thresholds adjust based on:');
    console.log('  ✅ High Success Rate (>80%) → Increase thresholds (more strict)');
    console.log('  ❌ Low Success Rate (<30%) → Decrease thresholds (more lenient)');
    console.log('  📊 Average Performance → Keep similar thresholds');

    console.log('\n✅ Learning System Demo Complete!');
    console.log('\n💡 Key Benefits:');
    console.log('  1. Self-improving search accuracy');
    console.log('  2. Adaptive to user behavior patterns');
    console.log('  3. Query-specific optimization');
    console.log('  4. Continuous performance monitoring');
}

demoLearningSystem().catch(console.error);