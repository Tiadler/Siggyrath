// import { streamText, convertToModelMessages, type UIMessage } from 'ai';
// import { createOpenAI } from '@ai-sdk/openai';

// export const runtime = 'nodejs';

// const poe = createOpenAI({
//   apiKey: process.env.POE_API_KEY,
//   baseURL: 'https://api.poe.com/v1',
// });

// export async function POST(req: Request) {
//   try {
//     const { messages }: { messages: UIMessage[] } = await req.json();

//     const result = streamText({
//       model: poe('siggyrath'),
//       messages: convertToModelMessages(messages),
//       system: 'You are a helpful and concise assistant.',
//     });

//     return result.toUIMessageStreamResponse();
//   } catch (error) {
//     console.error('API /api/chat error:', error);
//     return new Response('Internal Server Error', { status: 500 });
//   }
// }





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

  // ❗ bỏ toàn bộ phần từ "References" trở xuống
  reply = reply.replace(/##\s*📚?\s*References[\s\S]*/i, '').trim();

  return NextResponse.json({
    content: reply,
  });
}





// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   const body = await req.json();

//   const messages = body.messages || [];
//   const lastMessage = messages[messages.length - 1]?.content || "";

//   // mock reply
//   const reply =
//     `🤖 Mock Bot Response\n\n` +
//     `You said:\n\n` +
//     `> ${lastMessage}\n\n` +
//     `This is a **mock response** because POE_API_KEY is not configured yet.\n\n` +
//     `Once the API key is added, this route will call Poe API.`;

//   return NextResponse.json({
//     id: "mock-id",
//     role: "assistant",
//     content: reply,
//   });
// }