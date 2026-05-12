# 拿破崙與秘書・完整網頁遊戲專案

這是一個以「台灣常見拿破崙與秘書」為基礎的網頁遊戲專案，支援：

- 1 人本機遊玩：其他 4 位為 AI
- 線上 2～5 人遊玩：使用 Firebase Firestore 同步，不足 5 人補 AI
- 20 級難易度
- 手機、平板、電腦 RWD
- 多主題：海洋風、護眼風、電子紙風、暮光風、櫻花風、森林風、海灘風、深海夜航
- 多音效包：泡泡、浪花、木質、玻璃、復古電子
- 回合計時器
- 手機觸控優化
- 分數排名
- 內建教學
- GitHub Pages 自動部署工作流程
- Firebase Hosting / Firestore rules 設定

> 注意：這份專案是「朋友房 / 教學展示 / MVP」等級的多人同步。Firestore 裡的房間狀態由前端更新，適合熟人玩；如果要做公開競技平台，建議加入 Cloud Functions 權威伺服器、App Check、嚴格 rules、反作弊與房間清理排程。

---

## 1. 安裝與本機執行

請先安裝：

- Node.js 20 或以上
- Git
- 一個 GitHub 帳號
- 一個 Firebase / Google 帳號

解壓縮專案後，在專案資料夾執行：

```bash
npm install
npm run dev
```

打開終端機顯示的網址，通常是：

```text
http://localhost:5173
```

沒有設定 Firebase 時，本機 AI 模式仍可直接玩；線上模式需要完成第 2 節。

---

## 2. 建立 Firebase 專案

### 2.1 建立專案與 Web App

1. 前往 Firebase Console。
2. 新增專案，例如 `napoleon-card-game`。
3. 在專案首頁點 `</>` Web app。
4. 註冊應用程式。
5. 複製 Firebase config。

建立 `.env.local`：

```bash
cp .env.example .env.local
```

把 Firebase config 填進 `.env.local`：

```env
VITE_FIREBASE_API_KEY=你的 apiKey
VITE_FIREBASE_AUTH_DOMAIN=你的 projectId.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=你的 projectId
VITE_FIREBASE_STORAGE_BUCKET=你的 projectId.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=你的 messagingSenderId
VITE_FIREBASE_APP_ID=你的 appId
```

重新啟動：

```bash
npm run dev
```

### 2.2 啟用 Authentication

1. Firebase Console → Authentication → Get started。
2. Sign-in method。
3. 啟用 `Anonymous`。

本專案線上房間使用匿名登入識別玩家。

### 2.3 啟用 Firestore

1. Firebase Console → Firestore Database。
2. Create database。
3. 選擇 Production mode 或 Test mode 都可以，之後會部署本專案的 rules。
4. 選擇資料庫區域。

### 2.4 部署 Firestore Rules

安裝 Firebase CLI：

```bash
npm install -g firebase-tools
firebase login
```

初始化或連結專案：

```bash
firebase init firestore hosting
```

建議選項：

- Firestore rules file：`firestore.rules`
- Hosting public directory：`dist`
- Configure as single-page app：`Yes`
- Set up automatic builds：可選 No，因為本專案已有 GitHub Pages workflow

部署 rules：

```bash
firebase deploy --only firestore:rules
```

---

## 3. 使用 Firebase Hosting 部署

建置並部署：

```bash
npm run deploy:firebase
```

或只部署網站：

```bash
npm run deploy:hosting
```

部署完成後，Firebase 會提供類似：

```text
https://你的-project-id.web.app
https://你的-project-id.firebaseapp.com
```

---

## 4. 上傳到 GitHub

### 4.1 建立 GitHub Repository

1. 到 GitHub 建立新 repository。
2. 名稱可以用 `napoleon-card-game`。
3. 不要勾選自動建立 README，因為專案裡已有 README。

### 4.2 推送程式碼

在專案資料夾執行：

```bash
git init
git add .
git commit -m "Initial Napoleon web game"
git branch -M main
git remote add origin https://github.com/你的帳號/napoleon-card-game.git
git push -u origin main
```

---

## 5. 用 GitHub Pages 部署

本專案已附上：

```text
.github/workflows/pages.yml
```

它會在推送到 `main` 時自動：

1. 安裝依賴
2. 建立 `.env.production`
3. 執行 `npm run build`
4. 發布到 GitHub Pages

### 5.1 設定 GitHub Actions Variables

到你的 GitHub repo：

1. Settings
2. Secrets and variables
3. Actions
4. Variables
5. New repository variable

新增以下變數：

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

值請填 Firebase Web config。

### 5.2 啟用 Pages

1. Repo → Settings → Pages。
2. Source 選擇 `GitHub Actions`。
3. 推送 main 後，到 Actions 看部署狀態。
4. 完成後 Pages 會顯示網址。

---

## 6. 遊戲玩法

### 基本流程

1. 發牌：每人 10 張，底牌 4 張。
2. 叫牌：9～16 頭，最高者成為拿破崙。
3. 拿破崙指定王牌。
4. 拿破崙拿底牌並棄 4 張。
5. 拿破崙喊一張秘書牌。
6. 開始打 10 墩。
7. 結算拿破崙方吃到幾張 A/K/Q/J。
8. 達成合約則拿破崙方加分，否則防守方加分。

### 牌力

- 秘書牌最大。
- 大鬼、小鬼次之。
- 王牌大於一般花色。
- 必須跟首引花色；沒有該花色才可墊牌或出王牌。
- 大鬼 / 小鬼首引可以指定本墩跟牌花色。
- 王牌 2 首引請大鬼；王牌 3 首引請小鬼；前三墩有效。

---

## 7. 專案結構

```text
napoleon-complete-webgame/
├── .env.example
├── .github/workflows/pages.yml
├── .gitignore
├── firebase.json
├── firestore.rules
├── index.html
├── package.json
├── README.md
├── vite.config.js
└── src/
    ├── firebaseClient.js
    ├── main.js
    └── styles.css
```

---

## 8. 之後可擴充

- 房間聊天
- 觀戰模式
- 房間清理 Cloud Function
- 更嚴格的 Firestore rules
- 排行榜寫入獨立 collection
- PWA 離線安裝
- 音效檔替換為真實音效素材
- 更完整的地方規則選項
