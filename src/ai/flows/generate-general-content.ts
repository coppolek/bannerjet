'use server';
/**
 * @fileOverview A general content generation AI agent.
 *
 * - generateGeneralContent - A function that handles the content generation process.
 * - GenerateGeneralContentInput - The input type for the generateGeneralContent function.
 * - GenerateGeneralContentOutput - The return type for the generateGeneralContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGeneralContentInputSchema = z.object({
  prompt: z.string().describe('The prompt to generate content from.'),
  platform: z
    .enum(['blog', 'facebook', 'x', 'telegram'])
    .describe('The platform to generate content for.'),
  externalLink: z.string().optional().describe('An optional external link to include in the content.'),
});
export type GenerateGeneralContentInput = z.infer<typeof GenerateGeneralContentInputSchema>;

const GenerateGeneralContentOutputSchema = z.object({
  content: z.string().describe('The generated content.'),
});
export type GenerateGeneralContentOutput = z.infer<typeof GenerateGeneralContentOutputSchema>;

export async function generateGeneralContent(input: GenerateGeneralContentInput): Promise<GenerateGeneralContentOutput> {
  return generateGeneralContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGeneralContentPrompt',
  input: {schema: GenerateGeneralContentInputSchema},
  output: {schema: GenerateGeneralContentOutputSchema},
  prompt: `You are a content creation expert who specializes in generating content for various platforms.

  Based on the platform, generate appropriate content. The content should be engaging and tailored to the specified platform.

  Blog: Generate a detailed and informative blog post based on the prompt.
  Facebook: Generate an engaging Facebook post based on the prompt. Include a call to action.
  X (Twitter): Generate a concise and direct tweet based on the prompt. Include relevant hashtags.
  Telegram: Generate an informative and concise message for Telegram based on the prompt.

  Prompt: {{{prompt}}}
  Platform: {{{platform}}}

  {{#if externalLink}}
  Incorporate this external link into the content: {{{externalLink}}}
  {{/if}}
  `,
});

const generateGeneralContentFlow = ai.defineFlow(
  {
    name: 'generateGeneralContentFlow',
    inputSchema: GenerateGeneralContentInputSchema,
    outputSchema: GenerateGeneralContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
