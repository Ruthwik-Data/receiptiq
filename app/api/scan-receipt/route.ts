import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Check if it's the sample text receipt
    if (file.name === 'sample-receipt.txt' || file.type === 'text/plain') {
      const text = buffer.toString()
      // Mock response for demonstration if OpenAI key is missing or for sample text
      if (!process.env.OPENAI_API_KEY || file.name === 'sample-receipt.txt') {
        return NextResponse.json({
          success: true,
          data: JSON.stringify({
            merchant: "WHOLE FOODS MARKET",
            date: new Date().toLocaleDateString(),
            subtotal: 21.46,
            tax: 1.93,
            total: 23.39,
            items: [
              { name: "Organic Bananas", price: 3.99 },
              { name: "Almond Milk", price: 4.49 },
              { name: "Whole Grain Bread", price: 5.99 },
              { name: "Avocados (3)", price: 6.99 }
            ],
            confidence: {
              merchant: 0.98,
              date: 0.64,
              subtotal: 0.95,
              tax: 0.91,
              total: 0.97
            },
            overall_confidence: 0.89
          })
        })
      }
    }

    const base64 = buffer.toString('base64')

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract receipt information as JSON with: merchant, date, subtotal, tax, tip (if any), total, items (array with name and price). Be precise with numbers. If tax/tip is not shown, set to 0. ALSO include a \"confidence\" object mapping each field (merchant, date, subtotal, tax, tip, total) to a number 0-1 for how certain you are you read it correctly — lower it for blurry, cut-off, ambiguous, or inferred values, and do NOT be overconfident — plus an \"overall_confidence\" number 0-1. Return ONLY valid JSON."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    })

    return NextResponse.json({
      success: true,
      data: response.choices[0].message.content
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
