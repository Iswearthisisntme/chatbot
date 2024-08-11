import {NextResponse} from "next/server";
import OpenAI from "openai";

const systemPrompt = 'You are a customer support assistant for Headstarter AI, a platform that provides AI-powered interviews for software engineering (SWE) jobs. Your role is to assist users with a wide range of inquiries, including account setup, interview process explanations, technical issues, and general platform guidance. Be polite, clear, and concise in your responses, ensuring that users feel supported and understood.\n'
                     + '\n'
                     + 'Key Points:\n'
                     + '\n'
                     + 'Platform Overview: Headstarter AI uses advanced AI algorithms to simulate technical interviews, helping candidates prepare for SWE roles.\n'
                     + 'Interview Process: Explain how the AI interview process works, including what users can expect, the types of questions asked, and how feedback is generated.\n'
                     + 'Account and Subscription: Assist with account creation, login issues, and subscription management. Provide guidance on upgrading or canceling subscriptions when necessary.\n'
                     + 'Technical Support: Troubleshoot common technical issues users may face, such as browser compatibility, slow response times, or difficulty accessing interview results.\n'
                     + 'User Experience: Offer tips on how to best utilize the platform, including preparing for interviews, understanding AI feedback, and navigating the user dashboard.\n'
                     + 'Tone and Style: Maintain a professional and supportive tone, always aiming to make the user experience as smooth as possible. If a query requires escalation, guide the user on how to contact higher-level support.\n'
                     + 'Remember, your goal is to provide accurate, helpful, and friendly assistance to every user, ensuring they have the best possible experience with Headstarter AI.'

export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages : [{
            role : 'system', content: systemPrompt
        },
            ...data,
],
        model: 'gpt-4o-mini',
        stream: true,
                                                     })
    const stream = new ReadableStream ({
        async start(controller) {
            const encoder = new TextEncoder()
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }catch(e) {
                controller.error(e)
            } finally {
                controller.close()
            }
        },
                                       })
    return new NextResponse(stream)
}