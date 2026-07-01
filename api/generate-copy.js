import { setCors, readJson, sendError } from './_utils.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');
  if (!process.env.OPENAI_API_KEY) return sendError(res, 500, 'OPENAI_API_KEY is not configured');

  try {
    const body = await readJson(req);
    const mode = body.mode === 'scene' ? '商品棚拍情境圖' : '帶文案的廣告行銷圖';
    const prompt = [
      '你是 GA黃金甲的品牌行銷文案助手。',
      '請產生 3 個適合圖片生成使用的繁體中文主標語，避免醫療宣稱與誇大療效。',
      '請只回傳 JSON：{"options":["標語1","標語2","標語3"],"best":"最推薦標語"}',
      '生成模式：' + mode,
      '產品名稱：' + (body.productName || 'GA黃金甲產品'),
      '目標客群：' + (body.audience || '重視健康的會員'),
      '產品賣點：' + (body.sellingPoints || '日常健康保養'),
      '視覺風格：' + (body.style || '溫暖專業')
    ].join('\n');

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TEXT_MODEL || 'gpt-4.1-mini',
        input: prompt,
        temperature: 0.7
      })
    });
    const data = await response.json();
    if (!response.ok) return sendError(res, response.status, (data.error && data.error.message) || 'OpenAI text generation failed');

    const text = data.output_text || (data.output || []).flatMap(item => item.content || []).map(part => part.text || '').join('') || '';
    let parsed;
    try { parsed = JSON.parse(text); } catch (_) { parsed = { best: text.trim(), options: [] }; }
    res.status(200).json({ copy: parsed.best || (parsed.options && parsed.options[0]) || text.trim(), options: parsed.options || [] });
  } catch (error) {
    sendError(res, 500, error.message || 'Unexpected server error');
  }
}
