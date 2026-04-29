// Server-side WB Parser for Next.js site
// Runs as standalone service, connects to DB via webhook
// Usage: node parser-server.js

const http = require('http');
const https = require('https');

// Config
const PORT = process.env.PARSER_PORT || 3005;
const SITE_WEBHOOK_URL = process.env.SITE_WEBHOOK_URL || 'http://localhost:3000/api/admin/parser/webhook';
const MAX_PRODUCTS = 1000; // Remove limit

// WB API endpoint (public API - no auth needed)
const WB_API_BASE = 'https://common-api.wildberries.ru';
const WB_CARD_API = 'https://card.wb.ru';

function log(msg, data = null) {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] ${msg}`, data ? JSON.stringify(data) : '');
}

function sendJSON(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

// Extract article ID from WB URL or return as-is
function extractArticle(input) {
  const str = String(input).trim();
  
  // If just numbers - already article
  if (/^\d+$/.test(str)) return str;
  
  // Extract from URL like https://www.wildberries.ru/catalog/12345678/detail.aspx
  const urlMatch = str.match(/catalog\/(\d+)/);
  if (urlMatch) return urlMatch[1];
  
  // Extract from URL like https://wildberries.ru/catalog/12345678/item.aspx
  const itemMatch = str.match(/catalog\/(\d+)/);
  if (itemMatch) return itemMatch[1];
  
  // Return as-is if can't parse
  return str;
}

// Parse single product price from WB
async function parseProduct(article) {
  const art = extractArticle(article);
  log(`Parsing article: ${art}`);
  
  try {
    // Method 1: Try WB public API
    const apiUrl = `${WB_API_BASE}/api/v6/cardsleeve/v5/digit/${art}?country=RU`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://www.wildberries.ru',
        'Referer': `https://www.wildberries.ru/catalog/${art}/detail.aspx`
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data?.data?.products?.[0]) {
        const product = data.data.products[0];
        return {
          success: true,
          article: art,
          nmId: product.nmId,
          name: product.name,
          brand: product.brand,
          price: product.salePriceU ? product.salePriceU / 100 : product.priceU / 100,
          oldPrice: product.priceU ? product.priceU / 100 : null,
          originalPrice: product.originalPriceU ? product.originalPriceU / 100 : null,
          inStock: product.inStock > 0,
          stock: product.inStock,
          rating: product.rating,
          feedbacks: product.feedbacks,
          imageUrl: product.imageUrl,
          colors: product.colors
        };
      }
    }
    
    const altUrl = `https://${WB_CARD_API}/cardsleeve/v5/digit/${art}?country=RU`;
    const altResponse = await fetch(altUrl, {
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://www.wildberries.ru'
      }
    });
    
    if (altResponse.ok) {
      const data = await altResponse.json();
      if (data?.data?.products?.[0]) {
        const product = data.data.products[0];
        return {
          success: true,
          article: art,
          nmId: product.nmId,
          name: product.name,
          brand: product.brand,
          price: product.salePriceU ? product.salePriceU / 100 : product.priceU / 100,
          oldPrice: product.priceU ? product.priceU / 100 : null,
          originalPrice: product.originalPriceU ? product.originalPriceU / 100 : null,
          inStock: product.inStock > 0,
          stock: product.inStock,
          rating: product.rating,
          feedbacks: product.feedbacks,
          imageUrl: product.imageUrl
        };
      }
    }
    
    const catalogUrl = `https://catalog.wildberries.ru/api/v6/content/features?nmIds=${art}`;
    const catalogResponse = await fetch(catalogUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (catalogResponse.ok) {
      const catalogData = await catalogResponse.json();
      // Parse response...
    }
    
    log(`No data found for article ${art}`);
    return {
      success: false,
      article: art,
      error: 'Товар не найден на WB'
    };
    
  } catch (error) {
    log(`Error parsing ${art}:`, error.message);
    return {
      success: false,
      article: art,
      error: error.message
    };
  }
}

// Send result to site webhook
async function sendToWebhook(productId, result) {
  try {
    const payload = {
      jobId: `parser_${Date.now()}`,
      productId,
      status: result.success ? 'COMPLETED' : 'FAILED',
      result: result.success ? [{
        source: `https://www.wildberries.ru/catalog/result.result.article/detail.aspx`,
        success: result.success,
        ...result
      }] : null,
      error: result.error
    };
    
    const response = await fetch(SITE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      log(`Webhook sent for ${productId}`);
      return true;
    } else {
      log(`Webhook failed:`, await response.text());
      return false;
    }
  } catch (error) {
    log(`Webhook error:`, error.message);
    return false;
  }
}

// Parse handler
async function handleParse(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', async () => {
    try {
      const { productId, sources } = JSON.parse(body);
      
      if (!productId) {
        sendJSON(res, { error: 'productId required' }, 400);
        return;
      }
      
      if (!sources || !Array.isArray(sources) || sources.length === 0) {
        sendJSON(res, { error: 'sources required' }, 400);
        return;
      }
      
      log(`Starting parse for product ${productId}, sources:`, sources.length);
      
      const results = [];
      
      // Parse each source (no limit!)
      for (const source of sources.slice(0, MAX_PRODUCTS)) {
        const result = await parseProduct(source);
        results.push(result);
        
        // Small delay to avoid rate limiting
        if (sources.indexOf(source) < sources.length - 1) {
          await new Promise(r => setTimeout(r, 500));
        }
      }
      
      // Find successful result
      const successResult = results.find(r => r.success);
      
      if (successResult) {
        await sendToWebhook(productId, successResult);
      }
      
      sendJSON(res, {
        success: true,
        jobId: `parse_${Date.now()}`,
        productId,
        results,
        parsedCount: results.filter(r => r.success).length
      });
    } catch (e) {
      sendJSON(res, { error: e.message }, 400);
    }
  });
}

// Health check
function handleHealth(res) {
  res.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  });
  res.end(JSON.stringify({
    status: 'ok',
    uptime: process.uptime(),
    maxProducts: MAX_PRODUCTS
  }));
}

// Main server
const server = http.createServer(async (req, res) => {
  const pathname = (req.url || '/').split('?')[0];
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }
  
  // POST /api/parse - parse products
  if (pathname === '/api/parse' && req.method === 'POST') {
    await handleParse(req, res);
    return;
  }
  
  // GET /api/health - health check
  if ((pathname === '/health' || pathname === '/api/health') && req.method === 'GET') {
    handleHealth(res);
    return;
  }
  
  // GET / - info или /api/info
  if ((pathname === '/' || pathname === '/api') && req.method === 'GET') {
    sendJSON(res, {
      name: 'WB Parser Server',
      version: '1.0.0',
      endpoints: {
        '/api/parse': 'POST - parse products',
        '/health': 'GET - health check'
      }
    });
    return;
  }
  
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found', path: pathname }));
});

server.listen(PORT, '0.0.0.0', () => {
  log('='.repeat(50));
  log(`WB Parser Server started on port ${PORT}`);
  log(`Max products per request: ${MAX_PRODUCTS} (unlimited)`);
  log(`Webhook URL: ${SITE_WEBHOOK_URL}`);
  log('='.repeat(50));
});

process.on('SIGTERM', () => {
  log('Shutting down...');
  server.close(() => process.exit(0));
});