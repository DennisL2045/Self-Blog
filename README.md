# 夜行手札

以 TypeScript 與 vinext 建立的個人內容網站。公開網站只讀取已發布文章；`/studio` 是沒有公開導覽入口的私人寫作區。

## 內容區域

- 技術成長：技術原理、範例與實務取捨
- 簡單看看：工程工具名詞與常見使用情境
- 個人經歷：專案、學習歷程與回顧
- 出遊手札：旅程、照片與文字記錄

## 私人編輯室

編輯室使用 Google Identity Services 驗證身分，再由伺服器端帳號白名單決定是否能讀寫。登入成功不等於取得權限；所有文章與圖片 API 都會再次驗證工作階段。

安全設計包含：

- 至少一個 Google 帳號白名單；日後可再加入備援帳號
- 12 小時、`HttpOnly`、`SameSite=Strict` 的簽章工作階段
- 寫入請求的同源檢查
- 草稿、發布與軟封存狀態
- 編輯前自動保存上一版內容
- 跨裝置版本衝突檢查
- Markdown 不允許原始 HTML，公開頁面不使用 `dangerouslySetInnerHTML`
- 圖片限制為 JPG、PNG、WebP 與 8 MB 以下
- 圖片發布前重新編碼為 WebP，移除 GPS、EXIF 與其他原始中繼資料
- 圖片存放在 R2，文章與版本紀錄存放在 D1

## Google 設定

在 Google Cloud Console 建立「Web application」OAuth Client，加入：

- Authorized JavaScript origin：`https://night-notes-cat.songming1111.chatgpt.site`
- Authorized redirect URI：`https://night-notes-cat.songming1111.chatgpt.site/api/studio/session`
- 本機開發可另加 `http://localhost:3000` 與 `http://localhost:3000/api/studio/session`

執行環境需要下列值，格式可參考 `.env.example`：

- `GOOGLE_CLIENT_ID`：Google Web Client ID；這是公開識別碼，不是 Client Secret
- `EDITOR_ALLOWED_EMAILS`：以逗號分隔的主要與備援 Google 信箱
- `SESSION_SECRET`：至少 32 字元的隨機秘密，只能存在伺服器環境

為避免主要帳號失效時連 OAuth 設定也無法管理，備援帳號也應加入同一個 Google Cloud 專案的管理權限。不要把 Client Secret、Session Secret 或任何 Token 寫入 Git。

## 開發

需求：Node.js `>=22.13.0`。

```bash
npm install
npm run dev
npm run build
npm run lint
npm test
```

資料表異動後執行 `npm run db:generate`，並檢查 `drizzle/` 產生的 SQL 遷移。
