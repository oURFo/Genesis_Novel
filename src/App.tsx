/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  User, 
  Tag, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  RefreshCw, 
  Play, 
  Activity, 
  Sparkles, 
  MapPin, 
  Bookmark, 
  Compass, 
  Dices, 
  CheckCircle, 
  Luggage, 
  Type, 
  Wand2, 
  ArrowLeft,
  BookMarked,
  Layers,
  Sparkle,
  HelpCircle,
  Clock
} from "lucide-react";
import { Character, GlossaryItem, NovelPage, GlossaryCategory, NovelState, StoryArc } from "./types";

// Preset themes and starting prompts
interface ThemePreset {
  id: string;
  category: string;
  title: string;
  summary: string;
  prompt: string;
  novelTitle: string;
}

const PRESETS: ThemePreset[] = [
  {
    id: "xianxia",
    category: "修真玄幻",
    title: "古戒仙尊",
    summary: "靈根被廢的少年與戒指中萬年仙尊的逆襲神話。",
    novelTitle: "萬古神魔戒",
    prompt: "一個自幼靈根被廢、備受家族冷落的林家少年林飛，在家族後山禁地撿到了一枚生鏽的鐵戒指。當他滴血認主時，戒指突然爆發出驚天玄光，裡面竟然寄宿著一位萬年前因神魔大戰隕落的絕世仙尊靈魂……"
  },
  {
    id: "cyberpunk",
    category: "賽博科幻",
    title: "夜網幽魂",
    summary: "底層義體醫生接上絕密晶片，腦中響起AI覺醒者的聲音。",
    novelTitle: "霓虹覺醒：量子靈魂",
    prompt: "在霓虹永不熄滅的「新東京」貧民窟深處，一個靠接非法晶片維護維持生計的底層義體醫生，意外從一個瀕死的神秘信使身上，拿到了一塊企業巨頭不惜動用死士追殺也要奪回的『量子靈魂記憶體』。在接上自己後腦插槽的瞬間，他的腦海裡響起了一個自稱AI覺醒者的冰冷聲音……"
  },
  {
    id: "fantasy",
    category: "西方奇幻",
    title: "最弱勇者",
    summary: "垃圾農夫職業的勇者，意外挖開了古老黑龍帝王陵墓。",
    novelTitle: "詛咒荒野：農夫黑龍傳說",
    prompt: "被王國大聖堂召喚到異世界的平凡高中生亞倫，在神聖水晶前覺醒天賦時，居然被評定為絕無僅有的垃圾級『農夫』職業。在被國王流放到邊境詛咒荒野的那天，他不小心挖開了一座古老的巨龍陵墓，並觸碰了長眠於此的黑龍帝王徽記……"
  },
  {
    id: "eldritch",
    category: "詭異探秘",
    title: "古神調查員",
    summary: "新英格蘭小鎮的黑霧，與一本沾血且寫著主角名字的皮革手記。",
    novelTitle: "阿卡姆的低語",
    prompt: "1920年代，一場突如其來的黑霧籠罩了新英格蘭的海港小鎮阿卡姆。身為私家偵探的卡特，在調查一件離奇的豪門千金失蹤案時，在地下密室發現了一本用未知皮革裝訂的古老手記。翻開第一頁，上面沾滿了暗綠色的血跡，並用顫抖的筆跡寫著主角自己的名字和今天的日期……"
  }
];

// Prebuilt loading state phrases for high immersive feeling
const LOADING_PHRASES = [
  "正在編織命運的軌跡...",
  "正在凝聚天地靈力...",
  "AI 正在構思驚心動魄的對話...",
  "正在鑄造神秘的強大宿敵...",
  "正在為主角整理背包中的寶物...",
  "正在將新名詞寫入世界編年史...",
  "命運的齒輪開始緩緩轉動...",
  "翻開全新的一頁，世界正在創生..."
];

import { generateNovelChapter } from "./geminiService";
import { 
  Settings, 
  Save, 
  Download, 
  Trash2, 
  Trophy, 
  LogOut, 
  Check, 
  Info 
} from "lucide-react";

