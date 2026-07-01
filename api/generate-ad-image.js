import { setCors, readJson, sendError } from './_utils.js';

function dataUrlToBlob(dataUrl) {
  const match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl || '');
  if (!match) throw new Error('Invalid image data');
  const mime = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  return { blob: new Blob([buffer], { type: mime }), mime };
}

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');
  if (!process.env.OPENAI_API_KEY) return sendError(res, 500, 'OPENAI_API_KEY is not configured');

  try {
    const body = await readJson(req);
    if (!body.prompt) return sendError(res, 400, 'Missing prompt');
    if (!body.imageDataUrl) return sendError(res, 400, 'Missing imageDataUrl');

    const image = dataUrlToBlob(body.imageDataUrl);
    const form = new FormData();
    form.append('model', body.model || process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1');
    form.append('prompt', body.prompt);
    form.append('image', image.blob, body.imageName || 'product.png');
    form.append('size', body.size || '1024x1024');
    form.append('quality', body.quality || 'medium');

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.OPENAI_API_KEY },
      body: form
    });
    const data = await response.json();
    if (!response.ok) return sendError(res, response.status, (data.error && data.error.message) || 'OpenAI image generation failed');

    const item = data.data && data.data[0];
    res.status(200).json({ imageUrl: item && item.url || null, b64_json: item && item.b64_json || null });
  } catch (error) {
    sendError(res, 500, error.message || 'Unexpected server error');
  }
}
