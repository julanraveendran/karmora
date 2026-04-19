// Simple round-robin proxy rotator.
// Webshare gives us proxies in USER:PASS@HOST:PORT format.
//
// Usage:
//   import { getProxyAgent } from './proxy.js';
//   const agent = getProxyAgent();
//   await fetch(url, { dispatcher: agent });

import { ProxyAgent } from 'undici';

let proxyList = [];
let cursor = 0;

export function loadProxies() {
  if (process.env.USE_PROXIES !== 'true') {
    console.log('[proxy] disabled via USE_PROXIES=false');
    return [];
  }
  const raw = process.env.WEBSHARE_PROXY_LIST || '';
  proxyList = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      // entry is "user:pass@host:port"
      const [creds, hostport] = entry.split('@');
      const [user, pass] = creds.split(':');
      const [host, port] = hostport.split(':');
      return `http://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}`;
    });
  console.log(`[proxy] loaded ${proxyList.length} proxies`);
  return proxyList;
}

export function getProxyAgent() {
  if (proxyList.length === 0) return undefined;
  const proxyUrl = proxyList[cursor % proxyList.length];
  cursor++;
  return new ProxyAgent(proxyUrl);
}

export function getProxyCount() {
  return proxyList.length;
}
