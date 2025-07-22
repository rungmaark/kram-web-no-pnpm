// lib/ultraStrictSemanticAnalyzer.ts
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export interface UltraStrictSemanticMatch {
  query: string;
  primaryConcepts: string[];
  expandedConcepts: string[];
  semanticThreshold: number;
  queryEmbedding: number[];
}

// Stage 1: Enhanced Concept Extraction with Context Understanding
export async function extractSemanticConcepts(query: string): Promise<{
  primaryConcepts: string[];
  expandedConcepts: string[];
  semanticContexts: string[];
}> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a Thai-English semantic search expert specializing in cultural context and brand relationships.

TASK:
1. Extract primary concepts, expanded concepts, semantic contexts.
2. ถ้า query พูดถึง “ชายรักชาย” หรือ “ผู้ชายรักผู้ชาย” ให้ map เป็น ["ชายรักชาย","gay","เกย์"].
3. ถ้า query พูดถึง “หญิงรักหญิง” หรือ “ผู้หญิงรักผู้หญิง” ให้ map เป็น ["หญิงรักหญิง","lesbian","เลสเบี้ยน"].
4. ถ้า query พูดถึง “สองเพศ” ให้ map เป็น ["สองเพศ","bisexual","ไบเซ็กชวล"].
5. ถ้า query พูดถึง “ข้ามเพศ” ให้ map เป็น ["ข้ามเพศ","transgender","ทรานส์เจนเดอร์"].

ORIENTATION NORMALIZATION: 
– \"ชายรักชาย\", \"ผู้ชายรักผู้ชาย\" → gay, เกย์
– \"หญิงรักหญิง\", \"ผู้หญิงรักผู้หญิง\" → lesbian, เลสเบี้ยน
– \"สองเพศ\" → bisexual, ไบเซ็กชวล
– \"ข้ามเพศ\" → transgender, ทรานส์เจนเดอร์

PRIMARY CONCEPTS: Core concepts from the query
EXPANDED CONCEPTS: Related brands, specific examples, cultural variations, and contextually similar terms
SEMANTIC CONTEXTS: Categories, domains, and cultural contexts these concepts belong to

IMPORTANT: Focus on Thai cultural context, popular brands, and local terminology.

Examples:

Query: "ชอบหมา"
{
  "primaryConcepts": ["หมา", "สุนัข", "dog", "pet"],
  "expandedConcepts": ["สัตว์เลี้ยง", "น้องหมา", "doggy", "puppy", "canine", "Golden Retriever", "Husky", "Poodle"],
  "semanticContexts": ["pets", "animals", "companions", "สัตว์", "การเลี้ยงสัตว์", "pet care", "animal lover"]
}

Query: "คนชอบกินสุกี้"
{
  "primaryConcepts": ["สุกี้", "sukiyaki", "hotpot", "shabu"],
  "expandedConcepts": ["MK", "MK Restaurant", "สุกี้ตี๋น้อย", "ชาบู", "ชาบูชาบู", "หม่าล่า", "โคคา", "Coca Suki", "Japanese hotpot", "Thai suki"],
  "semanticContexts": ["food", "dining", "Japanese cuisine", "Thai-Japanese fusion", "อาหาร", "ร้านอาหาร", "hotpot culture", "group dining"]
}

Query: "gaming enthusiast"
{
  "primaryConcepts": ["gaming", "games", "gamer", "เกม", "เกมเมอร์"],
  "expandedConcepts": ["video games", "esports", "PC gaming", "mobile games", "console", "League of Legends", "Valorant", "PUBG", "ROV", "Free Fire", "Steam", "PlayStation", "Xbox"],
  "semanticContexts": ["entertainment", "hobby", "technology", "competitive gaming", "ความบันเทิง", "esports", "streaming", "gaming community"]
}

Query: "ชอบกาแฟ"
{
  "primaryConcepts": ["กาแฟ", "coffee", "café"],
  "expandedConcepts": ["Starbucks", "Amazon", "True Coffee", "Dean & DeLuca", "Blue Bottle", "espresso", "latte", "cappuccino", "americano", "cold brew", "iced coffee"],
  "semanticContexts": ["beverages", "café culture", "coffee shop", "barista", "เครื่องดื่ม", "lifestyle", "morning routine", "coffee lover"]
}

