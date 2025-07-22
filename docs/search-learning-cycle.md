# Search Learning Cycle

## 1. User Searches
```
User ค้นหา "MK" → ได้ผลลัพธ์ 10 คน
```

## 2. User Behavior Tracking
```javascript
// บันทึกพฤติกรรม user
{
  query: "MK",
  results: [
    { userId: "user1", action: "CLICK", relevanceScore: 0.9 },    // ✅ ดี
    { userId: "user2", action: "VIEW", relevanceScore: 0.7 },     // ✅ พอใช้
    { userId: "user3", action: "SKIP", relevanceScore: 0.3 },     // ❌ แย่
    { userId: "user4", action: "LIKE", relevanceScore: 0.95 },    // ✅ ดีมาก
    { userId: "user5", action: "DISLIKE", relevanceScore: 0.2 }   // ❌ แย่มาก
  ]
}
```

## 3. Performance Analysis
```javascript
// วิเคราะห์ประสิทธิภาพ
Query: "MK"
- Total Searches: 50
- Positive Actions (CLICK, VIEW, LIKE): 35
- Negative Actions (SKIP, DISLIKE): 15
- Success Rate: 35/50 = 70%
- Average Relevance Score: 0.68
```

## 4. Threshold Adjustment
```javascript
// ปรับ threshold ตาม performance
if (successRate >= 0.8) {
  // ผลลัพธ์ดีมาก → เพิ่ม threshold (เข้มงวดขึ้น)
  semanticThreshold *= 1.2;
  vectorThreshold *= 1.1;
} else if (successRate <= 0.3) {
  // ผลลัพธ์แย่ → ลด threshold (ผ่อนปรนขึ้น)
  semanticThreshold *= 0.8;
  vectorThreshold *= 0.9;
}
```

## 5. Improved Search Results
```
ครั้งต่อไป user ค้นหา "MK" → ได้ผลลัพธ์ที่แม่นยำขึ้น
```

## 6. Continuous Learning
```
ระบบเรียนรู้ต่อเนื่อง → ยิ่งใช้ยิ่งฉลาด
```