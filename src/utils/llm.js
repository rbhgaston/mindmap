const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export class LLMService {
  static createPrompt(text) {
    return `Analyze the following text and create a hierarchical mind map structure. 

Text: "${text}"

Create a JSON response with the following structure:
{
  "nodes": [
    {
      "label": "Main Topic",
      "bullets": ["Key point 1", "Key point 2"],
      "children": [
        {
          "label": "Subtopic 1",
          "bullets": ["Detail 1", "Detail 2"],
          "children": [
            {
              "label": "Sub-subtopic",
              "bullets": ["Specific detail 1", "Specific detail 2"]
            }
          ]
        }
      ]
    }
  ]
}

CRITICAL RULES:
1. ONLY use information that is EXPLICITLY mentioned in the provided text
2. DO NOT add any external knowledge, interpretations, or additional details
3. DO NOT expand on concepts beyond what is stated in the text
4. Extract main concepts, subtopics, and supporting details directly from the text
5. Keep bullet points concise and factual - only what is stated in the text
6. If the text is brief, create a simple structure - do not overcomplicate
7. Use the exact terminology and phrases from the text when possible
8. Do not infer relationships that are not explicitly stated
9. If a concept is mentioned but not explained, do not add explanations
10. Focus on organizing the existing information, not adding new information

Return ONLY valid JSON, no other text.`;
  }

  static async generateMindMap(text) {
    if (!GROQ_API_KEY) {
      // Fallback to mock data for development
      return this.generateMockMindMap(text);
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that creates structured mind maps from text. You ONLY use information explicitly provided in the text. Do not add external knowledge or interpretations. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: this.createPrompt(text)
            }
          ],
          temperature: 0.1, // Lower temperature for more conservative output
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const parsed = JSON.parse(content);
        return parsed.nodes || [];
      } catch (parseError) {
        console.error('Failed to parse LLM response:', parseError);
        return this.generateMockMindMap(text);
      }
    } catch (error) {
      console.error('Groq API error:', error);
      return this.generateMockMindMap(text);
    }
  }

  static generateMockMindMap(text) {
    // Extract some keywords from the text for mock data
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10);

    return [
      {
        label: words[0] || 'Main Topic',
        bullets: ['Key concept 1', 'Key concept 2', 'Key concept 3'],
        children: [
          {
            label: words[1] || 'Subtopic 1',
            bullets: ['Detail 1', 'Detail 2'],
            children: [
              {
                label: words[2] || 'Sub-subtopic 1',
                bullets: ['Specific point 1', 'Specific point 2', 'Specific point 3']
              },
              {
                label: words[3] || 'Sub-subtopic 2',
                bullets: ['Another detail 1', 'Another detail 2']
              }
            ]
          },
          {
            label: words[4] || 'Subtopic 2',
            bullets: ['Important aspect 1', 'Important aspect 2'],
            children: [
              {
                label: words[5] || 'Sub-subtopic 3',
                bullets: ['Critical point 1', 'Critical point 2', 'Critical point 3']
              }
            ]
          }
        ]
      }
    ];
  }
} 