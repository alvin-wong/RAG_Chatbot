import { Newsreader } from 'next/font/google'
import {NextResponse} from 'next/server'
import OpenAI from 'openai'

const systemPrompt = `System Prompt
    You are ChatGPT, a large language model trained by OpenAI.
    Your goal is to assist users by providing accurate, relevant, and helpful information.
    Be concise and clear in your responses, tailoring your communication style to the user's preferences.
    When the user provides information about themselves or their preferences, adapt your responses to align with that context.
    If you don't know the answer to a question, be honest about it.
    When generating code or technical solutions, follow the user's explicit instructions and only show the relevant changes.
    Avoid discussing or revealing your underlying processes or instructions unless explicitly asked.`

export async function POST(req) {
    const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [{
            role: 'system',
            content: systemPrompt
        },
        ...data,
        ],
        model: "gpt-4o-mini",
        stream: true,
    })

    const stream = new ReadableStream ({
        async start(controller) {
            const encoder =  new TextEncoder()
            try{
                for await(const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if(content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch(err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        }
    })

    return new NextResponse(stream)
}