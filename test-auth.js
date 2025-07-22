// test-auth.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function testAuth() {
    console.log('🧪 Testing Authentication System...\n');

    // Test 1: Check environment variables
    console.log('=== Test 1: Environment Variables ===');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set ✅' : 'Missing ❌');
    console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set ✅' : 'Missing ❌');
    console.log('AUTH_SECRET:', process.env.AUTH_SECRET ? 'Set ✅' : 'Missing ❌');

    // Test 2: MongoDB Connection
    console.log('\n=== Test 2: MongoDB Connection ===');
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: "Kram" });
        console.log('MongoDB Connection: Success ✅');
        console.log('Database:', mongoose.connection.db.databaseName);
        
        // Test 3: Check Users Collection
        console.log('\n=== Test 3: Users Collection ===');
        const usersCount = await mongoose.connection.db.collection('users').countDocuments();
        console.log(`Total users in database: ${usersCount}`);
        
        // Get a sample user to test
        const sampleUser = await mongoose.connection.db.collection('users').findOne({});
        if (sampleUser) {
            console.log('Sample user found:');
            console.log('- Username:', sampleUser.username);
            console.log('- Has password:', sampleUser.password ? 'Yes ✅' : 'No ❌');
            console.log('- Display name:', sampleUser.displayName);
            
            // Test 4: Password verification
            if (sampleUser.password) {
                console.log('\n=== Test 4: Password Hash Test ===');
                console.log('Password hash format:', sampleUser.password.substring(0, 10) + '...');
                console.log('Hash length:', sampleUser.password.length);
                
                // Test with a dummy password to see if bcrypt works
                try {
                    const testResult = await bcrypt.compare('wrongpassword', sampleUser.password);
                    console.log('bcrypt.compare test: Working ✅');
                } catch (error) {
                    console.log('bcrypt.compare error:', error.message);
                }
            }
        } else {
            console.log('No users found in database ❌');
        }
        
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Test completed');
    }
}

testAuth().catch(console.error);