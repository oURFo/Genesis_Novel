import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Endpoint for generating novel chapters
app.post("/api/generate", async (req, res) => {
  try {
    const { startPrompt, pages = [], nextPageNumber, currentCharacter, currentGlossary = [], customApiKey, isEndingMode } = req.body;

    if (!startPrompt) {
      return res.status(400).json({ error: "Missing startPrompt" });
    }

    const effectiveApiKey = customApiKey || req.headers["x-api-key"] || process.env.GEMINI_API_KEY;

    if (!effectiveApiKey) {
      return res.status(400).json({ error: "Gemini API key is missing. Please set it in Settings > Secrets or enter your own key in the application." });
    }

    // Dynamic AI client initialization
    const activeAi = new GoogleGenAI({
      apiKey: effectiveApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Construct the context prompt
    let promptText = `你是一個專業的小說家和角色扮演遊戲(RPG)系統。
【玩家初始設定/提示詞】：
${startPrompt}

`;

    if (pages.length > 0) {
      promptText += `【前情提要 / 已有章節】：\n`;
      pages.forEach((p: any) => {
        promptText += `第 ${p.pageNumber} 頁 - 《${p.title}》\n內容：\n${p.content}\n\n`;
      });
    } else {
      promptText += `【提示】：這是故事的第一頁（第一章）。請根據玩家初始設定，撰寫極具張力、引人入勝的開端！\n`;
    }

    if (currentCharacter) {
      promptText += `【目前主角資料】：
姓名：${currentCharacter.name || "（未定）"}
描述：${currentCharacter.description || "（未定）"}
狀態：${currentCharacter.status || "健康"}
屬性：${JSON.stringify(currentCharacter.attributes || {})}
背包：${JSON.stringify(currentCharacter.inventory || [])}
當前目標：${JSON.stringify(currentCharacter.activeGoals || [])}

`;
    }

    if (currentGlossary && currentGlossary.length > 0) {
      promptText += `【已有世界著名詞與實體清單】：\n`;
      currentGlossary.forEach((g: any) => {
        promptText += `- ${g.name} [${g.category}]: ${g.description}\n`;
      });
      promptText += `\n`;
    }

    if (isEndingMode) {
      promptText += `【💥 CRITICAL INSTRUCTION: 故事終章大結局 💥】：
現在要為這部小說寫下「大結局最終章」。
1. 請在此頁讓故事迎來最終高潮並完美收尾、解答主線懸念，寫下感人、熱血或餘韻悠長的精彩大結局！
2. 章節標題 (chapterTitle) 必須包含「最終章」或「大結局」字樣，例如：「最終章：光芒彼岸」或「大結局：破曉微光」。
3. 內容必須是一個完整而宏大的完結情節，絕對不要再留下新的懸念，讓故事在此頁完全結束。
\n`;
    }

    promptText += `【續寫任務】：
請為主角撰寫第 ${nextPageNumber} 頁的故事。
1. 小說故事內容 (content) 長度絕對不能少於 500 字，必須在 500 至 800 字之間。斷行與段落必須清晰明確，段落與段落之間使用雙換行（空行）分開，避免玩家閱讀困難。文筆要精緻，著重心理描寫、對話和情境氣氛，請用繁體中文撰寫。
2. 小說標題 (novelTitle)：如果是第一章，請原創一個契合故事大綱的宏大小說名稱；若非第一章，請回傳原小說標題即可。
3. 章節標題 (chapterTitle)：本章的子標題，例如：「第一章：命運的交錯」或「第二章：幽谷深處」。如果是在大結局模式下，標題必須體現這是最終章/結局。
4. 主角狀態更新 (characterUpdate)：
   - 請根據本章發展更新主角的屬性、隨身攜帶的道具、當前目標和身體狀態（例如：主角拿到新武器就加入背包；主角受傷了就把生命值扣減，並把狀態改為「受輕傷」；主角達成了舊目標就移除它，並加入新目標）。
   - 請提供符合故事的 attributes（生命值、精神值、境界或實力、特質，值使用字串）。
5. 名詞/實體增量更新 (glossaryUpdates)：
   - 提取本章中新出現的、或有了重大進展的人物、地點、組織、特殊道具。
   - 描述中要寫出他們在本章所扮演的角色或目前已知的秘密。
   - 類別 category 只能是以下之一：'人物', '組織', '地點', '道具', '其他'。`;

    // Define the schema for structured JSON output
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        novelTitle: {
          type: Type.STRING,
          description: "整部小說的總名稱，第一章需原創，後續章節沿用原名稱。"
        },
        chapterTitle: {
          type: Type.STRING,
          description: "本章節/本頁的標題，字數不宜過長，如：第一章：覺醒之風"
        },
        content: {
          type: Type.STRING,
          description: "本章節的小說文本內容，不可少於 500 字，繁體中文，生動感人，段落分明，接續上一頁發展。"
        },
        characterUpdate: {
          type: Type.OBJECT,
          description: "主角在經歷本章情節後的最新資料，必須包含各項更新",
          properties: {
            name: { type: Type.STRING, description: "主角姓名" },
            avatar: { type: Type.STRING, description: "代表主角當前狀態或特質的一個 Emoji 符號，例如⚔️, 🪄, 🩹, 🏕️" },
            description: { type: Type.STRING, description: "主角的最新特徵、身份或最新背景描述" },
            status: { type: Type.STRING, description: "主角當前健康狀態與精神狀態，如：健康、疲憊、靈氣枯竭、輕傷、昏迷" },
            attributes: {
              type: Type.OBJECT,
              properties: {
                "生命值": { type: Type.STRING, description: "主角當前生命值，例如: 95/100, 70/100" },
                "精神值": { type: Type.STRING, description: "主角當前法力/精神/體力狀態，例如: 45/50, 10/100" },
                "境界或實力": { type: Type.STRING, description: "例如：練氣一層、初級魔法師、精疲力竭的一般人" },
                "特質": { type: Type.STRING, description: "主角目前特有的被動屬性或稱號，例如：不屈意志、火焰親和、夜盲症" }
              },
              required: ["生命值", "精神值", "境界或實力", "特質"]
            },
            inventory: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "主角目前隨身攜帶、裝備的道具與裝備清單"
            },
            activeGoals: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "主角當前最核心的任務、計畫或想達成的目標"
            }
          },
          required: ["name", "avatar", "description", "status", "attributes", "inventory", "activeGoals"]
        },
        glossaryUpdates: {
          type: Type.ARRAY,
          description: "本章中新出現，或是已有重大資訊更新的重要專有名詞（人物、地點、組織、法寶或重要道具等），若無新名詞可為空陣列",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "專有名詞名稱，例如：『李長老』、『迷霧森林』、『聚火令』" },
              category: {
                type: Type.STRING,
                description: "類別，必須為：'人物', '組織', '地點', '道具', '其他' 之一"
              },
              description: { type: Type.STRING, description: "該名詞的最新背景設定與在故事中的定位或說明" }
            },
            required: ["name", "category", "description"]
          }
        }
      },
      required: ["novelTitle", "chapterTitle", "content", "characterUpdate", "glossaryUpdates"]
    };

    const response = await activeAi.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.85
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response received from Gemini model.");
    }

    const novelData = JSON.parse(resultText);
    res.json(novelData);
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during chapter generation." });
  }
});

// Configure serving frontend static files or Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

startServer();
