// app/api/debug/create-test-users/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { extractIndexData } from "@/models/User";
import { indexUser } from "@/lib/indexProfile";
import { indexRawProfile } from "@/lib/indexRawProfile";
import { encrypt } from "@/lib/encrypt";

export async function POST(req: NextRequest) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    const testUsers = [
      // === อาหาร/ร้านอาหาร ===
      {
        username: "foodie_lover",
        displayName: "Food Explorer",
        password: "test123",
        interests: [
          { interestName: "ซูชิ", category: "custom" },
          { interestName: "Sushi", category: "custom" },
          { interestName: "Japanese Food", category: "custom" },
          { interestName: "Omakase", category: "custom" }
        ],
        MBTI: "ESFP",
        bio: "Sushi enthusiast who loves exploring Japanese cuisine",
        rawProfileText: "หลงใหลในอาหารญี่ปุ่น โดยเฉพาะซูชิและซาชิมิ ชอบไปร้านโอมากาเสะ"
      },
      {
        username: "pizza_master",
        displayName: "Pizza Connoisseur", 
        password: "test123",
        interests: [
          { interestName: "Pizza", category: "custom" },
          { interestName: "Italian Food", category: "custom" },
          { interestName: "Cooking", category: "custom" },
          { interestName: "Food Photography", category: "custom" }
        ],
        MBTI: "ENFJ",
        bio: "Pizza lover and amateur chef specializing in Italian cuisine",
        rawProfileText: "รักพิซซ่ามาก ชอบทำพิซซ่าเอง และถ่ายรูปอาหารอิตาเลียน"
      },
      {
        username: "coffee_addict",
        displayName: "Coffee Enthusiast",
        password: "test123", 
        interests: [
          { interestName: "Coffee", category: "custom" },
          { interestName: "กาแฟ", category: "custom" },
          { interestName: "Latte Art", category: "custom" },
          { interestName: "Cafe Hopping", category: "custom" }
        ],
        MBTI: "INFP",
        bio: "Coffee lover who enjoys exploring different cafes and brewing methods",
        rawProfileText: "ติดกาแฟมาก ชอบไปคาเฟ่ใหม่ๆ และเรียนทำลาเต้อาร์ต"
      },

      // === สัตว์เลี้ยง/สัตว์ ===
      {
        username: "cat_whisperer",
        displayName: "Cat Parent",
        password: "test123",
        interests: [
          { interestName: "Cat", category: "custom" },
          { interestName: "แมว", category: "custom" },
          { interestName: "Pet Grooming", category: "custom" },
          { interestName: "Veterinary Care", category: "custom" }
        ],
        MBTI: "ISFP",
        bio: "Devoted cat parent with 3 rescue cats, passionate about feline welfare",
        rawProfileText: "เลี้ยงแมวช่วยเหลือ 3 ตัว ชอบดูแลสุขภาพแมวและทำความสะอาดให้"
      },
      {
        username: "bird_watcher",
        displayName: "Avian Enthusiast",
        password: "test123",
        interests: [
          { interestName: "Birds", category: "custom" },
          { interestName: "นก", category: "custom" },
          { interestName: "Birdwatching", category: "custom" },
          { interestName: "Wildlife Photography", category: "custom" }
        ],
        MBTI: "INTJ",
        bio: "Bird enthusiast and wildlife photographer specializing in avian species",
        rawProfileText: "ชอบดูนกและถ่ายรูปนกป่า ไปเดินป่าเพื่อหานกใหม่ๆ"
      },

      // === เกม/เทคโนโลยี ===
      {
        username: "mobile_gamer",
        displayName: "Mobile Gaming Pro",
        password: "test123",
        interests: [
          { interestName: "Mobile Gaming", category: "custom" },
          { interestName: "PUBG Mobile", category: "custom" },
          { interestName: "Mobile Legends", category: "custom" },
          { interestName: "Gaming Tournaments", category: "custom" }
        ],
        MBTI: "ESTP",
        bio: "Professional mobile gamer competing in PUBG and Mobile Legends tournaments",
        rawProfileText: "เล่นเกมมือถือแข่งขัน เชี่ยวชาญ PUBG Mobile และ Mobile Legends"
      },
      {
        username: "tech_reviewer",
        displayName: "Tech Guru",
        password: "test123",
        interests: [
          { interestName: "Technology", category: "custom" },
          { interestName: "เทคโนโลยี", category: "custom" },
          { interestName: "Smartphone", category: "custom" },
          { interestName: "AI", category: "custom" }
        ],
        MBTI: "ENTP",
        bio: "Technology reviewer and AI enthusiast, always testing latest gadgets",
        rawProfileText: "รีวิวเทคโนโลยีและสนใจ AI ชอบทดลองแกดเจ็ตใหม่ๆ"
      },

      // === กีฬา ===
      {
        username: "football_fan",
        displayName: "Football Fanatic",
        password: "test123",
        interests: [
          { interestName: "Football", category: "custom" },
          { interestName: "ฟุตบอล", category: "custom" },
          { interestName: "Premier League", category: "custom" },
          { interestName: "Manchester United", category: "custom" }
        ],
        MBTI: "ESFJ",
        bio: "Die-hard Manchester United fan, never miss a Premier League match",
        rawProfileText: "แฟนแมนยูตัวจริง ดูพรีเมียร์ลีกทุกนัด ชอบวิเคราะห์เกม"
      },
      {
        username: "fitness_coach",
        displayName: "Fitness Trainer",
        password: "test123",
        interests: [
          { interestName: "Fitness", category: "custom" },
          { interestName: "ออกกำลังกาย", category: "custom" },
          { interestName: "Bodybuilding", category: "custom" },
          { interestName: "Nutrition", category: "custom" }
        ],
        MBTI: "ESTJ",
        bio: "Certified fitness trainer specializing in bodybuilding and nutrition",
        rawProfileText: "เป็นเทรนเนอร์ฟิตเนส สอนเพาะกายและให้คำแนะนำด้านโภชนาการ"
      },

      // === ศิลปะ/ดนตรี ===
      {
        username: "artist_painter",
        displayName: "Visual Artist",
        password: "test123",
        interests: [
          { interestName: "Painting", category: "custom" },
          { interestName: "จิตรกรรม", category: "custom" },
          { interestName: "Digital Art", category: "custom" },
          { interestName: "Art Exhibition", category: "custom" }
        ],
        MBTI: "INFP",
        bio: "Visual artist working with both traditional and digital mediums",
        rawProfileText: "เป็นจิตรกร ทำงานทั้งสีน้ำมันและดิจิทัลอาร์ต จัดนิทรรศการศิลปะ"
      },
      {
        username: "musician_jazz",
        displayName: "Jazz Musician",
        password: "test123",
        interests: [
          { interestName: "Jazz", category: "custom" },
          { interestName: "แจ๊ส", category: "custom" },
          { interestName: "Piano", category: "custom" },
          { interestName: "Music Composition", category: "custom" }
        ],
        MBTI: "ISFP",
        bio: "Jazz pianist and composer, performs at local jazz clubs",
        rawProfileText: "เล่นเปียโนแจ๊สและแต่งเพลง แสดงตามคลับแจ๊สในกรุงเทพ"
      }
    ];

    const createdUsers = [];
    
    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ username: userData.username });
      if (existingUser) {
        console.log(`User ${userData.username} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Encrypt rawProfileText
      const encryptedRawText = encrypt(userData.rawProfileText);

      // Create user
      const user = new User({
        ...userData,
        password: hashedPassword,
        rawProfileText: encryptedRawText
      });

      await user.save();
      
      // Index to Qdrant
      await indexUser(extractIndexData(user));
      await indexRawProfile({
        userId: user._id.toString(),
        text: userData.rawProfileText
      });

      createdUsers.push({
        username: userData.username,
        displayName: userData.displayName,
        interests: userData.interests.map(i => i.interestName)
      });
    }

    return NextResponse.json({
      message: "Test users created successfully",
      created: createdUsers.length,
      users: createdUsers
    });
  } catch (error: any) {
    console.error("Create test users error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error?.message || "Unknown error"
    }, { status: 500 });
  }
}