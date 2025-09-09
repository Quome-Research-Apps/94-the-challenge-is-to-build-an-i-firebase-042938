// A Genkit flow that provides personalized advice on study strategies, time management tips, and available resources for exam preparation, tailored to the subject of the class and desired grade.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPoweredGradeGuidanceInputSchema = z.object({
  subject: z.string().describe('The subject of the class.'),
  desiredGrade: z.string().describe('The desired final grade in the course (e.g., A, B, C).'),
});

export type AIPoweredGradeGuidanceInput = z.infer<typeof AIPoweredGradeGuidanceInputSchema>;

const AIPoweredGradeGuidanceOutputSchema = z.object({
  advice: z.string().describe('Personalized advice on study strategies, time management tips, and available resources for exam preparation.'),
});

export type AIPoweredGradeGuidanceOutput = z.infer<typeof AIPoweredGradeGuidanceOutputSchema>;

export async function getAIPoweredGradeGuidance(input: AIPoweredGradeGuidanceInput): Promise<AIPoweredGradeGuidanceOutput> {
  return aiPoweredGradeGuidanceFlow(input);
}

const aiPoweredGradeGuidancePrompt = ai.definePrompt({
  name: 'aiPoweredGradeGuidancePrompt',
  input: {schema: AIPoweredGradeGuidanceInputSchema},
  output: {schema: AIPoweredGradeGuidanceOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized advice to students preparing for their final exams.

  Based on the subject of the class and the desired grade, offer specific study strategies, time management tips, and suggest relevant resources for exam preparation.

  Subject: {{{subject}}}
  Desired Grade: {{{desiredGrade}}}

  Provide your advice in a clear and encouraging tone.`,
});

const aiPoweredGradeGuidanceFlow = ai.defineFlow(
  {
    name: 'aiPoweredGradeGuidanceFlow',
    inputSchema: AIPoweredGradeGuidanceInputSchema,
    outputSchema: AIPoweredGradeGuidanceOutputSchema,
  },
  async input => {
    const {output} = await aiPoweredGradeGuidancePrompt(input);
    return output!;
  }
);
