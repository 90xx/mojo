// worker.js
export default {
  async fetch(request, env, ctx) {
    // 处理跨域预检请求 (CORS)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/api/stats' && request.method === 'GET') {
        return await getStats(env);
      } 
      else if (path === '/api/stats/view' && request.method === 'POST') {
        return await recordView(env);
      } 
      else if (path === '/api/stats/click' && request.method === 'POST') {
        return await recordClick(env, request);
      } 
      else {
        return new Response('Not Found', { status: 404, headers: corsHeaders });
      }
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
  }
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 生产环境建议改为你的具体域名
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// 获取统计数据
async function getStats(env) {
  const totalViews = parseInt(await env.STATS_KV.get('total_views') || '0');
  
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const todayViews = parseInt(await env.STATS_KV.get(`daily_views_${today}`) || '0');
  
  // 获取热度排行榜 (存储为一个 JSON 对象)
  const hitsMapStr = await env.STATS_KV.get('resource_hits_map');
  const hitsMap = hitsMapStr ? JSON.parse(hitsMapStr) : {};
  
  // 排序并取 Top 5
  const topResources = Object.entries(hitsMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([title, count]) => ({ title, count }));

  return new Response(JSON.stringify({
    totalViews,
    todayViews,
    topResources
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 记录页面访问 (PV)
async function recordView(env) {
  // 1. 增加总访问量
  const totalViews = parseInt(await env.STATS_KV.get('total_views') || '0') + 1;
  await env.STATS_KV.put('total_views', totalViews.toString());

  // 2. 增加今日访问量
  const today = new Date().toISOString().split('T')[0];
  const todayViews = parseInt(await env.STATS_KV.get(`daily_views_${today}`) || '0') + 1;
  // 设置过期时间为 2 天，自动清理旧数据
  await env.STATS_KV.put(`daily_views_${today}`, todayViews.toString(), { expirationTtl: 172800 });

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 记录资源点击 (热度)
async function recordClick(env, request) {
  const { title } = await request.json();
  if (!title) return new Response('Missing title', { status: 400, headers: corsHeaders });

  // 读取现有的 hits map
  const hitsMapStr = await env.STATS_KV.get('resource_hits_map');
  const hitsMap = hitsMapStr ? JSON.parse(hitsMapStr) : {};

  // 增加该资源的点击量
  hitsMap[title] = (hitsMap[title] || 0) + 1;

  // 写回 KV
  await env.STATS_KV.put('resource_hits_map', JSON.stringify(hitsMap));

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}