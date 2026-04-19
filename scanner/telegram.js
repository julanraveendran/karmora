// Telegram notifications — mirror of the Xylo setup.
// Sends on scanner errors and end-of-run summaries.

import { fetch } from 'undici';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegram(text) {
  if (!TOKEN || !CHAT_ID) {
    console.log('[telegram] skipped (no creds):', text);
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.error('[telegram] send failed:', err.message);
  }
}

export async function alertError(context, err) {
  const msg = `🚨 *Karmora scanner error*\n\`${context}\`\n\n${err.message || err}`;
  await sendTelegram(msg);
}

export async function alertRunSummary({ project, posts, newPosts, leads, durationMs }) {
  const msg =
    `✅ *${project}* scan done\n` +
    `• posts: ${posts} (${newPosts} new)\n` +
    `• leads: ${leads}\n` +
    `• duration: ${(durationMs / 1000).toFixed(1)}s`;
  await sendTelegram(msg);
}
