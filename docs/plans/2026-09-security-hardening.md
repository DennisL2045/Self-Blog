# Plan: 套件更新與網站安全補強

## Goal

排除可安全修正的高風險套件通告，補上瀏覽器安全標頭與寫入請求防護，同時保持公開網站、私人編輯室與發布方式不變。

## Scope

### May modify

- React、vinext、Vite 與 Cloudflare 開發套件版本。
- Worker 安全回應標頭。
- 編輯室寫入 API 的同源與 Content-Type 驗證。
- 對應測試與 AI 協作規範。

### Must not modify

- 文章內容、品牌文字與版面。
- Google 與 Cloudflare Access 的雙層登入架構。
- D1 資料內容、R2 圖片與正式環境秘密值。

## Verification

1. 型別檢查、正式建置與既有測試全部通過。
2. 公開頁面具有 CSP 等安全標頭，Markdown 仍不執行原始 HTML。
3. 編輯室寫入要求仍需工作階段、同源請求與正確 Content-Type。
4. 套件掃描確認已處理的高風險直接套件不再出現。

## Done definition

- [x] 盤點版本與相依限制。
- [x] 分兩輪升級並在每輪後建置。
- [x] 加入 CSP、瀏覽器安全標頭與 Fetch Metadata 檢查。
- [x] 建立專案工作流程與規格範本。
- [x] 完整測試、安全掃描與人工差異審查。
- [x] 已取得本次提交與正式發布授權。

## Risks and rollback

主要風險是預先發布版 vinext 的相容性與 CSP 阻擋必要資源。發布前以完整測試驗證；若正式環境異常，回復到前一個已保存的 Sites 版本與 Git 提交。
