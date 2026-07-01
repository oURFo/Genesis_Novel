/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Character, GlossaryItem, NovelPage } from "./types";

export interface GeneratePayload {
  startPrompt: string;
  pages: { pageNumber: number; title: string; content: string }[];
  nextPageNumber: number;
  currentCharacter: Character | null;
  currentGlossary: GlossaryItem[];
  customApiKey?: string | null;
  isEndingMode?: boolean;
  endingArcStep?: number;
  endingArcTotal?: number;
  // Story arc context
  arcContext?: {
    arcNumber: number;
    arcLength: number;
    positionInArc: number;   // 1-indexed chapter within this arc
    phase: 'transition' | 'development' | 'climax' | 'winding_down';
    mainEvent: string;       // arc's main event/theme
    isNewArc: boolean;       // true if this is the first chapter of a new arc
    prevArcSummary?: string; // brief summary of previous arc's main event
  };
}

/**
 * Builds the context prompt to send to Gemini API
 */
export function buildPromptText(payload: GeneratePayload): string {
  const { startPrompt, pages, nextPageNumber, currentCharacter, currentGlossary, isEndingMode, endingArcStep, endingArcTotal, arcContext } = payload;
  
  let promptText = `你是一個專業的小說家和角色扮演遊戲(RPG)系統。
【玩家初始設定/提示詞】：
${startPrompt}

`;

  if (pages.length > 0) {
    promptText += `【前情提要 / 已有章節】：\n`;
    pages.forEach((p) => {
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
    currentGlossary.forEach((g) => {
      promptText += `- ${g.name} [${g.category}]: ${g.description}\n`;
    });
    promptText += `\n`;
  }

  if (arcContext && !isEndingMode) {
    const phaseDesc: Record<string, string> = {
      transition:   '【銜接過渡期】本章負責承接上一個故事弧，讓讀者自然過渡到本弧的新局面，伏筆逐漸展開但尚未爆發。',
      development:  '【劇情鋪陳期】本章著重深化角色關係、世界觀擴展、推進主軸衝突，節奏穩健，張力逐步累積。',
      climax:       '【高潮爆發期】本章應呈現本弧最激烈的對決、最關鍵的抉擇或最震撼的真相揭露，情緒張力拉至最高點。',
      winding_down: '【收尾過渡期】本章讓高潮餘波漸息，整理本弧的結果與影響，並在結尾埋下引向下一段旅程的種子。'
    };

    promptText += `【📚 故事結構指引 — 第 ${arcContext.arcNumber} 故事弧，第 ${arcContext.positionInArc}/${arcContext.arcLength} 章】
本弧主軸事件：「${arcContext.mainEvent}」
當前階段：${phaseDesc[arcContext.phase]}
${arcContext.prevArcSummary ? `前一弧線回顧：${arcContext.prevArcSummary}` : ''}
${arcContext.isNewArc ? '⚡ 本章為新故事弧的開篇章節，請自然地從上一段落過渡，同時埋下本弧主軸衝突的種子。如需設計本弧的核心主軸，請在 newArcEvent 欄位回傳你設計的本弧主軸事件（30字內）。' : ''}
【重要】不要向讀者明確告知「故事弧」或「結構」等元概念，一切以沉浸式小說敘事呈現。
\n`;
  }

  if (isEndingMode) {
    promptText += `【💥 CRITICAL INSTRUCTION: 故事終章大結局 💥】：
現在要為這部小說寫下「大結局最終章」。
1. 請在此頁讓故事迎來最終高潮並完美收尾、解答主線懸念，寫下感人、熱血或餘韻悠長的精彩大結局！
2. 章節標題 (chapterTitle) 必須包含「最終章」或「大結局」字樣，例如：「最終章：光芒彼岸」或「大結局：破曉微光」。
3. 內容必須是一個完整而宏大的完結情節，絕對不要再留下新的懸念，讓故事在此頁完全結束。
\n`;
  } else if (endingArcStep && endingArcTotal) {
    const climaxStart = Math.floor(endingArcTotal * 0.6);
    promptText += `【📖 史詩大結局弧 - 第 ${endingArcStep}/${endingArcTotal} 章】：
現在正在撰寫大結局篇章弧的第 ${endingArcStep} 章（全弧共 ${endingArcTotal} 章）。
${endingArcStep <= climaxStart
  ? `1. 本章應積極推進主線伏筆收束、人物決心升起、命運走向決戰，為後續高潮鋪墊。`
  : `1. 本章已進入最終決戰/關鍵衝突階段，請呈現驚心動魄的激烈對抗或情感爆發。`
}
2. 絕對不要在本章提前結束故事，必須留有餘韻延伸到下一章（章末應充滿張力與懸念）。
3. 章節標題請體現結局弧氛圍，如「第X章：黎明前的黑暗」，但不可使用「最終章」或「大結局」字樣（那保留給最後一章）。
\n`;
  }

  promptText += `【續寫任務】：
請為主角撰寫第 ${nextPageNumber} 頁的故事。
1. 小說故事內容 (content) 長度絕對不能少於 1000 字，必須在 1000 至 1500 字之間。斷行與段落必須清晰明確，段落與段落之間使用雙換行（空行）分開，避免玩家閱讀困難。文筆要精緻豐富，著重心理描寫、生動對話、場景渲染和情境氣氛，每個段落都要有充實的細節描寫，請用繁體中文撰寫。
2. 小說標題 (novelTitle)：如果是第一章，請原創一個契合故事大綱的宏大小說名稱；若非第一章，請回傳原小說標題即可。
3. 章節標題 (chapterTitle)：本章的子標題，例如：「第一章：命運的交錯」或「第二章：幽谷深處」。如果是在大結局模式下，標題必須體現這是最終章/結局。
4. 主角狀態更新 (characterUpdate)：
   - 請根據本章發展更新主角的屬性、隨身攜帶的道具、當前目標和身體狀態（例如：主角拿到新武器就加入背包；主角受傷了就把生命值扣減，並把狀態改為「受輕傷」；主角達成了舊目標就移除它，並加入新目標）。
   - 請提供符合故事的 attributes（生命值、精神值、境界或實力、特質，值使用字串）。
5. 名詞/實體增量更新 (glossaryUpdates)：
   - 提取本章中新出現的、或有了重大進展的人物、地點、組織、特殊道具。
   - 描述中要寫出他們在本章所扮演的角色或目前已知的秘密。
   - 類別 category 只能是以下之一：'人物', '組織', '地點', '道具', '其他'。`;

  return promptText;
}

/**
 * Returns response schema matching Gemini API format
 */
export function getResponseSchema() {
  return {
    type: "OBJECT",
    properties: {
      novelTitle: {
        type: "STRING",
        description: "整部小說的總名稱，第一章需原創，後續章節沿用原名稱。"
      },
      chapterTitle: {
        type: "STRING",
        description: "本章節/本頁的標題，字數不宜過長，如：第一章：覺醒之風"
      },
      content: {
        type: "STRING",
        description: "本章節的小說文本內容，必須在 1000 至 1500 字之間，繁體中文，文筆精緻豐富，生動感人，段落分明，每段有充實細節，接續上一頁發展。"
      },
      characterUpdate: {
        type: "OBJECT",
        description: "主角在經歷本章情節後的最新資料，必須包含各項更新",
        properties: {
          name: { type: "STRING", description: "主角姓名" },
          avatar: { type: "STRING", description: "代表主角當前狀態或特質的一個 Emoji 符號，例如⚔️, 🪄, 🩹, 🏕️" },
          description: { type: "STRING", description: "主角的最新特徵、身份或最新背景描述" },
          status: { type: "STRING", description: "主角當前健康狀態與精神狀態，如：健康、疲憊、靈氣枯竭、輕傷、昏迷" },
          attributes: {
            type: "OBJECT",
            properties: {
              "生命值": { type: "STRING", description: "主角當前生命值，例如: 95/100, 70/100" },
              "精神值": { type: "STRING", description: "主角當前法力/精神/體力狀態，例如: 45/50, 10/100" },
              "境界或實力": { type: "STRING", description: "例如：練氣一層、初級魔法師、精疲力竭的一般人" },
              "特質": { type: "STRING", description: "主角目前特有的被動屬性或稱號，例如：不屈意志、火焰親和、夜盲症" }
            },
            required: ["生命值", "精神值", "境界或實力", "特質"]
          },
          inventory: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "主角目前隨身攜帶、裝備的道具與裝備清單"
          },
          activeGoals: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "主角當前最核心的任務、計畫或想達成的目標"
          }
        },
        required: ["name", "avatar", "description", "status", "attributes", "inventory", "activeGoals"]
      },
      glossaryUpdates: {
        type: "ARRAY",
        description: "本章中新出現，或是已有重大資訊更新的重要專有名詞（人物、地點、組織、法寶或重要道具等），若無新名詞可為空陣列",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING", description: "專有名詞名稱，例如：『李長老』、『迷霧森林』、『聚火令』" },
            category: {
              type: "STRING",
              description: "類別，必須為：'人物', '組織', '地點', '道具', '其他' 之一"
            },
            description: { type: "STRING", description: "該名詞的最新背景設定與在故事中的定位或說明" }
          },
          required: ["name", "category", "description"]
        }
      },
      newArcEvent: {
        type: "STRING",
        description: "（選填，僅在新故事弧開篇時填寫）請用 30 字以內描述本故事弧的核心主軸事件，例如：「追查暗殺主角的神秘黑衣組織，並揭露其與帝國的關係」。非新弧開篇可省略此欄。"
      }
    },
    required: ["novelTitle", "chapterTitle", "content", "characterUpdate", "glossaryUpdates"]
  };
}
/**
 * Direct client-side generation using custom API key to support 100% serverless static sites
 */
