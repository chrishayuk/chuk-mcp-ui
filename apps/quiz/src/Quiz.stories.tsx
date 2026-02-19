import type { Meta, StoryObj } from "@storybook/react";
import { QuizRenderer } from "./App";
import { mockCallTool } from "../../../.storybook/mock-call-tool";
import type { QuizContent, QuizResult } from "./schema";

const meta = {
  title: "Views/Quiz",
  component: QuizRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "700px" }}><Story /></div>],
} satisfies Meta<typeof QuizRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  Story 1: General Knowledge (multiple-choice)                       */
/* ------------------------------------------------------------------ */

const generalKnowledgeData: QuizContent = {
  type: "quiz",
  version: "1.0",
  title: "General Knowledge Quiz",
  description:
    "Test your knowledge across geography, history, and science. 5 questions, 30 seconds each.",
  validateTool: "validate_answer",
  questions: [
    {
      id: "q1",
      type: "multiple-choice",
      prompt: "What is the largest ocean on Earth?",
      category: "Geography",
      points: 2,
      timeLimit: 30,
      explanation:
        "The Pacific Ocean covers approximately 63 million square miles, making it the largest ocean.",
      options: [
        { id: "q1-a", label: "Pacific Ocean" },
        { id: "q1-b", label: "Atlantic Ocean" },
        { id: "q1-c", label: "Indian Ocean" },
        { id: "q1-d", label: "Arctic Ocean" },
      ],
    },
    {
      id: "q2",
      type: "multiple-choice",
      prompt: "In which year did the Berlin Wall fall?",
      category: "History",
      points: 2,
      timeLimit: 30,
      explanation:
        "The Berlin Wall fell on November 9, 1989, marking the end of the Cold War era in Europe.",
      options: [
        { id: "q2-a", label: "1989" },
        { id: "q2-b", label: "1991" },
        { id: "q2-c", label: "1985" },
        { id: "q2-d", label: "1990" },
      ],
    },
    {
      id: "q3",
      type: "multiple-choice",
      prompt: "What is the chemical symbol for gold?",
      category: "Science",
      points: 2,
      timeLimit: 30,
      explanation:
        "Au comes from the Latin word 'aurum', meaning gold.",
      options: [
        { id: "q3-a", label: "Au" },
        { id: "q3-b", label: "Ag" },
        { id: "q3-c", label: "Go" },
        { id: "q3-d", label: "Gd" },
      ],
    },
    {
      id: "q4",
      type: "multiple-choice",
      prompt: "Which country has the most UNESCO World Heritage Sites?",
      category: "Geography",
      points: 2,
      timeLimit: 30,
      explanation:
        "Italy leads with 59 UNESCO World Heritage Sites, including the Colosseum and Venice.",
      options: [
        { id: "q4-a", label: "Italy" },
        { id: "q4-b", label: "China" },
        { id: "q4-c", label: "Spain" },
        { id: "q4-d", label: "France" },
      ],
    },
    {
      id: "q5",
      type: "multiple-choice",
      prompt: "Who developed the theory of general relativity?",
      category: "Science",
      points: 2,
      timeLimit: 30,
      explanation:
        "Albert Einstein published his theory of general relativity in 1915.",
      options: [
        { id: "q5-a", label: "Albert Einstein" },
        { id: "q5-b", label: "Isaac Newton" },
        { id: "q5-c", label: "Niels Bohr" },
        { id: "q5-d", label: "Max Planck" },
      ],
    },
  ],
  settings: {
    timeLimit: 30,
    timeLimitMode: "per-question",
    showExplanation: true,
    showProgress: true,
    showScore: true,
    passingScore: 60,
  },
};

