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
  arcNumber?: number; // which arc this page belongs to
}

// A story arc groups a range of chapters under one main event/theme
export interface StoryArc {
  arcNumber: number;
  arcLength: number;     // randomly chosen between 20–40
  startPage: number;     // 1-indexed page number where this arc begins
  mainEvent: string;     // AI-generated theme / main conflict for this arc
}

export interface NovelState {
  title: string;
  startPrompt: string;
  pages: NovelPage[];
  currentPageIndex: number;
}
