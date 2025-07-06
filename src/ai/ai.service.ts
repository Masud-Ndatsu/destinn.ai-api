import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ParsedOpportunity } from './ai.interface';
import { CategoriesService } from 'src/opportunities/categories/categories.service';
import { Opportunity } from '@prisma/client';

@Injectable()
export class AiService {
  private readonly apiKey = process.env.GEMINI_API_KEY!;
  private readonly baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;

  constructor(private readonly categoriesService: CategoriesService) {}

  async parseBlockToOpportunities(
    blockHtml: string,
  ): Promise<ParsedOpportunity[]> {
    const url = this.baseUrl;

    const categories = await this.categoriesService.findAll();

    const categoriesList = categories
      .map((cat) => `- "${cat.id}": ${cat.name}`)
      .join('\n');

    const prompt = `
From the following HTML block, extract all distinct opportunities.
For each opportunity, return a JSON object with the following fields:

"title": A concise, descriptive name of the opportunity. (REQUIRED)
"description": A brief summary of the opportunity, typically the first 2-3 sentences. (REQUIRED)
"deadline": The application deadline in YYYY-MM-DD format. If not found, provide a  false boolean value.
"application_url": The full, absolute URL to apply. Prioritize direct application links. (REQUIRED)
"location": The primary work location (e.g., "New York, NY", "Remote", "Multiple Cities"). If multiple are listed, list all.
"tags": An array of relevant keywords or categories, in lowercase. Include terms like "internship", "full-time", "part-time", "remote", "entry-level", "senior", "finance", "tech", "marketing", etc., if present. If no tags are found, return an empty array.
"category_id": From the list below, select the Category ID that best matches the opportunity. If no clear match, use "OTHER".
"thumbnail_url": The URL of the main image or thumbnail associated with the opportunity. If not found, provide an empty string.

Available Categories:
${categoriesList}

Return ONLY an array of these JSON objects. Do NOT include any introductory or concluding text, explanations, or code fences. If no opportunities are found, return an empty array: [].

HTML Block:
${blockHtml}
`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    };

    try {
      const response = await axios.post(url, body);
      const raw = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!raw) return [];
      const jsonString = this.cleanAIResponse(raw);
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) return [];

      return parsed;
    } catch (err: any) {
      console.error('Gemini parse error', err);
      return [];
    }
  }

  /**
   * Uses Gemini AI to compare two lists of opportunities and return only the unique (non-duplicate) opportunities from the incoming list.
   */
  async isDuplicateAI(
    incoming: ParsedOpportunity[],
    existing: Opportunity[],
  ): Promise<ParsedOpportunity[]> {
    const url = this.baseUrl;

    if (!incoming.length) return [];

    const prompt = `
You are an AI assistant that compares two lists of opportunity objects.
Given:
- List A: Existing opportunities (already in the database)
- List B: Newly crawled opportunities

Compare each opportunity in List B with all in List A. 
Return ONLY an array of unique opportunities from List B that are NOT duplicates of any in List A.
A duplicate means they refer to the same real-world opportunity (even if some fields differ).

Return ONLY the array of unique opportunities as valid JSON. Do NOT include any explanations, text, or code fences.

List A (existing):
${JSON.stringify(existing, null, 2)}

List B (incoming):
${JSON.stringify(incoming, null, 2)}
`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    };

    try {
      const response = await axios.post(url, body);
      const raw = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) return [];
      const jsonString = this.cleanAIResponse(raw);
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (e) {
      console.error('AI duplicate check failed', e.message);
      return [];
    }
  }

  async extractApplicationLinkFromHtmlWithHrefContext(
    html: string,
  ): Promise<string | null> {
    const prompt = `
You are an AI assistant that helps extract application links from opportunity pages.

Below is the raw HTML content of a webpage. Your job is to:
- Analyze the <a href=""> links
- Understand the context of the page
- Identify the most likely link the user should click to apply for the opportunity

Return ONLY the best application link as a valid absolute URL (e.g., https://..., http://...), and nothing else. If no valid link is found, return "NONE".

--- BEGIN HTML ---
${html}
--- END HTML ---
`;

    const url = this.baseUrl;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    };

    try {
      const response = await axios.post(url, body);
      const result =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!result || result === 'NONE') return null;

      return result;
    } catch (error) {
      console.error('AI href extraction error:', error.message);
      return null;
    }
  }

  cleanAIResponse(raw: string): string {
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    return match ? match[1].trim() : raw.trim();
  }
}
