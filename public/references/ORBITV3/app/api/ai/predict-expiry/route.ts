import { NextRequest, NextResponse } from 'next/server'
import { groqChat } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const { productName, category, quantity, unit, purchaseDate, originalExpiryDate, zoneConditions } = await req.json()

    if (!productName) {
      return NextResponse.json({ error: 'productName is required' }, { status: 400 })
    }

    const prompt = `You are a food science and household goods expert. Predict the realistic expiry date for this item based on real-world conditions.

ITEM DETAILS:
- Product: ${productName}
- Category: ${category ?? 'unknown'}
- Quantity: ${quantity ?? 1} ${unit ?? 'units'}
- Purchase date: ${purchaseDate ?? 'unknown'}
- Labelled expiry date: ${originalExpiryDate ?? 'not provided'}
- Storage conditions: ${zoneConditions ?? 'standard room temperature'}

TASK: Based on the product type, typical storage conditions in an Indian household, and any provided details, give a realistic predicted expiry date.

Consider:
- How this product is typically stored in Indian homes
- Whether the labelled date is conservative or accurate
- Common factors that accelerate or slow spoilage (humidity, temperature, packaging)
- If no expiry date is given, estimate based on product type and purchase date

Respond with ONLY a JSON object in this exact format, no other text:
{
  "predictedExpiryDate": "YYYY-MM-DD",
  "confidence": "high" | "medium" | "low",
  "reasoning": "One sentence explaining the prediction"
}`

    const raw = await groqChat(
      [{ role: 'user', content: prompt }],
      { temperature: 0.3, maxTokens: 200 }
    )

    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse prediction' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[predict-expiry]', err)
    return NextResponse.json({ error: 'Prediction failed' }, { status: 500 })
  }
}
