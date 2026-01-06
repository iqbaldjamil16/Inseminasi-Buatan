'use server';
/**
 * @fileOverview Summarizes breeding program and provides advice on optimizing the breeding schedule.
 *
 * - summarizeBreedingProgram - A function that handles the summarization of breeding records and provides advice.
 * - SummarizeBreedingProgramInput - The input type for the summarizeBreedingProgram function.
 * - SummarizeBreedingProgramOutput - The return type for the summarizeBreedingProgram function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeBreedingProgramInputSchema = z.object({
  breedingRecords: z.string().describe('The breeding records of the herd.'),
});
export type SummarizeBreedingProgramInput = z.infer<
  typeof SummarizeBreedingProgramInputSchema
>;

const SummarizeBreedingProgramOutputSchema = z.object({
  summary: z.string().describe('The summary of the breeding program.'),
  advice: z.string().describe('Advice on optimizing the breeding schedule.'),
});
export type SummarizeBreedingProgramOutput = z.infer<
  typeof SummarizeBreedingProgramOutputSchema
>;

export async function summarizeBreedingProgram(
  input: SummarizeBreedingProgramInput
): Promise<SummarizeBreedingProgramOutput> {
  return summarizeBreedingProgramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeBreedingProgramPrompt',
  input: {schema: SummarizeBreedingProgramInputSchema},
  output: {schema: SummarizeBreedingProgramOutputSchema},
  prompt: `You are an expert in cattle breeding and artificial insemination.
  You will be provided with the breeding records of a herd.
  Your goal is to summarize the breeding program and provide advice on optimizing the breeding schedule.

  Breeding Records:
  {{breedingRecords}}`,
});

const summarizeBreedingProgramFlow = ai.defineFlow(
  {
    name: 'summarizeBreedingProgramFlow',
    inputSchema: SummarizeBreedingProgramInputSchema,
    outputSchema: SummarizeBreedingProgramOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