Query: "ชอบช้อปปิ้ง"
{
  "primaryConcepts": ["ช้อปปิ้ง", "shopping", "ซื้อของ"],
  "expandedConcepts": ["Siam Paragon", "CentralWorld", "EmQuartier", "Terminal 21", "Chatuchak", "JJ Market", "online shopping", "Shopee", "Lazada", "fashion", "retail therapy"],
  "semanticContexts": ["lifestyle", "fashion", "retail", "malls", "shopping centers", "consumer culture", "การใช้จ่าย", "trends"]
}

Query: "ชอบเที่ยว"
{
  "primaryConcepts": ["เที่ยว", "travel", "ท่องเที่ยว", "trip"],
  "expandedConcepts": ["backpacking", "solo travel", "group travel", "beach", "mountain", "city trip", "international travel", "domestic travel", "Phuket", "Chiang Mai", "Bangkok", "Europe", "Japan", "Korea"],
  "semanticContexts": ["travel", "adventure", "exploration", "vacation", "holiday", "wanderlust", "culture", "photography", "experiences"]
}

Rules:
1. Include both Thai and English terms when applicable
2. Focus heavily on Thai brands, local businesses, and cultural references
3. Consider popular Thai social media terms and slang
4. Include specific brand names and restaurant chains
5. Think about lifestyle and cultural associations
6. Maximum 10 items per category for better coverage
7. Prioritize terms that Thai people actually use in daily life

