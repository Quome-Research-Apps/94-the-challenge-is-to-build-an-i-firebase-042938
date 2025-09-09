import GradeCalculator from '@/components/grade-calculator';
import {BookOpen} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 py-8 sm:p-8 md:py-12">
      <header className="mb-6 flex items-center gap-3 text-center sm:mb-8">
        <div className="rounded-lg bg-primary/20 p-2 shadow-sm">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-headline text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
          ExamAce
        </h1>
      </header>
      <main className="w-full max-w-3xl">
        <GradeCalculator />
      </main>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Stress less, plan more. Your grades are not stored or saved.</p>
      </footer>
    </div>
  );
}
