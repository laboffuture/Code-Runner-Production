'use client';

import type { Problem, TestCase } from '@/lib/types';
import ProblemHeader from './ProblemHeader';
import MissionBriefing from './MissionBriefing';
import TaskSection from './TaskSection';
import SampleDataTabs from './SampleDataTabs';
import EducationalAccordions from './EducationalAccordions';

interface ProblemPanelProps {
  problem: Problem;
  testCases: TestCase[];
}

export default function ProblemPanel({ problem, testCases }: ProblemPanelProps) {
  return (
    <>
      <ProblemHeader problem={problem} />
      <MissionBriefing problem={problem} />
      <TaskSection problem={problem} />
      <EducationalAccordions problem={problem} />
      <SampleDataTabs problem={problem} testCases={testCases} />
    </>
  );
}

// Export individual components for flexibility
export {
  ProblemHeader,
  MissionBriefing,
  TaskSection,
  SampleDataTabs,
  EducationalAccordions,
};