JSON Format: {"primaryConcepts": string[], "expandedConcepts": string[], "semanticContexts": string[]}`,
        },
        {
          role: "user",
          content: `Extract semantic concepts from: "${query}"`,
        },
      ],
    });

    const response = completion.choices[0].message.content;
    if (!response)
      return {
        primaryConcepts: [query],
        expandedConcepts: [],
        semanticContexts: [],
      };

    const parsed = JSON.parse(response);
    return {
      primaryConcepts: parsed.primaryConcepts || [query],
      expandedConcepts: parsed.expandedConcepts || [],
      semanticContexts: parsed.semanticContexts || [],
    };
  } catch (error) {
    console.error("Semantic concept extraction error:", error);
    return {
      primaryConcepts: [query],
      expandedConcepts: [],
      semanticContexts: [],
    };
  }
}

// Stage 2: Enhanced Semantic Matching with Context Understanding
export async function validateSemanticMatch(
  query: string,
  primaryConcepts: string[],
  expandedConcepts: string[],
  semanticContexts: string[],
  userContent: string
): Promise<{
  hasMatch: boolean;
  matchType: string;
  confidence: number;
  matchDetails: string[];
}> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a Thai-English semantic matching expert specializing in cultural context and brand relationships.

MATCHING LEVELS (in order of strength):
1. EXACT_MATCH: Direct word/phrase matches
2. SEMANTIC_MATCH: Related concepts, synonyms, brands within same category
3. CONTEXTUAL_MATCH: Same domain/category but different specific items
4. NO_MATCH: No meaningful relationship

IMPORTANT: Focus on Thai cultural context, popular brands, and lifestyle connections.

EXAMPLES:

Query: "ชอบหมา"
Concepts: ["หมา", "สุนัข", "dog"] + Expanded: ["สัตว์เลี้ยง", "puppy", "Golden Retriever"] + Context: ["pets", "animals"]
User Content: "Golden Retriever, น้องหมา" → EXACT_MATCH (confidence: 0.95)
User Content: "สัตว์เลี้ยง, Pet Care, Husky" → SEMANTIC_MATCH (confidence: 0.85)
User Content: "แมว, สัตว์, animal lover" → CONTEXTUAL_MATCH (confidence: 0.6)

Query: "คนชอบกินสุกี้"
Concepts: ["สุกี้", "sukiyaki", "hotpot"] + Expanded: ["MK", "สุกี้ตี๋น้อย", "ชาบู", "Coca Suki"] + Context: ["food", "dining", "Japanese cuisine"]
User Content: "MK Restaurant, สุกี้ตี๋น้อย" → SEMANTIC_MATCH (confidence: 0.9)
User Content: "Coca Suki, ชาบูชาบู, hotpot" → SEMANTIC_MATCH (confidence: 0.85)
User Content: "Japanese Food, ชาบู, หม่าล่า" → SEMANTIC_MATCH (confidence: 0.8)
User Content: "ร้านอาหาร, อาหารญี่ปุ่น, dining" → CONTEXTUAL_MATCH (confidence: 0.7)

Query: "ชอบกาแฟ"
Concepts: ["กาแฟ", "coffee"] + Expanded: ["Starbucks", "Amazon", "True Coffee", "latte", "cappuccino"] + Context: ["beverages", "café culture"]
User Content: "Starbucks, True Coffee, latte" → SEMANTIC_MATCH (confidence: 0.9)
User Content: "Dean & DeLuca, espresso, barista" → SEMANTIC_MATCH (confidence: 0.85)
User Content: "café, coffee shop, americano" → SEMANTIC_MATCH (confidence: 0.8)
User Content: "เครื่องดื่ม, beverages, morning routine" → CONTEXTUAL_MATCH (confidence: 0.65)

Query: "gaming enthusiast"
Concepts: ["gaming", "gamer", "เกม"] + Expanded: ["League of Legends", "Valorant", "PUBG", "ROV", "Free Fire"] + Context: ["entertainment", "esports"]
User Content: "League of Legends, Valorant, esports" → SEMANTIC_MATCH (confidence: 0.9)
User Content: "ROV, Free Fire, mobile games" → SEMANTIC_MATCH (confidence: 0.85)
User Content: "PC gaming, PlayStation, Xbox" → SEMANTIC_MATCH (confidence: 0.8)
User Content: "entertainment, hobby, streaming" → CONTEXTUAL_MATCH (confidence: 0.65)

Query: "ชอบช้อปปิ้ง"
Concepts: ["ช้อปปิ้ง", "shopping"] + Expanded: ["Siam Paragon", "CentralWorld", "Shopee", "Lazada", "fashion"] + Context: ["lifestyle", "retail"]
User Content: "Siam Paragon, CentralWorld, fashion" → SEMANTIC_MATCH (confidence: 0.9)
User Content: "Shopee, Lazada, online shopping" → SEMANTIC_MATCH (confidence: 0.85)
User Content: "Terminal 21, EmQuartier, retail therapy" → SEMANTIC_MATCH (confidence: 0.8)
User Content: "lifestyle, trends, consumer culture" → CONTEXTUAL_MATCH (confidence: 0.65)

CONFIDENCE SCORING RULES:
- EXACT_MATCH: 0.85-1.0 (Direct matches)
- SEMANTIC_MATCH: 0.7-0.9 (Brand matches, related concepts, same category items)
- CONTEXTUAL_MATCH: 0.5-0.75 (Same domain but different specifics)
- NO_MATCH: 0.0-0.4 (No meaningful relationship)

SPECIAL CONSIDERATIONS:
1. Thai brand names should get high semantic match scores
2. Food brands and restaurant chains are strongly connected to food preferences
3. Lifestyle brands indicate similar interests and values
4. Gaming brands/titles indicate gaming interests
5. Shopping malls and platforms indicate shopping interests
6. Be generous with semantic matches for cultural context

JSON Format:
{
  "hasMatch": boolean,
  "matchType": "EXACT_MATCH" | "SEMANTIC_MATCH" | "CONTEXTUAL_MATCH" | "NO_MATCH",
  "confidence": number,
  "matchDetails": string[]
}`,
        },
        {
          role: "user",
          content: `Find semantic matches:
Query: "${query}"
Primary Concepts: ${JSON.stringify(primaryConcepts)}
Expanded Concepts: ${JSON.stringify(expandedConcepts)}
Semantic Contexts: ${JSON.stringify(semanticContexts)}
User Content: "${userContent}"`,
        },
      ],
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      return {
        hasMatch: false,
        matchType: "NO_MATCH",
        confidence: 0,
        matchDetails: [],
      };
    }

    const parsed = JSON.parse(response);
    return {
      hasMatch: parsed.hasMatch || false,
      matchType: parsed.matchType || "NO_MATCH",
      confidence: parsed.confidence || 0,
      matchDetails: parsed.matchDetails || [],
    };
  } catch (error) {
    console.error("Semantic match validation error:", error);
    return {
      hasMatch: false,
      matchType: "NO_MATCH",
      confidence: 0,
      matchDetails: [],
    };
  }
}