async function generateChapterClientSide(payload: GeneratePayload, apiKey: string): Promise<any> {
  const modelName = "gemini-3.5-flash"; // standard and stable model alias
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  const promptText = buildPromptText(payload);
  const responseSchema = getResponseSchema();
  
  const requestBody = {
    contents: [
      {
        parts: [
          { text: promptText }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 1.0
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = "API Key 呼叫錯誤，請確認 API Key 是否正確。";
    try {
      const errJson = JSON.parse(errorText);
      if (errJson?.error?.message) {
        errorMessage = errJson.error.message;
      }
    } catch (_) {}
    throw new Error(errorMessage);
  }

  const responseData = await response.json();
  const textContent = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!textContent) {
    throw new Error("模型未傳回有效的 JSON 內容，請重試。");
  }

  try {
    return JSON.parse(textContent);
  } catch (e) {
    console.error("Failed to parse dynamic JSON response:", textContent);
    throw new Error("無法解析模型傳回的 JSON 格式，請重試。");
  }
}

/**
 * Primary dispatch function for chapter generation.
 * Falls back to local direct call if user key is available, or uses Express proxy.
 */
export async function generateNovelChapter(payload: GeneratePayload): Promise<any> {
  const customKey = payload.customApiKey;
  
  // If custom API key is present in local, call direct Gemini API to support static GitHub deployment!
  if (customKey && customKey.trim()) {
    return generateChapterClientSide(payload, customKey.trim());
  }

  // Otherwise, use Express server proxy
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startPrompt: payload.startPrompt,
      pages: payload.pages,
      nextPageNumber: payload.nextPageNumber,
      currentCharacter: payload.currentCharacter,
      currentGlossary: payload.currentGlossary,
      isEndingMode: payload.isEndingMode,
      endingArcStep: payload.endingArcStep,
      endingArcTotal: payload.endingArcTotal,
      arcContext: payload.arcContext
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || "伺服器連線失敗或生成章節錯誤。");
  }

  return response.json();
}
