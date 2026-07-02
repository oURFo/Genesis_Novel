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
  customApiKeys?: string[];   // up to 5 keys; rotated on quota errors
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
    // Tiered context: only the most recent chapters are sent in full to cap token usage.
    // Earlier chapters are summarised as titles only — the character state, glossary and
    // arc context already preserve long-term continuity.
    const FULL_CHAPTERS = 4;
    const recentPages = pages.slice(-FULL_CHAPTERS);
    const olderPages  = pages.slice(0, -FULL_CHAPTERS);

    if (olderPages.length > 0) {
      promptText += `【故事歷程概覽（第 1–${olderPages.length} 章，僅標題）】：\n`;
      olderPages.forEach((p) => {
        promptText += `· 第 ${p.pageNumber} 章《${p.title}》\n`;
      });
      promptText += `（以上章節的細節已整合至「主角資料」與「世界名詞」中，無須重複展開。）\n\n`;
    }

    promptText += `【最近章節詳細內容（第 ${recentPages[0].pageNumber}–${recentPages[recentPages.length - 1].pageNumber} 章）】：\n`;
    recentPages.forEach((p) => {
      promptText += `第 ${p.pageNumber} 頁 - 《${p.title}》\n內容：\n${p.content}\n\n`;
    });
  } else {
    promptText += `【提示：第一章開場守則】：
這是故事的第一章，必須從「平凡的起點」切入——不論是小村莊的清晨、破舊的宅院、普通市集或山間小道，請先花大量篇幅描繪主角的日常生活環境與內心世界，讓讀者充分感受到主角目前的「平凡背景」。
❌ 禁止：第一章立即出現重要人物、強力敵人、奇遇或重大事件。
✅ 要求：用細節描寫紮根世界觀，在章節末尾僅可埋下一個微小的伏筆（如：異常的氣息、陌生的傳言、一件小事的不尋常），讓讀者對後續產生好奇即可。\n`;
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

    const pacingNote = arcContext.phase === 'transition' || arcContext.phase === 'development'
      ? `【節奏守則】本章屬鋪陳階段，請務必克制衝突烈度：主角應從小地方（街角、市集、普通任務）出發，透過日常互動、細膩觀察、人際摩擦來推進劇情，不要在本章突然出現超強人物或扭轉全局的大事件。讓緊張感在不知不覺中慢慢積累。\n`
      : '';

    promptText += `【📚 故事結構指引 — 第 ${arcContext.arcNumber} 故事弧，第 ${arcContext.positionInArc}/${arcContext.arcLength} 章】
本弧主軸事件：「${arcContext.mainEvent}」
當前階段：${phaseDesc[arcContext.phase]}
${pacingNote}${arcContext.prevArcSummary ? `前一弧線回顧：${arcContext.prevArcSummary}` : ''}
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
1. 小說故事內容 (content) 長度目標為 1800 至 2500 字（絕對不能少於 1500 字）。段落與段落之間使用雙換行（空行）分開，每段至少 3-5 句，著重心理描寫、生動對話、場景渲染和環境氣氛，避免流水帳。請用繁體中文撰寫。
2. 【循序漸進守則】：除非已到高潮或結局章節，否則主角的際遇應符合「從小地方慢慢發展壯大」的邏輯——先在小鎮、邊境、普通環境發生的事，再逐步接觸到更大的勢力或重要人物。每章節的衝突烈度應比上一章略微遞增，而非每章都是大事件。
3. 小說標題 (novelTitle)：如果是第一章，請原創一個契合故事大綱的宏大小說名稱；若非第一章，請回傳原小說標題即可。
4. 章節標題 (chapterTitle)：本章的子標題，例如：「第一章：命運的交錯」或「第二章：幽谷深處」。如果是在大結局模式下，標題必須體現這是最終章/結局。
5. 主角狀態更新 (characterUpdate)：
   - 請根據本章發展更新主角的屬性、隨身攜帶的道具、當前目標和身體狀態（例如：主角拿到新武器就加入背包；主角受傷了就把生命值扣減，並把狀態改為「受輕傷」；主角達成了舊目標就移除它，並加入新目標）。
   - 請提供符合故事的 attributes（生命值、精神值、境界或實力、特質，值使用字串）。
6. 名詞/實體增量更新 (glossaryUpdates)：
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
        description: "本章節的小說文本內容，目標 1800-2500 字（不得少於 1500 字），繁體中文，文筆精緻豐富，段落分明，每段有充實細節，依據循序漸進守則控制衝突烈度。"
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
 * Attempt generation with a single API key. Throws on any error.
 */
async function tryWithSingleKey(payload: GeneratePayload, apiKey: string): Promise<any> {
  const modelName = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{ parts: [{ text: buildPromptText(payload) }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: getResponseSchema(),
      temperature: 1.0
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    const status = response.status;
    // Always log full details to the browser console for debugging
    console.error(`[Gemini API] HTTP ${status} — raw body:`, errorText.slice(0, 500));

    let errorMessage = `API 呼叫失敗（HTTP ${status}），請稍後重試。`;
    try {
      const errJson = JSON.parse(errorText);
      const rawMsg: string = errJson?.error?.message || "";
      const rawStatus: string = errJson?.error?.status || "";

      if (status === 429 || rawStatus === "RESOURCE_EXHAUSTED" || rawMsg.toLowerCase().includes("quota") || rawMsg.includes("RESOURCE_EXHAUSTED")) {
        errorMessage = "⏳ QUOTA";
      } else if (status === 503 || rawStatus === "UNAVAILABLE" || rawMsg.toLowerCase().includes("overloaded") || rawMsg.toLowerCase().includes("unavailable")) {
        errorMessage = "🔄 BUSY";
      } else if (status === 500) {
        errorMessage = `⚠️ Gemini 伺服器錯誤（500），請稍後重試。`;
      } else if (status === 401 || rawStatus === "UNAUTHENTICATED" || rawMsg.includes("API_KEY_INVALID")) {
        errorMessage = `🔑 第 Key 無效或未授權（401），請重新確認。`;
      } else if (status === 403 || rawStatus === "PERMISSION_DENIED") {
        errorMessage = `🚫 無使用權限（403）：${rawMsg.slice(0, 80)}`;
      } else if (status === 404) {
        errorMessage = `❌ 找不到模型（404）：${rawMsg.slice(0, 80)}`;
      } else if (status === 400) {
        errorMessage = `❌ 請求錯誤（400）：${rawMsg.slice(0, 80)}`;
      } else {
        errorMessage = `AI 錯誤（${status}）：${rawMsg.slice(0, 80)}`;
      }
    } catch (_) {
      errorMessage = `API 回傳非 JSON（HTTP ${status}）：${errorText.slice(0, 80)}`;
    }
    throw new Error(errorMessage);
  }

  const responseData = await response.json();
  const textContent = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textContent) {
    throw new Error("模型未傳回有效的 JSON 內容，請重試。");
  }

  try {
    return JSON.parse(textContent);
  } catch (_) {
    throw new Error("無法解析模型傳回的 JSON 格式，請重試。");
  }
}

/**
 * Direct client-side generation. Rotates through up to 5 keys on quota / busy errors.
 */
async function generateChapterClientSide(payload: GeneratePayload, apiKeys: string[]): Promise<any> {
  const validKeys = apiKeys.map(k => k.trim()).filter(Boolean);
  if (validKeys.length === 0) throw new Error("🔑 請先設定至少一組 Gemini API Key。");

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
  const keyErrors: string[] = [];

  for (let i = 0; i < validKeys.length; i++) {
    try {
      if (i > 0) await sleep(2000);
      console.log(`[Key #${i + 1}] 嘗試中...`);
      return await tryWithSingleKey(payload, validKeys[i]);
    } catch (err: any) {
      const msg: string = err.message || "";
      keyErrors.push(`#${i + 1}: ${msg}`);
      console.warn(`[Key #${i + 1}] 失敗：${msg}`);

      const isQuotaOrBusy = msg.includes("QUOTA") || msg.includes("BUSY");

      if (isQuotaOrBusy && i < validKeys.length - 1) {
        continue; // try next key
      }

      // All keys tried (or non-quota error)
      if (isQuotaOrBusy) {
        throw new Error(
          `⏳ 所有 ${validKeys.length} 組 API Key 均無法使用：\n` +
          keyErrors.join("\n") +
          `\n\n可能原因：同一 Google 帳號金鑰共用配額；或所有帳號今日配額均已耗盡。`
        );
      }

      // Non-quota / non-busy error — pass through as-is
      throw err;
    }
  }

  throw new Error("所有 API Key 均無法使用，請稍後重試。");
}

/**
 * Primary dispatch function for chapter generation.
 * Falls back to local direct call if user key is available, or uses Express proxy.
 */
export async function generateNovelChapter(payload: GeneratePayload): Promise<any> {
  const keys = (payload.customApiKeys || []).filter(k => k.trim());

  // Client-side path: use provided keys (supports static GitHub Pages deployment)
  if (keys.length > 0) {
    return generateChapterClientSide(payload, keys);
  }

  // Server proxy path (Express backend)
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
    const errData = await response.json().catch(() => ({}));
    const rawMsg: string = errData?.error || "";
    let friendly = "伺服器連線失敗或生成章節時發生錯誤，請重試。";
    if (rawMsg.includes("quota") || rawMsg.includes("RESOURCE_EXHAUSTED")) {
      friendly = "⏳ API 配額已達上限，請等待約 1 分鐘後再重試。";
    } else if (rawMsg.includes("overloaded") || rawMsg.includes("UNAVAILABLE")) {
      friendly = "🔄 Gemini 服務目前繁忙，請稍後重試。";
    }
    throw new Error(friendly);
  }

  return response.json();
}