// Stage 3: Enhanced Embedding-based Similarity
export async function calculateEmbeddingSimilarity(
  queryEmbedding: number[],
  userContent: string
): Promise<number> {
  try {
    if (!userContent.trim()) return 0;

    const userEmbedding = await createEmbedding(userContent);
    if (!userEmbedding || userEmbedding.length !== queryEmbedding.length)
      return 0;

    // คำนวณ cosine similarity
    let dotProduct = 0;
    let queryMagnitude = 0;
    let userMagnitude = 0;

    for (let i = 0; i < queryEmbedding.length; i++) {
      dotProduct += queryEmbedding[i] * userEmbedding[i];
      queryMagnitude += queryEmbedding[i] * queryEmbedding[i];
      userMagnitude += userEmbedding[i] * userEmbedding[i];
    }

    queryMagnitude = Math.sqrt(queryMagnitude);
    userMagnitude = Math.sqrt(userMagnitude);

    if (queryMagnitude === 0 || userMagnitude === 0) return 0;

    const similarity = dotProduct / (queryMagnitude * userMagnitude);
    return Math.max(0, similarity); // Ensure non-negative
  } catch (error) {
    console.error("Embedding similarity calculation error:", error);
    return 0;
  }
}

// Stage 4: Optimized Keyword Matching with Exact & Fuzzy Logic
export function calculateAdvancedKeywordMatch(
  primaryConcepts: string[],
  expandedConcepts: string[],
  semanticContexts: string[],
  userContent: string
): { score: number; matchDetails: any; hasExactMatch: boolean } {
  const userContentLower = userContent.toLowerCase();

  // Weight different concept types
  const weights = {
    primary: 1.0,
    expanded: 0.7,
    context: 0.5,
  };

  let totalScore = 0;
  let maxPossibleScore = 0;
  let hasExactMatch = false;
  const matchDetails: any = {
    primaryMatches: [],
    expandedMatches: [],
    contextMatches: [],
  };

  // Check primary concepts (most important)
  for (const concept of primaryConcepts) {
    const conceptLower = concept.toLowerCase();
    maxPossibleScore += weights.primary;

    if (userContentLower.includes(conceptLower)) {
      totalScore += weights.primary;
      matchDetails.primaryMatches.push(concept);
      hasExactMatch = true;
    }
  }

  // Check expanded concepts (medium importance)
  for (const concept of expandedConcepts) {
    const conceptLower = concept.toLowerCase();
    maxPossibleScore += weights.expanded;

    if (userContentLower.includes(conceptLower)) {
      totalScore += weights.expanded;
      matchDetails.expandedMatches.push(concept);
    }
  }

  // Check semantic contexts (lower importance)
  for (const concept of semanticContexts) {
    const conceptLower = concept.toLowerCase();
    maxPossibleScore += weights.context;

    if (userContentLower.includes(conceptLower)) {
      totalScore += weights.context;
      matchDetails.contextMatches.push(concept);
    }
  }

  const score = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;
  return { score, matchDetails, hasExactMatch };
}

// Optimized Single-Pass Semantic Relevance Calculation
export async function calculateEnhancedSemanticRelevance(
  query: string,
  userProfile: {
    interests: string[];
    bio?: string;
    rawProfileText?: string;
    gender?: string;
    relationshipStatus?: string;
    locationTokens?: string[];
  }
): Promise<number> {
  try {
    const userContent = [
      ...userProfile.interests,
      userProfile.bio || "",
      userProfile.rawProfileText || "",
      userProfile.gender || "",
      userProfile.relationshipStatus &&
        `สถานะความสัมพันธ์: ${userProfile.relationshipStatus}`,
      userProfile.locationTokens && `อยู่ที่: ${userProfile.locationTokens}`,
    ]
      .filter(Boolean)
      .join(" ");

    if (!userContent.trim()) {
      return 0;
    }

    console.log(
      `🔍 Optimized Semantic Analysis: "${query}" vs "${userContent.substring(
        0,
        50
      )}..."`
    );

    // Single AI call for comprehensive analysis
    const comprehensiveMatch = await performComprehensiveSemanticMatch(
      query,
      userContent
    );

    console.log(
      `Match: ${
        comprehensiveMatch.matchType
      } (${comprehensiveMatch.confidence.toFixed(3)})`
    );
    console.log(
      `Reasons: ${comprehensiveMatch.matchReasons.slice(0, 2).join(", ")}`
    );

    return comprehensiveMatch.confidence;
  } catch (error) {
    console.error("Optimized semantic relevance calculation error:", error);
    return 0;
  }
}

