import { NextRequest, NextResponse } from 'next/server'
import { generateStructuredJSON, geminiFlash } from '@/lib/gemini'
import type { InventoryItem, RecipeResponse } from '@/types'
import { daysUntilExpiry } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { inventory = [] }: { inventory: InventoryItem[] } = await req.json()

    const expiringItems = inventory.filter(i => {
      const expiry = i.adjustedExpiryDate ?? i.expiryDate
      if (!expiry) return false
      const days = daysUntilExpiry(expiry)
      return days >= 0 && days <= 3
    })

    if (expiringItems.length === 0) {
      return NextResponse.json({
        recipes: [],
        expiringItemsUsed: [],
        message: 'No expiring items to cook with!',
      })
    }

    const itemNames = expiringItems.map(i => `${i.productName} (${i.quantity} ${i.unit ?? 'units'})`).join(', ')

    const data = await generateStructuredJSON<RecipeResponse>(geminiFlash, `
You are a Zero-Waste Chef AI. Generate 3 recipes using ONLY the provided expiring ingredients.
Expiring items: ${itemNames}

Return this exact JSON structure:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "One sentence description",
      "cookTime": "20 minutes",
      "ingredients": ["item 1", "item 2"],
      "steps": ["Step 1 instruction", "Step 2 instruction", "Step 3 instruction"],
      "servings": 2
    }
  ],
  "expiringItemsUsed": ["item1", "item2"]
}

Rules:
- Use as many expiring items as possible per recipe
- Keep it practical and achievable
- Each recipe must use at least 1 expiring item
- Steps should be concise (1 sentence each, 3-5 steps per recipe)
`)

    return NextResponse.json(data)
  } catch (err) {
    console.error('[recipes]', err)
    return NextResponse.json({ error: 'Recipe generation failed' }, { status: 500 })
  }
}
