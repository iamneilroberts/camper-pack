/**
 * CamperPack - Vision API
 * Uses Claude to analyze images for inventory management
 */

interface Env {
  ANTHROPIC_API_KEY: string;
}

interface VisionRequest {
  image: string; // Base64 data URL
  mode: 'inventory' | 'icon';
}

interface InventoryItem {
  name: string;
  icon?: string;
  category?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({
      error: 'Vision API not configured'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body: VisionRequest = await request.json();
    const { image, mode } = body;

    // Extract base64 data from data URL
    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error('Invalid image format');
    }

    const mediaType = `image/${base64Match[1]}`;
    const imageData = base64Match[2];

    let prompt: string;

    if (mode === 'inventory') {
      prompt = `You are helping someone inventory items in their camper trailer or truck.

Look at this image and identify all visible items that might be part of camping/travel inventory.

For each item, provide:
1. A descriptive name (e.g., "First aid kit", "Flashlight", "Camp chair")
2. A relevant emoji icon
3. A category from: clothing, toiletries, meds, pet, electronics, food, gear, kitchen, bedding, tools, other

Return your response as a JSON array of objects with "name", "icon", and "category" fields.
Example: [{"name": "Flashlight", "icon": "🔦", "category": "gear"}, {"name": "First aid kit", "icon": "🩹", "category": "meds"}]

Only include items you can clearly identify. Be specific with names.
Return ONLY the JSON array, no other text.`;
    } else {
      prompt = `Look at this image of a single item.

Suggest the most appropriate emoji to represent this item. If there's no perfect emoji, choose the closest one.

Return your response as a JSON object with "icon" (the emoji) and "name" (a short descriptive name for the item).
Example: {"icon": "🔦", "name": "LED flashlight"}

Return ONLY the JSON object, no other text.`;
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Use Haiku for speed and cost
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageData
              }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      throw new Error('Vision API request failed');
    }

    const result = await response.json();
    const content = result.content?.[0]?.text;

    if (!content) {
      throw new Error('No response from vision API');
    }

    // Parse JSON from response
    let parsed;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Content:', content);
      throw new Error('Could not parse vision response');
    }

    // Return appropriate format based on mode
    if (mode === 'inventory') {
      return new Response(JSON.stringify({
        items: Array.isArray(parsed) ? parsed : [parsed]
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify(parsed), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Vision error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