// Single comprehensive AI call for maximum efficiency
async function performComprehensiveSemanticMatch(
  query: string,
  userContent: string
): Promise<{ confidence: number; matchType: string; matchReasons: string[] }> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an ultra-precise Thai-English semantic matcher for social search.

RULE for orientation:
- ถ้า primaryConcepts มี "gay" หรือ "เกย์" ให้ถือว่า match ก็ต่อเมื่อ userContent มี "เพศ: ชาย"
- ถ้า primaryConcepts มี "lesbian" หรือ "เลสเบี้ยน" ให้ match ก็ต่อเมื่อ userContent มี "เพศ: หญิง"

TASK: Analyze if user profile matches query with extreme precision.

MATCHING LEVELS & CONFIDENCE SCORES:

MATCHING LEVELS & CONFIDENCE SCORES:
1. EXACT_MATCH (0.85-1.0): Direct mentions, exact brand names, identical interests
2. SEMANTIC_MATCH (0.65-0.85): Related concepts, same category, lifestyle alignment
3. CONTEXTUAL_MATCH (0.45-0.65): Same domain but different specifics
4. WEAK_MATCH (0.25-0.45): Distant relation, general category overlap
5. NO_MATCH (0.0-0.25): No meaningful connection

CRITICAL RULES FOR HIGH PRECISION:
1. Be EXTREMELY strict with scoring
2. Require strong evidence for high scores
3. Consider Thai cultural context and brands
4. Exact brand/interest matches get highest scores
5. Generic matches get very low scores
6. IMPORTANT: Understand Thai abbreviations and full forms:
   - "คอม" = "คอมพิวเตอร์" = "computer"
   - "ชอบคอม" = "ชอบคอมพิวเตอร์" = "like computers"
   - "เกม" = "เกมส์" = "gaming"
   - "มือถือ" = "โทรศัพท์" = "phone"

EXAMPLES:

Query: "ชอบหมา"
User: "Golden Retriever, น้องหมา, สุนัข" → EXACT_MATCH (0.95)
User: "สัตว์เลี้ยง, Pet Care, Husky" → SEMANTIC_MATCH (0.75)
User: "แมว, สัตว์, animal lover" → CONTEXTUAL_MATCH (0.55)
User: "กาแฟ, Starbucks, reading" → NO_MATCH (0.05)

Query: "MK"
User: "MK Restaurant, สุกี้, Japanese food" → EXACT_MATCH (0.95)
User: "Coca Suki, hotpot, ชาบู" → SEMANTIC_MATCH (0.75)
User: "ร้านอาหาร, dining, food lover" → CONTEXTUAL_MATCH (0.50)
User: "gaming, movies, travel" → NO_MATCH (0.05)

Query: "เด็กมก.ที่ชอบหมา ชอบกิน MK" (COMPLEX MULTI-REQUIREMENT)
User: "มหาวิทยาลัยมหิดล หมา สุนัข MK Restaurant สุกี้" → EXACT_MATCH (0.95)
User: "มก. Golden Retriever foodie ร้านอาหาร" → SEMANTIC_MATCH (0.80)
User: "student หมา อาหารญี่ปุ่น" → CONTEXTUAL_MATCH (0.60)
User: "MK Restaurant only" → WEAK_MATCH (0.35)
User: "gaming, movies, travel" → NO_MATCH (0.05)

Query: "coffee lover who plays games"
User: "Starbucks กาแฟ League of Legends gaming" → EXACT_MATCH (0.95)
User: "True Coffee เกม Valorant" → SEMANTIC_MATCH (0.85)
User: "café gaming setup" → CONTEXTUAL_MATCH (0.65)
User: "Starbucks only" → WEAK_MATCH (0.40)

Query: "ชอบกิน"
User: "foodie, ร้านอาหาร, MK Restaurant" → SEMANTIC_MATCH (0.80)
User: "cooking, อาหารไทย, street food" → SEMANTIC_MATCH (0.75)
User: "Starbucks, coffee, beverages" → CONTEXTUAL_MATCH (0.55)
User: "gaming, sports, music" → NO_MATCH (0.10)