export default function App() {
  // Application State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [startPrompt, setStartPrompt] = useState<string>("");
  const [novelTitle, setNovelTitle] = useState<string>("未命名小說");
  const [pages, setPages] = useState<NovelPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  
  // Loading and Error States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState<number>(0);
  
  // Custom API key, Save states and Ending States
  const [customApiKey, setCustomApiKey] = useState<string>(() => localStorage.getItem("user_gemini_api_key") || "");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isEndingMode, setIsEndingMode] = useState<boolean>(false);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [hasSavedSession, setHasSavedSession] = useState<boolean>(false);
  const [savedSessionData, setSavedSessionData] = useState<any>(null);

  // UI Customizations
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [syncState, setSyncState] = useState<'current' | 'latest'>('current');
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | "全部">("全部");
  
  // Mobile UI Tabs ('character' | 'story' | 'glossary')
  const [mobileTab, setMobileTab] = useState<'character' | 'story' | 'glossary'>('story');

  // Prefetch states for background pre-generation of the next chapter
  const [prefetchedPage, setPrefetchedPage] = useState<NovelPage | null>(null);
  const [isPrefetching, setIsPrefetching] = useState<boolean>(false);
  // Stores the in-flight prefetch promise so handleWriteNextChapter can await it
  const prefetchRef = useRef<{ promise: Promise<NovelPage | null>; forPage: number } | null>(null);

  // Ending arc states (20-chapter epic ending generation)
  const ENDING_ARC_TOTAL = 20;
  const [isGeneratingEndingArc, setIsGeneratingEndingArc] = useState<boolean>(false);
  const [endingArcProgress, setEndingArcProgress] = useState<{ current: number; total: number } | null>(null);

  // Story structure arcs
  const [storyArcs, setStoryArcs] = useState<StoryArc[]>([]);
  const [currentArc, setCurrentArc] = useState<StoryArc | null>(null);

  // Glossary popup
  const [selectedGlossaryItem, setSelectedGlossaryItem] = useState<GlossaryItem | null>(null);

  // Chapter list popup
  const [showChapterList, setShowChapterList] = useState<boolean>(false);

  // ── Story Arc helpers ──────────────────────────────────────────────────────

  const randomArcLength = () => Math.floor(Math.random() * 21) + 20; // 20–40

  const getArcPhase = (arc: StoryArc, pageNumber: number): 'transition' | 'development' | 'climax' | 'winding_down' => {
    const pos = pageNumber - arc.startPage + 1;
    const pct = pos / arc.arcLength;
    if (pct <= 0.10) return 'transition';
    if (pct <= 0.60) return 'development';
    if (pct <= 0.85) return 'climax';
    return 'winding_down';
  };

  const getArcContext = (
    nextPageNumber: number,
    arcs: StoryArc[]
  ): { arc: StoryArc; isNewArc: boolean; prevArc: StoryArc | undefined } => {
    const latestArc = arcs[arcs.length - 1];

    if (!latestArc) {
      const newArc: StoryArc = { arcNumber: 1, arcLength: randomArcLength(), startPage: 1, mainEvent: '待 AI 設計' };
      return { arc: newArc, isNewArc: true, prevArc: undefined };
    }

    const arcEnd = latestArc.startPage + latestArc.arcLength - 1;
    if (nextPageNumber > arcEnd) {
      const newArc: StoryArc = { arcNumber: latestArc.arcNumber + 1, arcLength: randomArcLength(), startPage: nextPageNumber, mainEvent: '待 AI 設計' };
      return { arc: newArc, isNewArc: true, prevArc: latestArc };
    }

    return { arc: latestArc, isNewArc: false, prevArc: arcs[arcs.length - 2] };
  };

  // ── End Story Arc helpers ───────────────────────────────────────────────────

  // Load saved session on mount
  useEffect(() => {
    const saved = localStorage.getItem("novel_workshop_autosave");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.pages && parsed.pages.length > 0) {
          setHasSavedSession(true);
          setSavedSessionData(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved session:", e);
      }
    }
  }, []);

  // Autosave to localStorage on any state changes
  useEffect(() => {
    if (isPlaying && pages.length > 0) {
      const stateToSave = {
        novelTitle,
        startPrompt,
        pages,
        currentPageIndex,
        isEnded,
        isEndingMode,
        storyArcs,
        currentArc
      };
      localStorage.setItem("novel_workshop_autosave", JSON.stringify(stateToSave));
    }
  }, [isPlaying, pages, novelTitle, startPrompt, currentPageIndex, isEnded, isEndingMode]);

  // Loading indicator phrase rotator
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Auto-generation hook: when user flips to the unwritten blank draft page, trigger AI續寫 automatically!
  useEffect(() => {
    if (isPlaying && currentPageIndex === pages.length && pages.length > 0 && !isLoading) {
      handleWriteNextChapter();
    }
  }, [currentPageIndex, isPlaying, pages.length]);

  // Handle loading the saved session
  const handleLoadSavedSession = () => {
    if (savedSessionData) {
      setNovelTitle(savedSessionData.novelTitle || "未命名小說");
      setStartPrompt(savedSessionData.startPrompt || "");
      setPages(savedSessionData.pages || []);
      setCurrentPageIndex(savedSessionData.currentPageIndex || 0);
      setIsEnded(savedSessionData.isEnded || false);
      setIsEndingMode(savedSessionData.isEndingMode || false);
      setStoryArcs(savedSessionData.storyArcs || []);
      setCurrentArc(savedSessionData.currentArc || null);
      setIsPlaying(true);
      setError(null);
    }
  };

  // Delete saved session
  const handleDeleteSavedSession = () => {
    if (window.confirm("確定要刪除先前的本機存檔嗎？此動作無法復原。")) {
      localStorage.removeItem("novel_workshop_autosave");
      setHasSavedSession(false);
      setSavedSessionData(null);
    }
  };

  // Handle preset clicks
  const handleSelectPreset = (preset: ThemePreset) => {
    setStartPrompt(preset.prompt);
    setNovelTitle(preset.novelTitle);
  };

  // Roll a random prompt
  const handleRollDice = () => {
    const randomPreset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    handleSelectPreset(randomPreset);
  };

  // Initialize and write Chapter 1
  const handleStartNovel = async () => {
    if (!startPrompt.trim()) {
      setError("請先輸入一段提示詞或選擇下方推薦的主題！");
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsPlaying(true);
    setCurrentPageIndex(0);
    setPages([]);
    setIsEnded(false);
    setIsEndingMode(false);
    setPrefetchedPage(null);
    prefetchRef.current = null;

    try {
      // Initialize the first arc
      const { arc: firstArc } = getArcContext(1, []);

      const data = await generateNovelChapter({
        startPrompt,
        pages: [],
        nextPageNumber: 1,
        currentCharacter: null,
        currentGlossary: [],
        customApiKey,
        isEndingMode: false,
        arcContext: {
          arcNumber: firstArc.arcNumber,
          arcLength: firstArc.arcLength,
          positionInArc: 1,
          phase: 'transition',
          mainEvent: firstArc.mainEvent,
          isNewArc: true,
          prevArcSummary: undefined
        }
      });

      // Save the arc (use AI's newArcEvent if returned)
      const resolvedArc: StoryArc = {
        ...firstArc,
        mainEvent: data.newArcEvent || firstArc.mainEvent
      };
      setStoryArcs([resolvedArc]);
      setCurrentArc(resolvedArc);
      
      // Save Chapter 1 Page
      const newPage: NovelPage = {
        pageNumber: 1,
        title: data.chapterTitle || "第一章：啟航",
        content: data.content,
        characterState: data.characterUpdate,
        glossaryState: data.glossaryUpdates || [],
        arcNumber: resolvedArc.arcNumber
      };

      if (data.novelTitle) {
        setNovelTitle(data.novelTitle);
      }

      setPages([newPage]);
      setCurrentPageIndex(0);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "產生第一章時發生錯誤，請重新嘗試。");
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate next chapter
  const handleWriteNextChapter = async () => {
    const nextPageNumber = pages.length + 1;

    // --- Case 1: Prefetch already completed, use it instantly ---
    if (prefetchedPage && prefetchedPage.pageNumber === nextPageNumber) {
      const page = prefetchedPage;
      prefetchRef.current = null;
      setPrefetchedPage(null);
      setPages(prev => [...prev, page]);
      setCurrentPageIndex(nextPageNumber - 1);
      if (isEndingMode || (page.title && (page.title.includes("最終章") || page.title.includes("大結局") || page.title.includes("結局")))) {
        setIsEnded(true);
      }
      return;
    }

    // --- Case 2: Prefetch is still in progress, wait for it ---
    if (prefetchRef.current && prefetchRef.current.forPage === nextPageNumber) {
      setIsLoading(true);
      setError(null);
      try {
        const page = await prefetchRef.current.promise;
        prefetchRef.current = null;
        setPrefetchedPage(null);
        if (page) {
          setPages(prev => [...prev, page]);
          setCurrentPageIndex(nextPageNumber - 1);
          if (isEndingMode || (page.title && (page.title.includes("最終章") || page.title.includes("大結局") || page.title.includes("結局")))) {
            setIsEnded(true);
          }
          setIsLoading(false);
          return;
        }
      } catch (_) {
        // prefetch failed, fall through to normal generation
      }
      setIsLoading(false);
    }

    // --- Case 3: No prefetch available, generate normally ---
    prefetchRef.current = null;
    setPrefetchedPage(null);
    setIsPrefetching(false);
    setIsLoading(true);
    setError(null);

    const lastPage = pages[pages.length - 1];

    // Compute arc context
    const { arc, isNewArc, prevArc } = getArcContext(nextPageNumber, storyArcs);
    const positionInArc = nextPageNumber - arc.startPage + 1;

    try {
      const data = await generateNovelChapter({
        startPrompt,
        pages: pages.map(p => ({
          pageNumber: p.pageNumber,
          title: p.title,
          content: p.content
        })),
        nextPageNumber,
        currentCharacter: lastPage.characterState,
        currentGlossary: lastPage.glossaryState,
        customApiKey,
        isEndingMode: isEndingMode,
        arcContext: {
          arcNumber: arc.arcNumber,
          arcLength: arc.arcLength,
          positionInArc,
          phase: getArcPhase(arc, nextPageNumber),
          mainEvent: arc.mainEvent,
          isNewArc,
          prevArcSummary: prevArc ? prevArc.mainEvent : undefined
        }
      });

      // Update arc state if new arc started
      let resolvedArc = arc;
      if (isNewArc) {
        resolvedArc = { ...arc, mainEvent: data.newArcEvent || arc.mainEvent };
        setStoryArcs(prev => [...prev, resolvedArc]);
        setCurrentArc(resolvedArc);
      }

      // Merge glossaries
      const mergedGlossaryMap = new Map<string, GlossaryItem>();
      lastPage.glossaryState.forEach(item => mergedGlossaryMap.set(item.name, item));
      if (data.glossaryUpdates && Array.isArray(data.glossaryUpdates)) {
        data.glossaryUpdates.forEach((item: GlossaryItem) => mergedGlossaryMap.set(item.name, item));
      }
      const newGlossaryState = Array.from(mergedGlossaryMap.values());

      const newPage: NovelPage = {
        pageNumber: nextPageNumber,
        title: data.chapterTitle || `第 ${nextPageNumber} 章`,
        content: data.content,
        characterState: data.characterUpdate,
        glossaryState: newGlossaryState,
        arcNumber: resolvedArc.arcNumber
      };

      setPages(prev => [...prev, newPage]);
      setCurrentPageIndex(nextPageNumber - 1);
      
      if (isEndingMode || (data.chapterTitle && (data.chapterTitle.includes("最終章") || data.chapterTitle.includes("大結局") || data.chapterTitle.includes("結局")))) {
        setIsEnded(true);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "續寫小說時發生錯誤，請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  };

  // Restart / Reset
  const handleReset = () => {
    if (window.confirm("確定要重設並開始一本新小說嗎？這將會清除當前所有章節與主角記錄。")) {
      setIsPlaying(false);
      setPages([]);
      setCurrentPageIndex(0);
      setError(null);
      setIsEnded(false);
      setIsEndingMode(false);
      setPrefetchedPage(null);
      prefetchRef.current = null;
      setIsPrefetching(false);
      setIsGeneratingEndingArc(false);
      setEndingArcProgress(null);
      setStoryArcs([]);
      setCurrentArc(null);
      // Clean up autosave when resetting so they don't get prompted for stale session
      localStorage.removeItem("novel_workshop_autosave");
      setHasSavedSession(false);
      setSavedSessionData(null);
    }
  };

  // Background prefetch: generate the next chapter silently while user is reading
  const startPrefetch = (currentPages: NovelPage[], nextPageNum: number, endingMode: boolean) => {
    if (prefetchRef.current?.forPage === nextPageNum) return; // already running for this page

    prefetchRef.current = null;
    setPrefetchedPage(null);
    setIsPrefetching(true);

    const lastPage = currentPages[currentPages.length - 1];

    // Compute arc context for prefetch
    const { arc, isNewArc, prevArc } = getArcContext(nextPageNum, storyArcs);
    const positionInArc = nextPageNum - arc.startPage + 1;

    const promise = generateNovelChapter({
      startPrompt,
      pages: currentPages.map(p => ({ pageNumber: p.pageNumber, title: p.title, content: p.content })),
      nextPageNumber: nextPageNum,
      currentCharacter: lastPage.characterState,
      currentGlossary: lastPage.glossaryState,
      customApiKey,
      isEndingMode: endingMode,
      arcContext: {
        arcNumber: arc.arcNumber,
        arcLength: arc.arcLength,
        positionInArc,
        phase: getArcPhase(arc, nextPageNum),
        mainEvent: arc.mainEvent,
        isNewArc,
        prevArcSummary: prevArc ? prevArc.mainEvent : undefined
      }
    }).then(data => {
      const mergedMap = new Map<string, GlossaryItem>();
      lastPage.glossaryState.forEach(i => mergedMap.set(i.name, i));
      (data.glossaryUpdates || []).forEach((i: GlossaryItem) => mergedMap.set(i.name, i));

      // Update arc state if new arc
      let resolvedArc = arc;
      if (isNewArc) {
        resolvedArc = { ...arc, mainEvent: data.newArcEvent || arc.mainEvent };
        setStoryArcs(prev => {
          const already = prev.find(a => a.arcNumber === resolvedArc.arcNumber);
          return already ? prev : [...prev, resolvedArc];
        });
        setCurrentArc(resolvedArc);
      }

      const page: NovelPage = {
        pageNumber: nextPageNum,
        title: data.chapterTitle || `第 ${nextPageNum} 章`,
        content: data.content,
        characterState: data.characterUpdate,
        glossaryState: Array.from(mergedMap.values()),
        arcNumber: resolvedArc.arcNumber
      };

      if (prefetchRef.current?.forPage === nextPageNum) {
        setPrefetchedPage(page);
        setIsPrefetching(false);
      }
      return page;
    }).catch(err => {
      console.warn("Background prefetch failed (silent):", err);
      if (prefetchRef.current?.forPage === nextPageNum) {
        setIsPrefetching(false);
      }
      return null;
    });

    prefetchRef.current = { promise, forPage: nextPageNum };
  };

  // Trigger prefetch when user is on the latest written page
  useEffect(() => {
    if (!isPlaying || pages.length === 0 || isLoading || isEnded) return;
    if (currentPageIndex !== pages.length - 1) return; // not on the latest page
    if (prefetchRef.current?.forPage === pages.length + 1) return; // already prefetching/done

    startPrefetch(pages, pages.length + 1, isEndingMode);
  }, [currentPageIndex, pages.length, isPlaying, isLoading, isEnded, isEndingMode]);

  // Invalidate prefetch when ending mode toggles (prompt content changes)
  useEffect(() => {
    prefetchRef.current = null;
    setPrefetchedPage(null);
    setIsPrefetching(false);
  }, [isEndingMode]);

  // Generate a full 20-chapter epic ending arc
  const handleGenerateEndingArc = async () => {
    if (!window.confirm(`確定要啟動史詩大結局弧嗎？\n系統將自動連續生成 ${ENDING_ARC_TOTAL} 章結局篇章，完成整部小說的精彩收尾。\n\n生成期間將暫時鎖定翻頁操作，請耐心等待。`)) return;

    // Cancel any in-flight prefetch
    prefetchRef.current = null;
    setPrefetchedPage(null);
    setIsPrefetching(false);
    setIsGeneratingEndingArc(true);
    setError(null);

    let currentPages = [...pages];

    for (let step = 1; step <= ENDING_ARC_TOTAL; step++) {
      setEndingArcProgress({ current: step, total: ENDING_ARC_TOTAL });

      const isLastChapter = step === ENDING_ARC_TOTAL;
      const nextPageNumber = currentPages.length + 1;
      const lastPage = currentPages[currentPages.length - 1];

      try {
        const data = await generateNovelChapter({
          startPrompt,
          pages: currentPages.map(p => ({ pageNumber: p.pageNumber, title: p.title, content: p.content })),
          nextPageNumber,
          currentCharacter: lastPage.characterState,
          currentGlossary: lastPage.glossaryState,
          customApiKey,
          isEndingMode: isLastChapter,
          endingArcStep: isLastChapter ? undefined : step,
          endingArcTotal: isLastChapter ? undefined : ENDING_ARC_TOTAL
        });

        const mergedMap = new Map<string, GlossaryItem>();
        lastPage.glossaryState.forEach(i => mergedMap.set(i.name, i));
        (data.glossaryUpdates || []).forEach((i: GlossaryItem) => mergedMap.set(i.name, i));

        const newPage: NovelPage = {
          pageNumber: nextPageNumber,
          title: data.chapterTitle || `第 ${nextPageNumber} 章`,
          content: data.content,
          characterState: data.characterUpdate,
          glossaryState: Array.from(mergedMap.values())
        };

        currentPages = [...currentPages, newPage];
        // Update pages state progressively so the user can see progress
        setPages([...currentPages]);

        if (isLastChapter) {
          setCurrentPageIndex(newPage.pageNumber - 1);
        }
      } catch (err: any) {
        console.error("Ending arc generation failed at step", step, err);
        setError(`結局弧第 ${step} 章生成失敗：${err.message || "請稍後重試。"}`);
        break;
      }
    }

    setIsEnded(true);
    setIsEndingMode(false);
    setIsGeneratingEndingArc(false);
    setEndingArcProgress(null);
  };

  // Get current active states based on page viewing and sync toggle
  const getActiveCharacter = (): Character | null => {
    if (pages.length === 0) return null;
    
    if (syncState === 'latest' || currentPageIndex >= pages.length) {
      return pages[pages.length - 1].characterState;
    }
    return pages[currentPageIndex].characterState;
  };

  const getActiveGlossary = (): GlossaryItem[] => {
    if (pages.length === 0) return [];
    
    if (syncState === 'latest' || currentPageIndex >= pages.length) {
      return pages[pages.length - 1].glossaryState;
    }
    return pages[currentPageIndex].glossaryState;
  };

  const currentCharacter = getActiveCharacter();
  const currentGlossary = getActiveGlossary();

  // Get glossary items identified on CURRENT page to highlight as "New/Updated on this page"
  const getPageUpdatesForGlossary = (): string[] => {
    if (pages.length === 0 || currentPageIndex >= pages.length) return [];
    
    // If it's the first page, everything in glossary is newly introduced on this page
    if (currentPageIndex === 0) {
      return pages[0].glossaryState.map(g => g.name);
    }

    const previousPageGlossary = pages[currentPageIndex - 1].glossaryState;
    const currentPageGlossary = pages[currentPageIndex].glossaryState;

    // Find terms that are either new or have different descriptions compared to previous page
    return currentPageGlossary.filter(item => {
      const prev = previousPageGlossary.find(p => p.name === item.name);
      return !prev || prev.description !== item.description;
    }).map(g => g.name);
  };

  const glossaryHighlights = getPageUpdatesForGlossary();

  // Filtered glossary items based on category and search
  const filteredGlossary = currentGlossary.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "全部" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Category Colors
  const getCategoryStyles = (category: GlossaryCategory) => {
    switch (category) {
      case "人物":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "組織":
        return "bg-sky-50 text-sky-800 border-sky-200";
      case "地點":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "道具":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "其他":
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  // Status Colors for protagonist state
  const getStatusBadgeStyles = (statusStr: string) => {
    const text = statusStr || "";
    if (text.includes("傷") || text.includes("竭") || text.includes("毒") || text.includes("疲") || text.includes("弱")) {
      return "bg-rose-50 border-rose-200 text-rose-800";
    }
    if (text.includes("突破") || text.includes("覺醒") || text.includes("仙") || text.includes("晉")) {
      return "bg-violet-50 border-violet-200 text-violet-800";
    }
    if (text.includes("充沛") || text.includes("健康") || text.includes("旺盛") || text.includes("完好")) {
      return "bg-emerald-50 border-emerald-200 text-emerald-800";
    }
    return "bg-white border-editorial-border text-ink";
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans selection:bg-editorial-accent/30 selection:text-editorial-accent app-border-layout">
      
      {/* HEADER SECTION */}
      <header className="border-b border-editorial-border bg-paper-dark sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-editorial-accent/10 border border-editorial-accent/30 rounded flex items-center justify-center">
            <BookOpen className="w-5.5 h-5.5 text-editorial-accent" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-serif tracking-wide text-ink flex items-center gap-2">
              虛擬小說產生器
              <span className="text-[11px] bg-editorial-accent/10 border border-editorial-accent/20 text-editorial-accent font-sans font-medium px-2 py-0.5 rounded-xs">
                Gemini AI 協同
              </span>
            </h1>
            <p className="text-[11px] text-ink-light font-mono tracking-wider hidden sm:block uppercase">AI Virtual Novel Workshop</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Always Visible System Settings button */}
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded border border-editorial-border bg-white hover:bg-paper-deep text-xs font-semibold text-ink transition cursor-pointer"
            title="系統設定 & 自訂金鑰"
            id="btn-settings-toggle"
          >
            <Settings className="w-3.5 h-3.5 text-editorial-accent animate-spin-hover" />
            <span className="hidden md:inline">金鑰與系統設定</span>
          </button>

          {isPlaying && (
            <>
              {/* Chapter list button */}
              <button
                onClick={() => setShowChapterList(true)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded border border-editorial-border bg-white hover:bg-paper-deep text-xs font-semibold text-ink transition cursor-pointer"
                title="查看所有章節目錄"
              >
                <Layers className="w-3.5 h-3.5 text-editorial-accent" />
                <span className="hidden md:inline">章節目錄</span>
              </button>
              {/* Font size control */}
              <div className="hidden md:flex items-center bg-white border border-editorial-border rounded p-0.5" id="font-controls">
                <button 
                  onClick={() => setFontSize('sm')}
                  className={`px-2.5 py-1 text-xs rounded-sm ${fontSize === 'sm' ? 'bg-editorial-accent text-white font-bold' : 'text-ink-light hover:text-ink'}`}
                  title="小字體"
                >
                  A-
                </button>
                <button 
                  onClick={() => setFontSize('base')}
                  className={`px-2.5 py-1 text-xs rounded-sm ${fontSize === 'base' ? 'bg-editorial-accent text-white font-bold' : 'text-ink-light hover:text-ink'}`}
                  title="正常字體"
                >
                  A
                </button>
                <button 
                  onClick={() => setFontSize('lg')}
                  className={`px-2.5 py-1 text-xs rounded-sm ${fontSize === 'lg' ? 'bg-editorial-accent text-white font-bold' : 'text-ink-light hover:text-ink'}`}
                  title="大字體"
                >
                  A+
                </button>
                <button 
                  onClick={() => setFontSize('xl')}
                  className={`px-2.5 py-1 text-xs rounded-sm ${fontSize === 'xl' ? 'bg-editorial-accent text-white font-bold' : 'text-ink-light hover:text-ink'}`}
                  title="特大字體"
                >
                  A++
                </button>
              </div>

              {/* Sync timeline toggle */}
              <div className="hidden sm:flex items-center bg-white border border-editorial-border rounded px-2.5 py-1" id="sync-control">
                <span className="text-xs text-ink-light mr-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-editorial-accent" />
                  數據面板：
                </span>
                <button
                  onClick={() => setSyncState(syncState === 'current' ? 'latest' : 'current')}
                  className={`text-xs px-2.5 py-0.5 rounded transition font-medium ${
                    syncState === 'current' 
                      ? 'bg-editorial-accent/10 text-editorial-accent border border-editorial-accent/30' 
                      : 'bg-white text-ink border border-editorial-border'
                  }`}
                  title={syncState === 'current' ? "面板資訊隨目前翻到的頁面章節動態倒退/更新" : "面板資訊一律顯示目前已知的最新狀態"}
                >
                  {syncState === 'current' ? "📅 隨章節同步" : "📈 顯示最新"}
                </button>
              </div>

              {/* Back Lobby / Restart Button */}
              <button 
                id="btn-reset"
                onClick={handleReset}
                className="flex items-center space-x-1 px-3 py-1.5 rounded border border-ink bg-white hover:bg-paper-deep text-xs font-semibold text-ink transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-editorial-accent" />
                <span className="hidden sm:inline">開新小說</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* CHAPTER LIST MODAL */}
      {showChapterList && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="chapter-list-modal">
          <div className="bg-paper border border-editorial-border rounded shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="bg-paper-dark px-6 py-4 border-b border-editorial-border flex items-center justify-between shrink-0">
              <h3 className="font-serif font-bold text-ink flex items-center gap-2">
                <Layers className="w-4 h-4 text-editorial-accent" />
                章節目錄
                <span className="text-[11px] text-ink-light font-sans font-normal ml-1">共 {pages.length} 章</span>
              </h3>
              <button onClick={() => setShowChapterList(false)} className="text-ink-light hover:text-ink text-sm font-bold cursor-pointer">✕</button>
            </div>

            <div className="overflow-y-auto flex-1 p-3 space-y-1.5">
              {pages.map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => { setCurrentPageIndex(idx); setShowChapterList(false); }}
                  className={`w-full text-left px-4 py-3 rounded border transition-all flex items-center gap-3 group ${
                    idx === currentPageIndex
                      ? 'bg-editorial-accent/10 border-editorial-accent text-editorial-accent'
                      : 'bg-white border-editorial-border hover:border-editorial-accent/50 hover:bg-paper text-ink'
                  }`}
                >
                  <span className={`text-xs font-mono shrink-0 w-8 text-right ${idx === currentPageIndex ? 'text-editorial-accent font-bold' : 'text-ink-light'}`}>
                    {page.pageNumber}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-serif font-semibold truncate ${idx === currentPageIndex ? 'text-editorial-accent' : 'text-ink group-hover:text-editorial-accent transition-colors'}`}>
                      {page.title}
                    </p>
                  </div>
                  {idx === currentPageIndex && (
                    <span className="text-[10px] bg-editorial-accent text-white px-1.5 py-0.5 rounded font-bold shrink-0">閱讀中</span>
                  )}
                </button>
              ))}
              {pages.length === 0 && (
                <p className="text-center text-sm text-ink-light font-serif py-8">尚未生成任何章節</p>
              )}
            </div>

            <div className="bg-paper-dark px-6 py-3 border-t border-editorial-border flex justify-end shrink-0">
              <button onClick={() => setShowChapterList(false)} className="px-5 py-2 bg-ink text-white text-xs font-bold rounded hover:bg-neutral-800 transition cursor-pointer">
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="settings-modal">
          <div className="bg-paper border border-editorial-border rounded shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-paper-dark px-6 py-4 border-b border-editorial-border flex items-center justify-between">
              <h3 className="font-serif font-bold text-ink flex items-center gap-2">
                ⚙️ 系統設定 & 金鑰管理
              </h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-ink-light hover:text-ink text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* API Key Form */}
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-widest mb-2 flex items-center justify-between">
                  <span>🔑 自訂 GEMINI API 金鑰</span>
                  {customApiKey ? (
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-sans font-bold">
                      ● 已啟用自訂金鑰
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-sans font-bold">
                      ● 使用系統預設金鑰
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => {
                    setCustomApiKey(e.target.value);
                    localStorage.setItem("user_gemini_api_key", e.target.value);
                  }}
                  placeholder="貼上您的 Gemini API 金鑰 (AI Studio 獲取)..."
                  className="w-full bg-white border border-editorial-border rounded px-3 py-2.5 text-sm text-ink placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-editorial-accent focus:border-editorial-accent transition"
                />
                <p className="text-[11px] text-ink-light mt-2 leading-relaxed font-serif">
                  💡 <strong>安全性說明</strong>：金鑰完全保存在瀏覽器本機 (localStorage) 中。
                  當您自備金鑰後，點擊右上角 Settings 將此專案<strong>打包下載並部署至 GitHub Pages 靜態網站時，即可 100% 免伺服器免費運行！</strong>
                </p>
              </div>

              {/* Save & Restore Info */}
              <div className="pt-4 border-t border-editorial-border">
                <h4 className="text-xs font-bold text-ink uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5 text-editorial-accent" />
                  本機存檔記憶
                </h4>
                <p className="text-xs text-ink-light leading-relaxed font-serif">
                  本系統具備<strong>全自動本機存檔機制</strong>。每次頁面生成、文字翻頁或狀態更新時，故事進度均會即時保存在本機中，下次打開網頁可立即接續閱讀，無須擔心資料遺失。
                </p>
              </div>

              {/* Download / Markdown Export */}
              <div className="pt-4 border-t border-editorial-border">
                <h4 className="text-xs font-bold text-ink uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-editorial-accent" />
                  備份與下載
                </h4>
                <p className="text-xs text-ink-light leading-relaxed font-serif mb-3">
                  您可以將目前編織的小說內容匯出為帶有專有名詞及大綱的完整 Markdown 文件存檔。
                </p>
                <button
                  onClick={() => {
                    const novelText = pages.map(p => `## ${p.title}\n\n${p.content.replace(/\\n/g, '\n')}`).join("\n\n");
                    const blob = new Blob([`# ${novelTitle}\n\n初始起點：\n${startPrompt}\n\n${novelText}`], { type: "text/markdown;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `${novelTitle}.md`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  disabled={pages.length === 0}
                  className="w-full py-2 px-4 bg-white hover:bg-paper text-ink border border-editorial-border rounded text-xs font-semibold font-serif flex items-center justify-center space-x-1.5 transition disabled:opacity-45 disabled:hover:bg-white cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-editorial-accent" />
                  <span>下載當前小說全本文字 (.md)</span>
                </button>
              </div>
            </div>

            <div className="bg-paper-dark px-6 py-4 border-t border-editorial-border flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-5 py-2 bg-ink text-white text-xs font-bold rounded hover:bg-neutral-800 transition cursor-pointer"
              >
                關閉設定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-rose-50 border-b border-rose-200 text-rose-950 px-6 py-3 text-sm flex items-center justify-between" id="error-banner">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            <p className="font-serif"><strong>出錯：</strong>{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-xs underline text-rose-700 hover:text-rose-950 ml-4 font-bold cursor-pointer"
          >
            關閉
          </button>
        </div>
      )}

      {/* LOBBY / INITIALIZATION SCREEN (isPlaying === false) */}
      {!isPlaying ? (
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex flex-col justify-center" id="lobby-view">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center space-x-2 px-3 py-1 rounded-sm bg-editorial-accent/10 border border-editorial-accent/20 text-editorial-accent text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-editorial-accent" />
              <span>無限生成式 RPG 小說工坊</span>
            </div>
            <h2 className="text-3.5xl font-bold font-serif tracking-tight text-ink sm:text-4xl">
              締造你的<span className="text-editorial-accent underline decoration-double decoration-editorial-accent/30 ml-2">虛擬小說傳奇</span>
            </h2>
            <p className="mt-4 text-ink-light text-sm sm:text-base leading-relaxed font-serif max-w-xl mx-auto text-justify-align">
              給予一段故事起點，AI 將為你締造一個波瀾壯闊的世界。
              故事進展中主角的<strong>屬性、健康度、隨身道具</strong>以及<strong>專有名詞世界觀</strong>將在兩側同步更新，隨讀隨記，支援任意翻頁及接續創作。
            </p>
          </div>

          {/* ACTIVE SAVE SESSION DETECTION CARD */}
          {hasSavedSession && savedSessionData && (
            <div className="bg-white border border-editorial-border rounded p-6 mb-8 shadow-xs relative overflow-hidden animate-fade-in">
              <div className="absolute right-0 top-0 bg-editorial-accent text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-bl font-sans">
                📖 本機冒險存檔
              </div>
              <h3 className="text-sm font-bold font-serif text-ink mb-1.5">
                《{savedSessionData.novelTitle}》
              </h3>
              <p className="text-xs text-ink-light font-serif mb-4 leading-relaxed">
                主角：<strong className="text-ink font-bold">{savedSessionData.pages[savedSessionData.pages.length - 1]?.characterState?.name || "未知"}</strong> 
                &nbsp;•&nbsp; 篇幅：<strong className="text-editorial-accent font-bold">{savedSessionData.pages.length}</strong> 章 
                &nbsp;•&nbsp; 目前位置：第 {savedSessionData.currentPageIndex + 1} 頁
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleLoadSavedSession}
                  className="px-6 py-2.5 bg-editorial-accent hover:bg-neutral-800 text-white text-xs font-bold font-serif rounded transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>繼續冒險與閱讀</span>
                </button>
                <button
                  onClick={handleDeleteSavedSession}
                  className="px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold rounded border border-rose-200 transition cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>清除存檔並開新局</span>
                </button>
              </div>
            </div>
          )}

          <div className="bg-paper-dark border border-editorial-border rounded p-6 sm:p-8 shadow-sm relative overflow-hidden">
            
            {/* Input area */}
            <div className="relative mb-6">
              <label className="block text-sm font-bold text-ink mb-2.5 flex justify-between items-center font-serif">
                <span>✍️ 輸入你的故事起點提示詞 (起草世界)</span>
                <button
                  type="button"
                  onClick={handleRollDice}
                  className="text-xs text-editorial-accent hover:text-ink flex items-center space-x-1 bg-white hover:bg-paper border border-editorial-border px-2.5 py-1 rounded transition"
                  title="隨機帶入精彩靈感"
                  id="btn-random-dice"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span className="font-sans font-medium">隨機靈感</span>
                </button>
              </label>
              
              <textarea
                value={startPrompt}
                onChange={(e) => setStartPrompt(e.target.value)}
                placeholder="例如：一個隱居山林的少年，在湖邊洗衣服時，救起了一位自稱是九天仙帝的重傷女子..."
                className="w-full h-36 bg-white border border-editorial-border rounded px-4 py-3.5 text-ink placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-editorial-accent focus:border-editorial-accent transition leading-relaxed resize-none"
                id="start-prompt-input"
              />
            </div>

            {/* Presets Grid */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-ink-light uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5 text-editorial-accent" />
                精選靈感範本 (點擊快速填入)：
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" id="presets-grid">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`text-left p-4 rounded border transition-all duration-200 flex flex-col relative overflow-hidden group ${
                      startPrompt === preset.prompt
                        ? "bg-white border-editorial-accent text-ink ring-1 ring-editorial-accent"
                        : "bg-white border-editorial-border hover:border-editorial-accent text-ink"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-bold text-editorial-accent">{preset.category}</span>
                      <span className="text-[10px] bg-paper-deep text-ink-light px-2 py-0.5 rounded font-serif">《{preset.novelTitle}》</span>
                    </div>
                    <h4 className="text-sm font-bold font-serif text-ink group-hover:text-editorial-accent transition-colors">{preset.title}</h4>
                    <p className="text-xs text-ink-light mt-1.5 line-clamp-1 font-serif group-hover:text-ink transition-colors">{preset.summary}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Start button */}
            <div className="flex justify-center">
              <button
                onClick={handleStartNovel}
                disabled={isLoading}
                className="w-full sm:w-auto px-12 py-4 bg-ink hover:bg-neutral-800 text-white font-serif font-bold rounded transition shadow-sm hover:shadow-md flex items-center justify-center space-x-2.5 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                id="btn-start"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-editorial-accent" />
                    <span>正在創生小說世界...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-editorial-accent" />
                    <span>開始創生世界 · 開啟首章</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
      ) : (
        /* PLAYING NOVEL ACTIVE VIEW (isPlaying === true) */
        <main className="flex-1 w-full max-w-[1500px] mx-auto px-4 py-4 flex flex-col lg:grid lg:grid-cols-12 gap-5 overflow-hidden">
          
          {/* ENDING ARC PROGRESS OVERLAY */}
          {isGeneratingEndingArc && endingArcProgress && (
            <div className="fixed inset-0 bg-neutral-900/75 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
              <div className="bg-paper border border-editorial-border rounded shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                <div className="bg-rose-950 px-6 py-4 flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
                  <h3 className="font-serif font-bold text-white text-base">史詩大結局生成中</h3>
                </div>
                <div className="p-6 space-y-5">
                  <p className="text-sm text-ink font-serif leading-relaxed text-center">
                    AI 正在精心撰寫結局弧第
                    <span className="text-2xl font-bold text-editorial-accent mx-2 font-serif">{endingArcProgress.current}</span>
                    章，共 {endingArcProgress.total} 章
                  </p>

                  {/* Progress bar */}
                  <div className="w-full bg-paper-deep rounded-full h-3 border border-editorial-border overflow-hidden">
                    <div
                      className="h-full bg-editorial-accent transition-all duration-700 ease-out rounded-full"
                      style={{ width: `${(endingArcProgress.current / endingArcProgress.total) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-ink-light font-mono">
                    <span>第 {endingArcProgress.current} / {endingArcProgress.total} 章</span>
                    <span>{Math.round((endingArcProgress.current / endingArcProgress.total) * 100)}% 完成</span>
                  </div>

                  <div className="bg-rose-50 border border-rose-200 rounded p-3 text-center">
                    <p className="text-xs text-rose-800 font-serif animate-pulse">
                      {endingArcProgress.current <= Math.floor(endingArcProgress.total * 0.4)
                        ? "📖 佈局收束各條伏筆，命運走向交匯..."
                        : endingArcProgress.current <= Math.floor(endingArcProgress.total * 0.7)
                          ? "⚔️ 最終決戰序幕拉開，高潮漸近..."
                          : endingArcProgress.current < endingArcProgress.total
                            ? "🔥 決戰白熱化，史詩結局即將揭幕..."
                            : "✨ 撰寫最終章，完美收尾故事..."}
                    </p>
                  </div>

                  <p className="text-[11px] text-ink-light text-center font-serif">
                    翻頁操作已暫時鎖定，生成完畢後將自動跳至最終章
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* MOBILE TABS (only visible under lg screen) */}
          <div className="lg:hidden flex border border-editorial-border mb-2 p-0.5 bg-paper-dark rounded" id="mobile-tabs">
            <button
              onClick={() => setMobileTab('character')}
              className={`flex-1 py-2.5 rounded text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                mobileTab === 'character' ? 'bg-white text-editorial-accent border border-editorial-border shadow-xs' : 'text-ink-light'
              }`}
            >
              <User className="w-4 h-4" />
              <span>主角資料</span>
              {currentCharacter && (
                <span className="text-[10px] ml-1 bg-paper-deep px-1.5 py-0.25 rounded text-ink-light font-mono">
                  {currentCharacter.avatar}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileTab('story')}
              className={`flex-1 py-2.5 rounded text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                mobileTab === 'story' ? 'bg-white text-editorial-accent border border-editorial-border shadow-xs' : 'text-ink-light'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>小說故事</span>
              <span className="text-[10px] ml-1 bg-paper-deep px-1.5 py-0.25 rounded text-ink-light font-mono">
                {currentPageIndex < pages.length ? `P.${currentPageIndex + 1}` : "Draft"}
              </span>
            </button>
            <button
              onClick={() => setMobileTab('glossary')}
              className={`flex-1 py-2.5 rounded text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                mobileTab === 'glossary' ? 'bg-white text-editorial-accent border border-editorial-border shadow-xs' : 'text-ink-light'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>名詞資訊</span>
              <span className="text-[10px] ml-1 bg-paper-deep px-1.5 py-0.25 rounded text-ink-light font-mono">
                {currentGlossary.length}
              </span>
            </button>
          </div>

          {/* LEFT SIDEBAR: PROTAGONIST PROFILE (lg:col-span-3) */}
          <section 
            id="character-sidebar"
            className={`${
              mobileTab === 'character' ? 'block' : 'hidden lg:block'
            } lg:col-span-3 bg-paper-dark border border-editorial-border rounded p-5 flex flex-col h-[calc(100vh-130px)] lg:h-[calc(100vh-100px)] overflow-y-auto shadow-xs`}
          >
            {currentCharacter ? (
              <div className="space-y-5">
                {/* Header title */}
                <div className="sidebar-title flex items-center justify-between pb-2 border-b border-editorial-border">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-editorial-accent flex items-center space-x-2">
                    <User className="w-4 h-4 text-editorial-accent" />
                    <span>主角檔案</span>
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-editorial-border text-ink-light font-mono">
                    {syncState === 'current' ? `第 ${currentPageIndex + 1} 頁` : "最新"}
                  </span>
                </div>

                {/* Avatar and Name */}
                <div className="flex items-center space-x-3.5 bg-white p-3.5 rounded border border-editorial-border">
                  <div className="w-14 h-14 bg-paper-deep border border-editorial-border rounded flex items-center justify-center text-3xl select-none">
                    {currentCharacter.avatar || "👤"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-ink truncate font-serif">{currentCharacter.name || "（待定）"}</h4>
                    <p className="text-[11px] text-editorial-accent font-sans font-medium mt-1 leading-none">
                      {currentCharacter.attributes?.["境界或實力"] || "一般冒險者"}
                    </p>
                  </div>
                </div>

                {/* Status indicator */}
                <div>
                  <h5 className="text-[11px] font-bold text-ink-light uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-editorial-accent" />
                    身體與精神狀態
                  </h5>
                  <div className={`p-3 rounded border text-xs font-medium ${getStatusBadgeStyles(currentCharacter.status)}`}>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      <span>{currentCharacter.status || "正常"}</span>
                    </div>
                  </div>
                </div>

                {/* Character description */}
                <div>
                  <h5 className="text-[11px] font-bold text-ink-light uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5 text-editorial-accent" />
                    人物簡述
                  </h5>
                  <p className="text-xs text-ink-light leading-relaxed bg-white p-3 rounded border border-editorial-border font-serif text-justify-align">
                    {currentCharacter.description || "（尚無描述）"}
                  </p>
                </div>

                {/* Attributes (鍵值對屬性 - 改為精緻虛線行樣式) */}
                <div>
                  <h5 className="text-[11px] font-bold text-ink-light uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-editorial-accent" />
                    主角屬性與境界
                  </h5>
                  <div className="space-y-2">
                    {Object.entries(currentCharacter.attributes || {}).map(([key, value]) => {
                      if (key === "境界或實力" || key === "特質") return null;
                      return (
                        <div key={key} className="dashed-border flex justify-between items-baseline text-xs pb-1">
                          <span className="text-ink-light font-serif font-medium">{key}</span>
                          <span className="text-ink font-bold font-mono text-sm">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                  {currentCharacter.attributes?.["特質"] && (
                    <div className="mt-3">
                      <span className="item-name" style={{ fontSize: '11px', color: '#999' }}>當前天賦 / 特質</span>
                      <div className="flex flex-wrap mt-1">
                        <span className="trait-tag">{currentCharacter.attributes["特質"]}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Inventory 背包物品 */}
                <div>
                  <h5 className="text-[11px] font-bold text-ink-light uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Luggage className="w-3.5 h-3.5 text-editorial-accent" />
                    隨身攜帶物品
                  </h5>
                  {currentCharacter.inventory && currentCharacter.inventory.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5" id="inventory-list">
                      {currentCharacter.inventory.map((item, index) => (
                        <span 
                          key={index} 
                          className="text-xs px-2.5 py-1 rounded bg-white border border-editorial-border text-ink shadow-2xs flex items-center gap-1"
                        >
                          💼 {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic bg-white p-3 rounded border border-editorial-border text-center">
                      背包中空空如也
                    </p>
                  )}
                </div>

                {/* Active Goals 當前目標 */}
                <div>
                  <h5 className="text-[11px] font-bold text-ink-light uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-editorial-accent" />
                    當前探索任務
                  </h5>
                  {currentCharacter.activeGoals && currentCharacter.activeGoals.length > 0 ? (
                    <ul className="space-y-1.5 text-xs" id="active-goals-list">
                      {currentCharacter.activeGoals.map((goal, index) => (
                        <li 
                          key={index} 
                          className="flex items-start space-x-2 bg-white p-2.5 rounded border border-editorial-border text-ink-light leading-relaxed font-serif"
                        >
                          <span className="text-editorial-accent font-bold mt-0.5 shrink-0">→</span>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic bg-white p-3 rounded border border-editorial-border text-center font-serif">
                      暫無核心探索任務
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center font-serif">
                <User className="w-8 h-8 opacity-40 mb-2 text-editorial-accent" />
                <p className="text-xs">等待創生首頁故事...</p>
              </div>
            )}
          </section>

          {/* CENTER PANEL: NOVEL WRITING CANVAS & PAGES (lg:col-span-6) */}
          <section 
            id="story-canvas"
            className={`${
              mobileTab === 'story' ? 'flex' : 'hidden lg:flex'
            } lg:col-span-6 flex-col min-h-[450px] lg:h-[calc(100vh-100px)] overflow-hidden`}
          >
            {/* Novel Title Header */}
            <div className="bg-paper-dark border border-editorial-border rounded p-4 mb-4 shadow-xs flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[10px] text-editorial-accent font-bold uppercase tracking-widest block mb-0.5">虛擬小說連載中</span>
                <h3 className="text-lg font-bold text-ink font-serif truncate" title={novelTitle}>
                  《{novelTitle}》
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-white border border-editorial-border text-ink px-3 py-1 rounded font-serif flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-editorial-accent" />
                  頁碼 {currentPageIndex + 1}
                </span>
              </div>
            </div>

            {/* Book Body (Sepia Scroll paper theme) */}
            <div className="flex-1 bg-paper text-ink rounded p-6 sm:p-10 overflow-y-auto relative shadow-xs flex flex-col border border-editorial-border">
              
              {/* Actual page display */}
              {isLoading ? (
                /* LOADING COVER */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10" id="canvas-loading">
                  <div className="w-16 h-16 relative mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-editorial-border" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-editorial-accent animate-spin" />
                    <Wand2 className="w-6 h-6 text-editorial-accent absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <h4 className="text-base font-bold text-ink tracking-wide mb-2 animate-pulse font-serif">
                    {LOADING_PHRASES[loadingPhraseIndex]}
                  </h4>
                  <p className="text-xs text-ink-light max-w-sm font-serif">
                    AI 正在分析已發生的情節軌跡，同步運算主角屬性增長與名詞解密。
                  </p>
                </div>
              ) : currentPageIndex < pages.length ? (
                /* WRITTEN PAGE */
                <div className="relative z-10 flex flex-col h-full" id={`novel-page-content-${currentPageIndex}`}>
                  {/* Chapter header title */}
                  <div className="text-center pb-5 mb-8 border-b border-editorial-border">
                    <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight font-serif">
                      {pages[currentPageIndex].title}
                    </h2>
                    <span className="text-[11px] text-editorial-accent font-serif tracking-widest mt-2 block uppercase">
                      —— PAGE {pages[currentPageIndex].pageNumber} ——
                    </span>
                  </div>

                  {/* Font Size Dynamic Mapping */}
                  <div className={`flex-1 text-ink font-serif leading-loose tracking-wide overflow-y-auto pr-1 text-justify-align ${
                    fontSize === 'sm' ? 'text-sm' : 
                    fontSize === 'base' ? 'text-[17px]' : 
                    fontSize === 'lg' ? 'text-[20px]' : 'text-[23px]'
                  }`}>
                    {/* Render paragraph by paragraph with extra clear and beautiful spacing */}
                    {pages[currentPageIndex].content ? (
                      <div className="space-y-6 sm:space-y-7 md:space-y-8">
                        {pages[currentPageIndex].content
                          .replace(/\\n/g, '\n')
                          .split("\n").map((para, idx) => {
                          const trimmed = para.trim();
                          if (!trimmed) return null;
                          
                          // Custom first-character drop-cap decoration for first paragraph
                          if (idx === 0 && trimmed.length > 0) {
                            const firstChar = trimmed.charAt(0);
                            const remainingText = trimmed.substring(1);
                            return (
                              <p key={idx} className="text-justify leading-relaxed md:leading-loose text-[16px] sm:text-[18px] md:text-[19px] text-slate-800">
                                <span className="float-left text-4xl sm:text-5xl font-bold text-editorial-accent mr-3 mt-1.5 leading-none font-serif bg-paper-deep border border-editorial-border px-2.5 py-1.5 rounded-xs">
                                  {firstChar}
                                </span>
                                {remainingText}
                              </p>
                            );
                          }

                          return (
                            <p key={idx} className="text-justify indent-8 leading-relaxed md:leading-loose text-[16px] sm:text-[18px] md:text-[19px] text-slate-800">
                              {trimmed}
                            </p>
                          );
                        })}

                        {/* HIGHLY IMMERSIVE STORY FINALE GLORIOUS CONTAINER */}
                        {isEnded && currentPageIndex === pages.length - 1 && (
                          <div className="mt-12 p-8 border-2 border-double border-editorial-accent bg-rose-50/20 rounded text-center animate-fade-in" id="finale-screen">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-editorial-accent text-white rounded-full mb-4 shadow">
                              <Trophy className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold font-serif text-ink tracking-wide mb-2">
                              🎉 傳奇之書 · 圓滿大結局 🎉
                            </h3>
                            <p className="text-xs text-ink-light font-serif mb-6 leading-relaxed max-w-md mx-auto">
                              冒險在此完美收尾！主角「{currentCharacter?.name}」的英雄史詩已在時間長河中劃下句點，並被編入世界著名的專名大典中。感謝您的編織！
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <button
                                onClick={() => {
                                  const novelText = pages.map(p => `## ${p.title}\n\n${p.content.replace(/\\n/g, '\n')}`).join("\n\n");
                                  const blob = new Blob([`# ${novelTitle}\n\n初始起點：\n${startPrompt}\n\n${novelText}`], { type: "text/markdown;charset=utf-8" });
                                  const url = URL.createObjectURL(blob);
                                  const link = document.createElement("a");
                                  link.href = url;
                                  link.download = `${novelTitle}.md`;
                                  link.click();
                                  URL.revokeObjectURL(url);
                                }}
                                className="px-5 py-2.5 bg-editorial-accent hover:bg-neutral-800 text-white text-xs font-serif font-bold rounded transition cursor-pointer flex items-center justify-center space-x-1.5"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>📥 下載小說全本文字 (.md)</span>
                              </button>
                              <button
                                onClick={() => {
                                  setIsEnded(false);
                                  setIsEndingMode(false);
                                }}
                                className="px-5 py-2.5 bg-white border border-editorial-border hover:bg-paper text-ink text-xs font-serif font-medium rounded transition cursor-pointer flex items-center justify-center space-x-1.5"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>繼續自由續寫（無盡模式）</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="italic text-ink-light text-center py-10 font-serif">本頁無內容</p>
                    )}
                  </div>
                </div>
              ) : (
                /* UNWRITTEN BLANK DRAFT PAGE */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8 relative z-10" id="blank-page-draft">
                  <div className="w-16 h-16 bg-paper-deep border border-editorial-border rounded-full flex items-center justify-center text-editorial-accent mb-5 animate-bounce">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  
                  <h4 className="text-lg font-bold text-ink font-serif tracking-wide mb-2.5">
                    第 {currentPageIndex + 1} 頁是空白的
                  </h4>
                  <p className="text-xs text-ink-light max-w-md leading-relaxed mb-8 font-serif">
                    這是尚未書寫的空白命運之頁。當您在此翻開時，系統已自動為您請求 AI 接續書寫，請靜候創生。
                  </p>

                  <button
                    onClick={handleWriteNextChapter}
                    disabled={isLoading}
                    className="px-8 py-3.5 bg-ink hover:bg-neutral-800 text-white font-serif font-bold rounded shadow-sm hover:shadow-md cursor-pointer flex items-center space-x-2 transition transform hover:scale-102 uppercase tracking-wider text-xs"
                    id="btn-draft-generate"
                  >
                    <Sparkles className="w-4 h-4 text-editorial-accent" />
                    <span>🪄 手動觸發 AI 續寫第 {currentPageIndex + 1} 頁</span>
                  </button>
                </div>
              )}
            </div>

            {/* PAGINATION NAVIGATION BOTTOM PANEL WITH ENDING MODE TOGGLE */}
            <div className="mt-4 bg-paper-dark border border-editorial-border rounded p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentPageIndex === 0 || isLoading || isGeneratingEndingArc}
                className="flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-paper text-ink rounded border border-editorial-border text-xs font-semibold disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer"
                id="btn-prev-page"
              >
                <ChevronLeft className="w-4 h-4 text-editorial-accent" />
                <span>上一頁</span>
              </button>

              <span className="text-xs text-ink-light font-serif font-medium">
                頁碼：{currentPageIndex + 1} / <span className="text-editorial-accent font-bold">{pages.length + 1}</span> 頁
                {currentPageIndex >= pages.length && (
                  <span className="text-editorial-accent text-[10px] font-bold ml-2 animate-pulse bg-editorial-accent/10 border border-editorial-accent/20 px-1.5 py-0.5 rounded">
                    正在續寫空白頁...
                  </span>
                )}
                {currentPageIndex < pages.length && isPrefetching && (
                  <span className="text-emerald-600 text-[10px] font-bold ml-2 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded animate-pulse">
                    ⚡ 下一章預備中...
                  </span>
                )}
                {currentPageIndex < pages.length && prefetchedPage && !isPrefetching && (
                  <span className="text-emerald-700 text-[10px] font-bold ml-2 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    ✓ 下一章已就緒
                  </span>
                )}
              </span>

              {/* IMMERSIVE ENDING MODE CONTROL */}
              <div className="flex items-center space-x-2 bg-white border border-editorial-border rounded px-3 py-1.5" id="ending-mode-toggle">
                <span className="text-xs text-ink-light font-serif flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-editorial-accent" />
                  大結局：
                </span>
                <button
                  onClick={handleGenerateEndingArc}
                  disabled={pages.length === 0 || isLoading || isGeneratingEndingArc || isEnded}
                  className="text-xs px-2.5 py-0.5 rounded transition font-bold font-serif bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title={`啟動後系統將自動生成 ${ENDING_ARC_TOTAL} 章結局篇章完成整部小說`}
                >
                  {isEnded ? "✅ 已完結" : `🔥 啟動史詩大結局 (${ENDING_ARC_TOTAL}章)`}
                </button>
              </div>

              <button
                onClick={() => setCurrentPageIndex((prev) => Math.min(pages.length, prev + 1))}
                disabled={currentPageIndex >= pages.length || isLoading || isGeneratingEndingArc}
                className="flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-paper text-ink rounded border border-editorial-border text-xs font-semibold disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer"
                id="btn-next-page"
              >
                <span>下一頁</span>
                <ChevronRight className="w-4 h-4 text-editorial-accent" />
              </button>
            </div>
          </section>

          {/* RIGHT SIDEBAR: WORLD GLOSSARY & NOUNS (lg:col-span-3) */}
          <section 
            id="glossary-sidebar"
            className={`${
              mobileTab === 'glossary' ? 'flex' : 'hidden lg:flex'
            } lg:col-span-3 bg-paper-dark border border-editorial-border rounded p-5 flex-col h-[calc(100vh-130px)] lg:h-[calc(100vh-100px)] overflow-hidden shadow-xs`}
          >
            {/* Header Title */}
            <div className="sidebar-title flex items-center justify-between pb-2 border-b border-editorial-border mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-editorial-accent flex items-center space-x-2">
                <Tag className="w-4 h-4 text-editorial-accent" />
                <span>世界名詞資訊</span>
              </h3>
              <span className="text-[10px] bg-white border border-editorial-border px-2 py-0.5 rounded text-ink-light font-mono">
                {currentGlossary.length} 個收錄
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mb-3.5 shrink-0" id="glossary-search-container">
              <Search className="w-4 h-4 text-editorial-accent absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜尋人物、地點、組織..."
                className="w-full bg-white border border-editorial-border rounded pl-9 pr-3 py-2 text-xs text-ink placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-editorial-accent/30 focus:border-editorial-accent transition"
              />
            </div>

            {/* Category Filter Pills (Scrollable) */}
            <div className="flex overflow-x-auto space-x-1 mb-4 pb-1.5 shrink-0 scrollbar-none" id="glossary-category-pills">
              {["全部", "人物", "組織", "地點", "道具", "其他"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat as any)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-sm border transition shrink-0 cursor-pointer uppercase tracking-wider ${
                    selectedCategory === cat
                      ? "bg-editorial-accent text-white border-editorial-accent"
                      : "bg-white border-editorial-border text-ink-light hover:border-editorial-accent hover:text-ink"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List of Nouns */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5 min-h-0" id="glossary-list">
              {filteredGlossary.length > 0 ? (
                filteredGlossary.map((item, idx) => {
                  const isHighlighted = glossaryHighlights.includes(item.name);
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedGlossaryItem(item)}
                      className={`p-3.5 rounded border transition-all duration-200 relative overflow-hidden cursor-pointer hover:shadow-sm ${
                        isHighlighted 
                          ? "border-editorial-accent bg-editorial-accent/5 hover:bg-editorial-accent/10" 
                          : "border-editorial-border bg-white hover:border-editorial-accent/50 hover:bg-paper"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 relative z-10">
                        <span className="font-bold text-sm text-ink flex items-center gap-1.5 font-serif">
                          {item.name}
                          {isHighlighted && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] bg-editorial-accent text-white font-sans font-bold px-1 py-0.25 rounded-sm animate-pulse">
                              <Sparkle className="w-2.5 h-2.5 fill-current" />
                              更新
                            </span>
                          )}
                        </span>
                        
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-widest font-sans font-bold ${getCategoryStyles(item.category)}`}>
                          {item.category}
                        </span>
                      </div>
                      
                      <p className="text-xs text-ink-light leading-relaxed font-serif text-justify-align">
                        {item.description}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-400 shrink-0 font-serif">
                  <HelpCircle className="w-6 h-6 text-editorial-accent/40 mx-auto mb-2" />
                  <p className="text-xs">此分類下無名詞項目</p>
                </div>
              )}
            </div>
          </section>

        </main>
      )}

      {/* GLOSSARY ITEM POPUP MODAL */}
      {selectedGlossaryItem && (
        <div
          className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedGlossaryItem(null)}
        >
          <div
            className="bg-paper border border-editorial-border rounded shadow-xl max-w-lg w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-paper-dark px-6 py-4 border-b border-editorial-border flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-2xl select-none shrink-0">
                  {selectedGlossaryItem.category === "人物" ? "👤"
                    : selectedGlossaryItem.category === "地點" ? "🗺️"
                    : selectedGlossaryItem.category === "組織" ? "🏛️"
                    : selectedGlossaryItem.category === "道具" ? "💎"
                    : "📌"}
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-ink text-xl truncate">{selectedGlossaryItem.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-widest font-sans font-bold mt-1 inline-block ${getCategoryStyles(selectedGlossaryItem.category)}`}>
                    {selectedGlossaryItem.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedGlossaryItem(null)}
                className="text-ink-light hover:text-ink text-sm font-bold cursor-pointer shrink-0 mt-0.5"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {glossaryHighlights.includes(selectedGlossaryItem.name) && (
                <div className="mb-4 flex items-center gap-2 bg-editorial-accent/10 border border-editorial-accent/30 rounded px-3 py-2">
                  <Sparkle className="w-3.5 h-3.5 text-editorial-accent fill-current shrink-0" />
                  <span className="text-xs text-editorial-accent font-bold font-sans">本章節有最新情報更新</span>
                </div>
              )}
              <p className="text-sm text-ink leading-loose font-serif text-justify-align whitespace-pre-wrap">
                {selectedGlossaryItem.description}
              </p>

              {/* Related characters (only for 人物 category) */}
              {selectedGlossaryItem.category === '人物' && (() => {
                const me = selectedGlossaryItem.name;
                const related = currentGlossary.filter(g =>
                  g.category === '人物' &&
                  g.name !== me &&
                  (g.description.includes(me) || selectedGlossaryItem.description.includes(g.name))
                );
                if (related.length === 0) return null;
                return (
                  <div className="mt-5 pt-4 border-t border-editorial-border">
                    <h4 className="text-[11px] font-bold text-ink-light uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-editorial-accent" />
                      關係人物
                    </h4>
                    <div className="space-y-2">
                      {related.map((rel, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedGlossaryItem(rel)}
                          className="w-full text-left flex items-start gap-2.5 p-2.5 rounded border border-editorial-border bg-paper hover:bg-white hover:border-editorial-accent/50 transition group"
                        >
                          <span className="text-lg shrink-0 leading-none mt-0.5">👤</span>
                          <div className="min-w-0">
                            <p className="text-sm font-serif font-semibold text-ink group-hover:text-editorial-accent transition-colors truncate">{rel.name}</p>
                            <p className="text-xs text-ink-light line-clamp-2 leading-relaxed font-serif mt-0.5">{rel.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="bg-paper-dark px-6 py-3 border-t border-editorial-border flex justify-end">
              <button
                onClick={() => setSelectedGlossaryItem(null)}
                className="px-5 py-2 bg-ink text-white text-xs font-bold rounded hover:bg-neutral-800 transition cursor-pointer"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-editorial-border bg-paper-dark py-3.5 px-6 text-center text-[11px] text-ink-light font-mono flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <div>
          <span>&copy; {new Date().getFullYear()} 虛擬小說產生器 (AI Novel Workshop)</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-editorial-accent" />
            UTC: 2026-06-30
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            系統服務在線
          </span>
        </div>
      </footer>
    </div>
  );
}

