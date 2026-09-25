import 'server-only';
import { mkdir, writeFile } from 'node:fs/promises';

export type Attachment = { filename: string; content: string; contentType: string };
export type Mail = { to: string; subject: string; html: string; text: string; replyTo?: string; attachments?: Attachment[] };

/**
 * Sends transactional email through Resend (RESEND_API_KEY). Without a key —
 * local / proposal mode — messages are written to .data/outbox/ so they can be opened
 * in a browser.
 */
export function resendEnabled() {
  const key = process.env.RESEND_API_KEY;
  return Boolean(key && !key.includes('...'));
}

export async function sendMail(mail: Mail): Promise<{ id: string; mode: 'resend' | 'outbox' }> {
  const key = process.env.RESEND_API_KEY;
  if (resendEnabled()) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? 'Vicelić <onboarding@resend.dev>',
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        reply_to: mail.replyTo,
        attachments: mail.attachments?.map((a) => ({
          filename: a.filename,
          content: Buffer.from(a.content).toString('base64'),
          content_type: a.contentType,
        })),
      }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    const { id } = (await res.json()) as { id: string };
    return { id, mode: 'resend' };
  }

  const dir = '.data/outbox';
  await mkdir(dir, { recursive: true });
  const id = `${new Date().toISOString().replace(/[:.]/g, '-')}-${mail.to.replace(/[^a-z0-9]/gi, '_')}`;
  const header = `<!-- To: ${mail.to} | Subject: ${mail.subject} | Attachments: ${(mail.attachments ?? []).map((a) => a.filename).join(', ')} -->\n`;
  await writeFile(`${dir}/${id}.html`, header + mail.html);
  for (const a of mail.attachments ?? []) await writeFile(`${dir}/${id}-${a.filename}`, a.content);
  console.info(`[email] outbox → ${dir}/${id}.html (${mail.subject})`);
  return { id, mode: 'outbox' };
}