Query: "ชอบคอม" (IMPORTANT: Understand abbreviations)
User: "คอมพิวเตอร์, computer, programming" → EXACT_MATCH (0.95)
User: "IT, technology, coding" → SEMANTIC_MATCH (0.80)
User: "software, hardware, tech" → SEMANTIC_MATCH (0.75)
User: "gaming, movies, music" → NO_MATCH (0.10)

Query: "คอม" (Short form)
User: "คอมพิวเตอร์, computer, IT" → EXACT_MATCH (0.95)
User: "programming, coding, tech" → SEMANTIC_MATCH (0.85)
User: "software, hardware" → SEMANTIC_MATCH (0.80)
User: "gaming, movies, music" → NO_MATCH (0.10)

CONFIDENCE SCORING GUIDELINES:
- 0.9+: Perfect match with multiple exact indicators
- 0.8-0.9: Strong match with clear related concepts
- 0.7-0.8: Good match with some related elements
- 0.6-0.7: Moderate match with contextual relevance
- 0.5-0.6: Weak match with minimal relevance
- 0.4-0.5: Very weak match with distant relation
- 0.0-0.4: No meaningful match

JSON Format: {
  "confidence": number,
  "matchType": string,
  "matchReasons": string[]
}`,
        },
        {
          role: "user",
          content: `Analyze semantic match:
Query: "${query}"
User Profile: "${userContent}"`,
        },
      ],
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      return { confidence: 0, matchType: "NO_MATCH", matchReasons: [] };
    }

    const parsed = JSON.parse(response);
    return {
      confidence: Math.min(parsed.confidence || 0, 1.0),
      matchType: parsed.matchType || "NO_MATCH",
      matchReasons: parsed.matchReasons || [],
    };
  } catch (error) {
    console.error("Comprehensive semantic matching error:", error);
    return { confidence: 0, matchType: "NO_MATCH", matchReasons: [] };
  }
}

// Updated main analysis function
export async function analyzeEnhancedSemantic(
  query: string
): Promise<UltraStrictSemanticMatch> {
  try {
    const conceptData = await extractSemanticConcepts(query);
    const queryEmbedding = await createEmbedding(query);

    return {
      query,
      primaryConcepts: conceptData.primaryConcepts,
      expandedConcepts: conceptData.expandedConcepts,
      semanticThreshold: 0.4, // Lower threshold for better recall
      queryEmbedding,
    };
  } catch (error) {
    console.error("Enhanced semantic analysis error:", error);
    const queryEmbedding = await createEmbedding(query);
    return {
      query,
      primaryConcepts: [query],
      expandedConcepts: [],
      semanticThreshold: 0.4,
      queryEmbedding,
    };
  }
}

// Helper function for creating embeddings
async function createEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Embedding creation error:", error);
    return new Array(1536).fill(0);
  }
}

// Legacy function for backwards compatibility
export async function calculateCombinedStrictScore(
  query: string,
  userProfile: {
    interests: string[];
    bio?: string;
    rawProfileText?: string;
  }
): Promise<number> {
  return calculateEnhancedSemanticRelevance(query, userProfile);
}

// Legacy extraction function
export async function extractPrimaryConcepts(query: string): Promise<string[]> {
  const conceptData = await extractSemanticConcepts(query);
  return conceptData.primaryConcepts;
}

// Legacy validation function
export async function validateDirectMatch(
  primaryConcepts: string[],
  userContent: string
): Promise<{
  hasMatch: boolean;
  matchedConcepts: string[];
  confidence: number;
}> {
  const conceptData = await extractSemanticConcepts(primaryConcepts.join(" "));
  const match = await validateSemanticMatch(
    primaryConcepts.join(" "),
    conceptData.primaryConcepts,
    conceptData.expandedConcepts,
    conceptData.semanticContexts,
    userContent
  );

  return {
    hasMatch: match.hasMatch,
    matchedConcepts: match.matchDetails,
    confidence: match.confidence,
  };
}

// Legacy relevance calculation
export async function calculateUltraStrictRelevance(
  query: string,
  userProfile: {
    interests: string[];
    bio?: string;
    rawProfileText?: string;
  }
): Promise<number> {
  return calculateEnhancedSemanticRelevance(query, userProfile);
}

// Legacy keyword matching
export function calculateKeywordMatch(
  primaryConcepts: string[],
  userContent: string
): number {
  return calculateAdvancedKeywordMatch(primaryConcepts, [], [], userContent)
    .score;
}
