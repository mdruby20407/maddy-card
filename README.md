# Maddy Secure OpenAI Backend

這個資料夾包含 GitHub Pages 前端需要的安全 API 入口。

## 環境變數

請在部署平台設定：

- OPENAI_API_KEY：OpenAI API Key，不能放在前端 HTML
- OPENAI_TEXT_MODEL：文案模型，預設 gpt-4.1-mini
- OPENAI_IMAGE_MODEL：圖片模型，預設 gpt-image-1
- ALLOWED_ORIGIN：允許呼叫的前端網域，例如 https://mdruby20407.github.io

## API

- POST /api/generate-copy：產生行銷標語
- POST /api/generate-ad-image：根據產品圖與提示詞生成圖片

GitHub Pages 不能執行後端 API。若要正式可用，請把這個 repo 匯入 Vercel，或將 api 資料夾部署到公司後端，再把前端「安全後端入口」填成後端網址。
