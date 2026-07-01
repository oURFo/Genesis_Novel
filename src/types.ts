/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Character {
  name: string;
  avatar: string; // Emoji representing the character
  description: string;
  status: string; // Current health/condition/state (e.g., "健康", "受傷", "靈力充沛")
  attributes: Record<string, string>; // Key-value stats e.g., "力量": "18", "修為": "練氣四層"
  inventory: string[]; // List of items carried
  activeGoals: string[]; // Current quests or objectives
}

export type GlossaryCategory = '人物' | '組織' | '地點' | '道具' | '其他';

export interface GlossaryItem {
  name: string;
  category: GlossaryCategory;
  description: string;
}

export interface NovelPage {
  pageNumber: number;
  title: string;
  content: string;
  characterState: Character;
  glossaryState: GlossaryItem[];
}

export interface NovelState {
  title: string;
  startPrompt: string;
  pages: NovelPage[];
  currentPageIndex: number;
}
