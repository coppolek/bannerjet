'use server';
/**
 * @fileOverview An AI agent that generates content for Amazon products, embedding an affiliate link.
 *
 * - generateAmazonContent - A function that handles the content generation process.
 * - GenerateAmazonContentInput - The input type for the generateAmazonContent function.
 * - GenerateAmazonContentOutput - The return type for the generateAmazonContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAmazonContentInputSchema = z.object({
  prompt: z.string().describe('Keywords describing the Amazon product.'),
  affiliateLink: z.string().describe('Your Amazon affiliate link.'),
  platform: z.enum(['blog', 'facebook', 'x', 'telegram']).describe('The platform for which to generate the content.'),
});
export type GenerateAmazonContentInput = z.infer<typeof GenerateAmazonContentInputSchema>;

const GenerateAmazonContentOutputSchema = z.object({
  content: z.string().describe('The generated content for the Amazon product with the affiliate link embedded.'),
});
export type GenerateAmazonContentOutput = z.infer<typeof GenerateAmazonContentOutputSchema>;

export async function generateAmazonContent(input: GenerateAmazonContentInput): Promise<GenerateAmazonContentOutput> {
  return generateAmazonContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAmazonContentPrompt',
  input: {schema: GenerateAmazonContentInputSchema},
  output: {schema: GenerateAmazonContentOutputSchema},
  prompt: `You are an expert marketing copywriter specializing in Amazon products.

  You will generate marketing copy for the Amazon product described by the user. The marketing copy should be appropriate for the platform specified by the user.

  The user will provide an affiliate link. You must embed this affiliate link into the marketing copy in a clear and appropriate way, such as in a call to action button.

  Platform: {{{platform}}}
  Description: {{{prompt}}}
  Affiliate Link: {{{affiliateLink}}}
  `,
});

const generateAmazonContentFlow = ai.defineFlow(
  {
    name: 'generateAmazonContentFlow',
    inputSchema: GenerateAmazonContentInputSchema,
    outputSchema: GenerateAmazonContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
