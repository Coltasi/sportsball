const ALLOWED_ORIGIN = 'https://coltasi.github.io';
const ANTHROPIC_API  = 'https://api.anthropic.com/v1/messages';

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }
    if (request.method !== 'POST') {
      return corsResponse(JSON.stringify({ error: 'Method not allowed' }), 405);
    }
    let body;
    try { body = await request.json(); }
    catch { return corsResponse(JSON.stringify({ error: 'Invalid JSON' }), 400); }

    const upstream = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });
    const upstreamBody = await upstream.text();
    return corsResponse(upstreamBody, upstream.status, upstream.headers.get('content-type'));
  }
};

function corsResponse(body, status = 200, contentType = 'application/json') {
  return new Response(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin':  ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type':                 contentType ?? 'application/json',
    },
  });
}
