"use client";

import {getAIPoweredGradeGuidance} from '@/ai/flows/ai-powered-grade-guidance';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Separator} from '@/components/ui/separator';
import {useToast} from '@/hooks/use-toast';
import {
  Calculator,
  Info,
  LoaderCircle,
  PlusCircle,
  Sparkles,
  Trash2,
} from 'lucide-react';
import React, {useEffect, useRef, useState} from 'react';

type GradeComponent = {
  id: number;
  name: string;
  weight: string;
  score: string;
};

type Result = {
  score: number | null;
  message: string;
  status: 'success' | 'impossible' | 'achieved' | 'info';
};

export default function GradeCalculator() {
  const [components, setComponents] = useState<GradeComponent[]>([
    {id: 1, name: 'Midterm Exam', weight: '30', score: '85'},
  ]);
  const [finalExamWeight, setFinalExamWeight] = useState('40');
  const [targetGrade, setTargetGrade] = useState('90');
  const [result, setResult] = useState<Result | null>(null);
  const [totalWeight, setTotalWeight] = useState(0);

  const [subject, setSubject] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const {toast} = useToast();
  const nextId = useRef(2);

  useEffect(() => {
    const currentComponentsWeight = components.reduce(
      (sum, c) => sum + (parseFloat(c.weight) || 0),
      0
    );
    const finalWeight = parseFloat(finalExamWeight) || 0;
    setTotalWeight(currentComponentsWeight + finalWeight);
  }, [components, finalExamWeight]);

  const handleComponentChange = (
    id: number,
    field: keyof Omit<GradeComponent, 'id'>,
    value: string
  ) => {
    setComponents(
      components.map(c => (c.id === id ? {...c, [field]: value} : c))
    );
  };

  const addComponent = () => {
    setComponents([
      ...components,
      {id: nextId.current++, name: '', weight: '', score: ''},
    ]);
  };

  const removeComponent = (id: number) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const handleCalculate = () => {
    if (totalWeight !== 100) {
      toast({
        title: 'Check Weights',
        description: `The sum of all weights must be 100%. It's currently ${totalWeight}%.`,
        variant: 'destructive',
      });
      return;
    }

    const target = parseFloat(targetGrade) || 0;
    const finalWeight = (parseFloat(finalExamWeight) || 0) / 100;

    if (finalWeight <= 0) {
      toast({
        title: 'Invalid Final Exam Weight',
        description: 'Final exam weight must be greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    const currentContribution = components.reduce((acc, curr) => {
      const score = parseFloat(curr.score) || 0;
      const weight = (parseFloat(curr.weight) || 0) / 100;
      return acc + score * weight;
    }, 0);

    const requiredScore = (target - currentContribution) / finalWeight;

    if (requiredScore < 0) {
      setResult({
        score: 0,
        message: `Congratulations! You've already secured your target grade of ${target}%. You need 0% on the final.`,
        status: 'achieved',
      });
    } else if (requiredScore > 100) {
      const maxGrade = currentContribution + 100 * finalWeight;
      setResult({
        score: requiredScore,
        message: `It's not possible to achieve a ${target}%. Even with a perfect 100% on the final, the highest grade you can get is ${maxGrade.toFixed(
          2
        )}%.`,
        status: 'impossible',
      });
    } else {
      setResult({
        score: requiredScore,
        message: `To get a final grade of ${target}%, you need to score at least:`,
        status: 'success',
      });
    }
  };

  const handleGetAdvice = async () => {
    if (!subject.trim()) {
      toast({
        title: 'Subject Required',
        description: 'Please enter a subject to get study advice.',
        variant: 'destructive',
      });
      return;
    }

    setIsAiLoading(true);
    setAiAdvice('');
    try {
      const res = await getAIPoweredGradeGuidance({
        subject,
        desiredGrade: targetGrade || 'A',
      });
      setAiAdvice(res.advice);
    } catch (error) {
      console.error(error);
      toast({
        title: 'AI Error',
        description: 'Could not fetch study advice. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <Card className="w-full overflow-hidden shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Grade Calculator</CardTitle>
        <CardDescription>
          Enter your current grades and course weights to find out what you need on the final
          exam.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-lg font-semibold">Course Components</Label>
          <div className="mt-4 space-y-4">
            {components.map((c, index) => (
              <div
                key={c.id}
                className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_100px_100px_auto] sm:gap-4"
              >
                <div className="space-y-1.5">
                  {index === 0 && <Label htmlFor={`name-${c.id}`}>Component Name</Label>}
                  <Input
                    id={`name-${c.id}`}
                    placeholder="e.g., Homework"
                    value={c.name}
                    onChange={e => handleComponentChange(c.id, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  {index === 0 && <Label htmlFor={`weight-${c.id}`}>Weight (%)</Label>}
                  <Input
                    id={`weight-${c.id}`}
                    type="number"
                    placeholder="20"
                    value={c.weight}
                    onChange={e => handleComponentChange(c.id, 'weight', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  {index === 0 && <Label htmlFor={`score-${c.id}`}>Score (%)</Label>}
                  <Input
                    id={`score-${c.id}`}
                    type="number"
                    placeholder="95"
                    value={c.score}
                    onChange={e => handleComponentChange(c.id, 'score', e.target.value)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeComponent(c.id)}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Remove component"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={addComponent}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Component
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label className="text-lg font-semibold">Final Goal</Label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="final-weight">Final Exam Weight (%)</Label>
              <Input
                id="final-weight"
                type="number"
                placeholder="40"
                value={finalExamWeight}
                onChange={e => setFinalExamWeight(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="target-grade">Desired Final Grade (%)</Label>
              <Input
                id="target-grade"
                type="number"
                placeholder="90"
                value={targetGrade}
                onChange={e => setTargetGrade(e.target.value)}
              />
            </div>
          </div>
          {totalWeight !== 100 && (
            <div className="flex items-center text-sm text-amber-600">
              <Info className="mr-2 h-4 w-4" />
              Total weight is currently {totalWeight}%. It should be 100%.
            </div>
          )}
        </div>

        <Button size="lg" className="w-full text-base" onClick={handleCalculate}>
          <Calculator className="mr-2 h-5 w-5" />
          What do I need?
        </Button>
        {result && (
          <Alert
            className={
              result.status === 'achieved'
                ? 'border-green-500/50 bg-green-50 text-green-700'
                : result.status === 'impossible'
                  ? 'border-destructive/50 bg-destructive/10 text-destructive'
                  : 'border-primary/50 bg-primary/10'
            }
          >
            <AlertTitle
              className={`flex items-center font-bold ${
                result.status === 'achieved'
                  ? 'text-green-800'
                  : result.status === 'impossible'
                    ? 'text-destructive'
                    : ''
              }`}
            >
              {result.message}
            </AlertTitle>
            {result.score !== null && result.status === 'success' && (
              <AlertDescription className="text-center">
                <p className="mt-2 text-6xl font-bold text-accent-foreground" style={{color: 'hsl(var(--accent))'}}>
                  {result.score.toFixed(2)}%
                </p>
              </AlertDescription>
            )}
          </Alert>
        )}
      </CardContent>

      <Separator />

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="ai-guidance" className="border-b-0">
          <AccordionTrigger className="px-6 py-4 text-base font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Bonus: Get AI-powered study tips</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4 rounded-lg border bg-secondary/30 p-4">
              <p className="text-sm text-muted-foreground">
                Enter your class subject and get personalized study advice.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="e.g., Biology 101"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  disabled={isAiLoading}
                />
                <Button onClick={handleGetAdvice} disabled={isAiLoading}>
                  {isAiLoading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    'Get Advice'
                  )}
                </Button>
              </div>

              {aiAdvice && (
                <div className="mt-4 animate-in fade-in rounded-md border bg-background p-4 text-sm">
                  <p className="whitespace-pre-wrap font-medium leading-relaxed">
                    {aiAdvice}
                  </p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