export const GeneralKnowledge: Story = {
  args: {
    data: generalKnowledgeData,
    onCallTool: mockCallTool,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 2: True/False                                                */
/* ------------------------------------------------------------------ */

const trueFalseData: QuizContent = {
  type: "quiz",
  version: "1.0",
  title: "True or False",
  description: "Simple true-or-false questions. No timer, just answer at your own pace.",
  validateTool: "validate_answer",
  questions: [
    {
      id: "tf1",
      type: "true-false",
      prompt: "The Great Wall of China is visible from space with the naked eye.",
      points: 1,
      explanation:
        "This is a common myth. The Great Wall is not visible from space without aid.",
      options: [
        { id: "tf1-true", label: "True" },
        { id: "tf1-false", label: "False" },
      ],
    },
    {
      id: "tf2",
      type: "true-false",
      prompt: "Honey never spoils.",
      points: 1,
      explanation:
        "Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still perfectly edible.",
      options: [
        { id: "tf2-true", label: "True" },
        { id: "tf2-false", label: "False" },
      ],
    },
    {
      id: "tf3",
      type: "true-false",
      prompt: "Octopuses have three hearts.",
      points: 1,
      explanation:
        "Octopuses have two branchial hearts that pump blood to the gills and one systemic heart.",
      options: [
        { id: "tf3-true", label: "True" },
        { id: "tf3-false", label: "False" },
      ],
    },
  ],
  settings: {
    showExplanation: true,
    showProgress: true,
    showScore: true,
  },
};

export const TrueFalse: Story = {
  args: {
    data: trueFalseData,
    onCallTool: mockCallTool,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 3: Image Quiz                                                */
/* ------------------------------------------------------------------ */

const imageQuizData: QuizContent = {
  type: "quiz",
  version: "1.0",
  title: "Photo Identification",
  description:
    "Identify the correct image from the options. A visual challenge!",
  validateTool: "validate_answer",
  questions: [
    {
      id: "img1",
      type: "image-choice",
      prompt: "Which image shows a mountain landscape?",
      category: "Visual",
      points: 3,
      options: [
        {
          id: "img1-a",
          label: "Mountain",
          image: { url: "https://picsum.photos/seed/mountain/300/200", alt: "Mountain landscape" },
        },
        {
          id: "img1-b",
          label: "Beach",
          image: { url: "https://picsum.photos/seed/beach/300/200", alt: "Beach scene" },
        },
        {
          id: "img1-c",
          label: "Forest",
          image: { url: "https://picsum.photos/seed/forest/300/200", alt: "Forest" },
        },
        {
          id: "img1-d",
          label: "Desert",
          image: { url: "https://picsum.photos/seed/desert/300/200", alt: "Desert" },
        },
      ],
    },
    {
      id: "img2",
      type: "image-choice",
      prompt: "Which image shows a city skyline?",
      category: "Visual",
      points: 3,
      options: [
        {
          id: "img2-a",
          label: "City",
          image: { url: "https://picsum.photos/seed/city/300/200", alt: "City skyline" },
        },
        {
          id: "img2-b",
          label: "Village",
          image: { url: "https://picsum.photos/seed/village/300/200", alt: "Village" },
        },
        {
          id: "img2-c",
          label: "Farm",
          image: { url: "https://picsum.photos/seed/farm/300/200", alt: "Farm" },
        },
        {
          id: "img2-d",
          label: "Lake",
          image: { url: "https://picsum.photos/seed/lake/300/200", alt: "Lake" },
        },
      ],
    },
    {
      id: "img3",
      type: "image-choice",
      prompt: "Which image shows an ocean sunset?",
      category: "Visual",
      points: 3,
      options: [
        {
          id: "img3-a",
          label: "Sunset",
          image: { url: "https://picsum.photos/seed/sunset/300/200", alt: "Ocean sunset" },
        },
        {
          id: "img3-b",
          label: "Sunrise",
          image: { url: "https://picsum.photos/seed/sunrise/300/200", alt: "Sunrise" },
        },
        {
          id: "img3-c",
          label: "Storm",
          image: { url: "https://picsum.photos/seed/storm/300/200", alt: "Storm" },
        },
        {
          id: "img3-d",
          label: "Night Sky",
          image: { url: "https://picsum.photos/seed/night/300/200", alt: "Night sky" },
        },
      ],
    },
  ],
  settings: {
    showExplanation: false,
    showProgress: true,
    showScore: true,
  },
};

export const ImageQuiz: Story = {
  args: {
    data: imageQuizData,
    onCallTool: mockCallTool,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 4: Results (pre-rendered results screen)                     */
/* ------------------------------------------------------------------ */

const resultsData: QuizContent = {
  type: "quiz",
  version: "1.0",
  title: "General Knowledge Quiz",
  description: "Pre-rendered results screen demo.",
  validateTool: "validate_answer",
  questions: [
    {
      id: "r1",
      type: "multiple-choice",
      prompt: "What is the largest ocean on Earth?",
      category: "Geography",
      points: 2,
      explanation: "The Pacific Ocean is the largest ocean.",
      options: [
        { id: "r1-a", label: "Pacific Ocean" },
        { id: "r1-b", label: "Atlantic Ocean" },
        { id: "r1-c", label: "Indian Ocean" },
      ],
    },
    {
      id: "r2",
      type: "multiple-choice",
      prompt: "In which year did the Berlin Wall fall?",
      category: "History",
      points: 2,
      explanation: "The Berlin Wall fell in 1989.",
      options: [
        { id: "r2-a", label: "1989" },
        { id: "r2-b", label: "1991" },
        { id: "r2-c", label: "1985" },
      ],
    },
    {
      id: "r3",
      type: "multiple-choice",
      prompt: "What is the chemical symbol for gold?",
      category: "Science",
      points: 2,
      explanation: "Au comes from the Latin 'aurum'.",
      options: [
        { id: "r3-a", label: "Au" },
        { id: "r3-b", label: "Ag" },
        { id: "r3-c", label: "Go" },
      ],
    },
    {
      id: "r4",
      type: "multiple-choice",
      prompt: "Which planet is known as the Red Planet?",
      category: "Science",
      points: 2,
      options: [
        { id: "r4-a", label: "Mars" },
        { id: "r4-b", label: "Jupiter" },
        { id: "r4-c", label: "Venus" },
      ],
    },
    {
      id: "r5",
      type: "multiple-choice",
      prompt: "What is the capital of Japan?",
      category: "Geography",
      points: 2,
      options: [
        { id: "r5-a", label: "Tokyo" },
        { id: "r5-b", label: "Osaka" },
        { id: "r5-c", label: "Kyoto" },
      ],
    },
  ],
  settings: {
    showExplanation: true,
    showProgress: true,
    showScore: true,
    passingScore: 60,
  },
};

const prePopulatedResults: QuizResult[] = [
  { questionId: "r1", selectedOptionId: "r1-a", correct: true, correctOptionId: "r1-a", pointsEarned: 2 },
  { questionId: "r2", selectedOptionId: "r2-b", correct: false, correctOptionId: "r2-a", pointsEarned: 0 },
  { questionId: "r3", selectedOptionId: "r3-a", correct: true, correctOptionId: "r3-a", pointsEarned: 2 },
  { questionId: "r4", selectedOptionId: "r4-a", correct: true, correctOptionId: "r4-a", pointsEarned: 2 },
  { questionId: "r5", selectedOptionId: "r5-c", correct: false, correctOptionId: "r5-a", pointsEarned: 0 },
];

export const Results: Story = {
  args: {
    data: resultsData,
    onCallTool: mockCallTool,
    initialScreen: "results",
    initialResults: prePopulatedResults,
  },
};
