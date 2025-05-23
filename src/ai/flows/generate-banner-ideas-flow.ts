// src/ai/flows/generate-banner-ideas-flow.ts
'use server';
/**
 * @fileOverview A flow for generating creative banner ideas based on a specific theme or product.
 *
 * @exports generateBannerIdeas - A function that takes a theme/product prompt and returns a list of banner ideas.
 * @exports GenerateBannerIdeasInput - The input type for the generateBannerIdeas function.
 * @exports GenerateBannerIdeasOutput - The output type for the generateBannerIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBannerIdeasInputSchema = z.object({
  prompt: z.string().describe('The theme or product for which to generate banner ideas.'),
});
export type GenerateBannerIdeasInput = z.infer<typeof GenerateBannerIdeasInputSchema>;

const GenerateBannerIdeasOutputSchema = z.array(
  z.object({
    ideaName: z.string().describe('A short name for the banner idea.'),
    descriptionSuggestion: z
      .string()
      .describe('A brief, catchy description for the banner (max 20 words).'),
    ctaSuggestion: z
      .string()
      .describe('Text for the call-to-action button (max 5 words).'),
    visualConcept: z
      .string()
      .describe('A visual concept for the banner image (max 15 words).'),
  })
);
export type GenerateBannerIdeasOutput = z.infer<typeof GenerateBannerIdeasOutputSchema>;

export async function generateBannerIdeas(input: GenerateBannerIdeasInput): Promise<GenerateBannerIdeasOutput> {
  return generateBannerIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBannerIdeasPrompt',
  input: {schema: GenerateBannerIdeasInputSchema},
  output: {schema: GenerateBannerIdeasOutputSchema},
  prompt: `Genera 3 idee creative e uniche per un banner pubblicitario, basate sul tema/prodotto: "{{{prompt}}}". Per ogni idea, includi:\n\
1. ideaName: Un nome breve per l'idea.\n\
2. descriptionSuggestion: Una breve descrizione accattivante per il banner (max 20 parole).\n\
3. ctaSuggestion: Un testo per il pulsante di call-to-action (max 5 parole).\n\
4. visualConcept: Un concetto visivo per l'immagine del banner (max 15 parole).\
\
Formato la risposta come un array JSON di oggetti.`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateBannerIdeasFlow = ai.defineFlow(
  {
    name: 'generateBannerIdeasFlow',
    inputSchema: GenerateBannerIdeasInputSchema,
    outputSchema: GenerateBannerIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
