/* ============================================
   花圃數學園 - Storage Module (localStorage)
   ============================================ */

const STORAGE_KEY = 'math_flower_game';

const Storage = {

  /** Default data structure */
  _default() {
    return {
      playerName: '',
      grade: 1,          // active grade (1 or 2)
      progress: {},      // 一年級: { [flowerId]: { correct, totalAttempts } }
      progressG2: {},    // 二年級: { [flowerId]: { correct, totalAttempts } }
      lastPlayed: null,
      version: 2
    };
  },

  /** Load saved data; returns default if none found */
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this._default();
      const data = JSON.parse(raw);
      // Migrate v1 → v2
      if (!data.progress)   data.progress   = {};
      if (!data.progressG2) data.progressG2 = {};
      if (!data.grade)      data.grade       = 1;
      return data;
    } catch (e) {
      console.warn('Storage load error, resetting:', e);
      return this._default();
    }
  },

  /** Persist data to localStorage */
  save(data) {
    try {
      data.lastPlayed = new Date().toISOString().slice(0, 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  },

  /** Check if player has been set up */
  hasPlayer() {
    return !!this.load().playerName;
  },

  /** Set player name */
  setPlayerName(name) {
    const data = this.load();
    data.playerName = name.trim();
    this.save(data);
  },

  /** Get player name */
  getPlayerName() {
    return this.load().playerName || '玩家';
  },

  /** Get current active grade (1 or 2) */
  getGrade() {
    return this.load().grade || 1;
  },

  /** Set current active grade */
  setGrade(g) {
    const data = this.load();
    data.grade = g;
    this.save(data);
  },

  /** Get the active progress object (based on current grade) */
  getActiveProgress() {
    const data = this.load();
    return data.grade === 2 ? data.progressG2 : data.progress;
  },

  /** Get progress for a specific flower (grade-aware) */
  getFlowerProgress(flowerId) {
    const prog = this.getActiveProgress();
    return prog[flowerId] || { correct: 0, totalAttempts: 0 };
  },

  /** Record a correct answer for a flower (grade-aware) */
  addCorrect(flowerId) {
    const data = this.load();
    const prog = data.grade === 2 ? data.progressG2 : data.progress;
    if (!prog[flowerId]) {
      prog[flowerId] = { correct: 0, totalAttempts: 0 };
    }
    prog[flowerId].correct += 1;
    prog[flowerId].totalAttempts = (prog[flowerId].totalAttempts || 0) + 1;
    this.save(data);
    return prog[flowerId].correct;
  },

  /** Record an incorrect attempt (grade-aware) */
  addAttempt(flowerId) {
    const data = this.load();
    const prog = data.grade === 2 ? data.progressG2 : data.progress;
    if (!prog[flowerId]) {
      prog[flowerId] = { correct: 0, totalAttempts: 0 };
    }
    prog[flowerId].totalAttempts = (prog[flowerId].totalAttempts || 0) + 1;
    this.save(data);
  },

  /** Reset ALL data (with confirmed intent) */
  reset() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
