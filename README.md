<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 虛擬小說產生器

以 **Google Gemini AI** 驅動的繁體中文互動小說工作坊。支援 RPG 角色追蹤、世界觀詞彙表、自動章節生成，並可匯出完整 Markdown 小說。

---

## 本機開發

**Prerequisites:** Node.js 18+

1. 安裝套件：
   ```bash
   npm install
   ```
2. 複製環境變數範本並填入 Gemini API Key：
   ```bash
   cp .env.example .env.local
   # 編輯 .env.local，設定 GEMINI_API_KEY=your_key_here
   ```
3. 啟動開發伺服器：
   ```bash
   npm run dev
   ```
   瀏覽器開啟 http://localhost:3000

---

## 部署到 GitHub Pages（靜態托管，免伺服器）

### 自動部署（推薦）

本專案內建 GitHub Actions 工作流程，推送到 `main` 分支即自動部署。

1. **建立 GitHub Repository** 並推送此專案：
   ```bash
   git remote add origin https://github.com/你的帳號/你的倉庫名稱.git
   git push -u origin main
   ```

2. **啟用 GitHub Pages**：
   - 進入 Repository → **Settings** → **Pages**
   - Source 選擇 **Deploy from a branch**
   - Branch 選擇 `gh-pages`，資料夾選 `/ (root)`
   - 點擊 **Save**

3. **等待 Actions 完成**：
   - 到 **Actions** 頁籤查看 `Deploy to GitHub Pages` 工作流程
   - 完成後，網站將發布在 `https://你的帳號.github.io/你的倉庫名稱/`

### 手動建置靜態檔

```bash
VITE_BASE_PATH=/你的倉庫名稱/ npm run build:static
```
產出在 `dist/` 資料夾，可上傳至任何靜態托管服務（Netlify、Vercel、Cloudflare Pages 等）。

> **注意：** GitHub Pages 為純前端靜態部署，無後端 API Key。使用者需在應用程式的「⚙ 設定」頁面輸入自己的 [Gemini API Key](https://aistudio.google.com/app/apikey)。

---

## 技術架構

| 層級 | 技術 |
|------|------|
| 前端 | React 19 + TypeScript |
| 樣式 | Tailwind CSS v4 |
| 建置 | Vite 6 |
| 後端（本機/伺服器模式） | Express 4 |
| AI | Google Gemini (`gemini-3.5-flash`) |

---

View original app in AI Studio: https://ai.studio/apps/9c42f925-4ee3-41e8-b4f3-ae90e95ff4d6
