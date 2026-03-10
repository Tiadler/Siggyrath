import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const client = new OpenAI({
  apiKey: process.env.POE_API_KEY,
  baseURL: 'https://api.poe.com/v1',
});

type Message = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
};

export async function POST(req: Request) {
  const body = await req.json();
  const messages: Message[] = body.messages;

  const completion = await client.chat.completions.create({
    model: 'siggyrath',
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  let reply = completion.choices[0].message.content || '';

  // bỏ phần References trở xuống
  reply = reply.replace(/##\s*📚?\s*References[\s\S]*/i, '').trim();

  // giảm spam emoji: nếu có từ 2 emoji liền nhau thì xóa cụm đó
  reply = reply.replace(
    /(?:[\p{Extended_Pictographic}\uFE0F]){2,}/gu,
    ''
  );

  // dọn khoảng trắng thừa
  reply = reply
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return NextResponse.json({
    content: reply,
  });
}