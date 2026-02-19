import { useState, useCallback, useMemo } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Separator,
} from "@chuk/view-ui";
import { motion } from "framer-motion";
import {
  fadeIn,
  slideUp,
  listContainer,
  listItem,
  pressable,
} from "@chuk/view-ui/animations";
import type {
  PollContent,
  PollQuestion,
  PollOption,
  PollResults,
  PollVote,
} from "./schema";

/* ------------------------------------------------------------------ */
/*  View (wired to MCP)                                               */
/* ------------------------------------------------------------------ */

export function PollView() {
  const { data, content, callTool, isConnected } =
    useView<PollContent>("poll", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <PollRenderer data={data} onCallTool={callTool} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer (pure presentation)                                      */
/* ------------------------------------------------------------------ */

export interface PollRendererProps {
  data: PollContent;
  onCallTool?: (name: string, args: Record<string, unknown>) => Promise<void>;
}

export function PollRenderer({ data, onCallTool }: PollRendererProps) {
  const {
    title,
    description,
    questions,
    settings,
    voteTool,
  } = data;

  const multiQuestion = settings?.multiQuestion ?? false;
  const allowChange = settings?.allowChange ?? false;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selections, setSelections] = useState<Map<string, string[]>>(
    new Map(),
  );
  const [results, setResults] = useState<Map<string, PollResults>>(new Map());
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [screen, setScreen] = useState<"voting" | "results">("voting");

  const currentQuestion = questions[currentQuestionIndex];
  const currentSelections = selections.get(currentQuestion.id) ?? [];
  const currentResults = results.get(currentQuestion.id);
  const hasVoted = voted.has(currentQuestion.id);
  const allVoted = questions.every((q) => voted.has(q.id));

  /* ---- Selection handlers ---- */

  const handleSelect = useCallback(
    (questionId: string, optionId: string, type: PollQuestion["type"]) => {
      setSelections((prev) => {
        const next = new Map(prev);
        const current = next.get(questionId) ?? [];

        if (type === "single-choice" || type === "rating") {
          next.set(questionId, [optionId]);
        } else if (type === "multi-choice") {
          if (current.includes(optionId)) {
            next.set(
              questionId,
              current.filter((id) => id !== optionId),
            );
          } else {
            const question = questions.find((q) => q.id === questionId);
            const max = question?.maxSelections ?? question?.options.length ?? 99;
            if (current.length < max) {
              next.set(questionId, [...current, optionId]);
            }
          }
        } else if (type === "ranking") {
          // For ranking, the selections array represents the order
          next.set(questionId, [optionId]);
        }

        return next;
      });
    },
    [questions],
  );

  const handleRankingMove = useCallback(
    (questionId: string, optionId: string, direction: "up" | "down") => {
      setSelections((prev) => {
        const next = new Map(prev);
        const question = questions.find((q) => q.id === questionId);
        if (!question) return prev;

        const currentOrder =
          next.get(questionId) ??
          question.options.map((o) => o.id);

        const idx = currentOrder.indexOf(optionId);
        if (idx === -1) return prev;

        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= currentOrder.length) return prev;

        const newOrder = [...currentOrder];
        [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
        next.set(questionId, newOrder);

        return next;
      });
    },
    [questions],
  );

  /* ---- Vote handler ---- */

  const handleVote = useCallback(async () => {
    const questionId = currentQuestion.id;
    const selected = selections.get(questionId) ?? [];

    if (onCallTool) {
      await onCallTool(voteTool, {
        questionId,
        selections: selected,
      });
    }

    // Simulate results when onCallTool is not available (storybook)
    const simulatedResults = simulateResults(currentQuestion, selected);
    setResults((prev) => new Map(prev).set(questionId, simulatedResults));
    setVoted((prev) => new Set(prev).add(questionId));

    // If all questions voted, switch to results screen
    const newVoted = new Set(voted).add(questionId);
    if (questions.every((q) => newVoted.has(q.id))) {
      setScreen("results");
    }
  }, [currentQuestion, selections, onCallTool, voteTool, voted, questions]);

  /* ---- Change vote handler ---- */

  const handleChangeVote = useCallback(() => {
    const questionId = currentQuestion.id;
    setVoted((prev) => {
      const next = new Set(prev);
      next.delete(questionId);
      return next;
    });
    setResults((prev) => {
      const next = new Map(prev);
      next.delete(questionId);
      return next;
    });
    setScreen("voting");
  }, [currentQuestion]);

  /* ---- Navigation ---- */

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const handlePrevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  }, [currentQuestionIndex]);

  /* ---- Results summary screen ---- */

  if (screen === "results" && allVoted) {
    return (
      <div className="h-full flex flex-col font-sans text-foreground bg-background">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="px-6 pt-6 pb-2 flex-shrink-0"
        >
          <h1 className="text-xl font-semibold leading-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </motion.div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <motion.div
            variants={listContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6 max-w-lg mx-auto"
          >
            {questions.map((question) => {
              const qResults = results.get(question.id);
              return (
                <motion.div key={question.id} variants={listItem}>
                  <Card>
                    <CardContent className="p-5">
                      <h3 className="text-base font-semibold mb-3">
                        {question.prompt}
                      </h3>
                      {qResults && (
                        <ResultsBars
                          question={question}
                          results={qResults}
                        />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            <motion.div variants={listItem}>
              <div className="text-center py-4">
                <Badge variant="secondary" className="text-sm px-4 py-1">
                  Thank you for voting!
                </Badge>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ---- Voting screen ---- */

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      {/* Header */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="px-6 pt-6 pb-2 flex-shrink-0"
      >
        <h1 className="text-xl font-semibold leading-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </motion.div>

      {/* Multi-question progress */}
      {multiQuestion && questions.length > 1 && (
        <div className="px-6 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1}/{questions.length}
            </span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
                transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
              />
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === currentQuestionIndex
                    ? "bg-primary"
                    : voted.has(q.id)
                      ? "bg-primary/50"
                      : "bg-muted"
                }`}
                aria-label={`Go to question ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Question area */}
      <div className="flex-1 overflow-y-auto flex items-start justify-center px-6 pb-6 pt-2">
        <motion.div
          key={currentQuestion.id}
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-lg"
        >
          <Card>
            <CardContent className="p-5">
              {/* Prompt */}
              <h2 className="text-lg font-semibold mb-1">
                {currentQuestion.prompt}
              </h2>

              {/* Question type badge */}
              <Badge variant="outline" className="mb-4 text-xs">
                {formatQuestionType(currentQuestion.type)}
                {currentQuestion.type === "multi-choice" &&
                  currentQuestion.maxSelections && (
                    <span>
                      {" "}
                      (max {currentQuestion.maxSelections})
                    </span>
                  )}
              </Badge>

              {/* Question image */}
              {currentQuestion.image && (
                <img
                  src={currentQuestion.image.url}
                  alt={currentQuestion.image.alt ?? currentQuestion.prompt}
                  className="w-full rounded-lg object-cover mb-4 max-h-48"
                />
              )}

              {/* Options -- depends on type */}
              {!hasVoted && (
                <>
                  {currentQuestion.type === "single-choice" && (
                    <SingleChoiceOptions
                      question={currentQuestion}
                      selected={currentSelections}
                      onSelect={(optionId) =>
                        handleSelect(
                          currentQuestion.id,
                          optionId,
                          "single-choice",
                        )
                      }
                    />
                  )}

                  {currentQuestion.type === "multi-choice" && (
                    <MultiChoiceOptions
                      question={currentQuestion}
                      selected={currentSelections}
                      onSelect={(optionId) =>
                        handleSelect(
                          currentQuestion.id,
                          optionId,
                          "multi-choice",
                        )
                      }
                    />
                  )}

                  {currentQuestion.type === "rating" && (
                    <RatingOptions
                      question={currentQuestion}
                      selected={currentSelections}
                      onSelect={(optionId) =>
                        handleSelect(
                          currentQuestion.id,
                          optionId,
                          "rating",
                        )
                      }
                    />
                  )}

                  {currentQuestion.type === "ranking" && (
                    <RankingOptions
                      question={currentQuestion}
                      currentOrder={
                        selections.get(currentQuestion.id) ??
                        currentQuestion.options.map((o) => o.id)
                      }
                      onMove={(optionId, direction) =>
                        handleRankingMove(
                          currentQuestion.id,
                          optionId,
                          direction,
                        )
                      }
                    />
                  )}

                  <Separator className="my-4" />

                  {/* Vote button */}
                  <Button
                    className="w-full"
                    disabled={currentSelections.length === 0}
                    onClick={handleVote}
                  >
                    Vote
                  </Button>
                </>
              )}

              {/* Results after voting */}
              {hasVoted && currentResults && (
                <>
                  <ResultsBars
                    question={currentQuestion}
                    results={currentResults}
                  />

                  <div className="mt-4 flex gap-2">
                    {allowChange && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleChangeVote}
                      >
                        Change Vote
                      </Button>
                    )}
                    {multiQuestion &&
                      currentQuestionIndex < questions.length - 1 && (
                        <Button size="sm" onClick={handleNextQuestion}>
                          Next Question
                        </Button>
                      )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Multi-question navigation */}
          {multiQuestion && questions.length > 1 && (
            <div className="flex justify-between mt-3">
              <Button
                variant="outline"
                size="sm"
                disabled={currentQuestionIndex === 0}
                onClick={handlePrevQuestion}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentQuestionIndex === questions.length - 1}
                onClick={handleNextQuestion}
              >
                Next
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Single-choice options                                             */
/* ------------------------------------------------------------------ */

function SingleChoiceOptions({
  question,
  selected,
  onSelect,
}: {
  question: PollQuestion;
  selected: string[];
  onSelect: (optionId: string) => void;
}) {
  return (
    <motion.div
      variants={listContainer}
      initial="hidden"
      animate="visible"
      className="space-y-2"
    >
      {question.options.map((option) => {
        const isSelected = selected.includes(option.id);
        return (
          <motion.div
            key={option.id}
            variants={listItem}
            whileHover="hover"
            whileTap="tap"
          >
            <button
              type="button"
              onClick={() => onSelect(option.id)}
              className={`w-full text-left rounded-lg border p-3 transition-colors flex items-center gap-3 ${
                isSelected
                  ? "ring-2 ring-primary bg-primary/5 border-primary"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  isSelected
                    ? "border-primary"
                    : "border-muted-foreground/40"
                }`}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              {option.image && (
                <img
                  src={option.image.url}
                  alt={option.image.alt ?? option.label}
                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                />
              )}
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Multi-choice options                                              */
/* ------------------------------------------------------------------ */

function MultiChoiceOptions({
  question,
  selected,
  onSelect,
}: {
  question: PollQuestion;
  selected: string[];
  onSelect: (optionId: string) => void;
}) {
  return (
    <motion.div
      variants={listContainer}
      initial="hidden"
      animate="visible"
      className="space-y-2"
    >
      {question.maxSelections && (
        <p className="text-xs text-muted-foreground mb-2">
          Select up to {question.maxSelections} options
        </p>
      )}
      {question.options.map((option) => {
        const isSelected = selected.includes(option.id);
        return (
          <motion.div
            key={option.id}
            variants={listItem}
            whileHover="hover"
            whileTap="tap"
          >
            <button
              type="button"
              onClick={() => onSelect(option.id)}
              className={`w-full text-left rounded-lg border p-3 transition-colors flex items-center gap-3 ${
                isSelected
                  ? "ring-2 ring-primary bg-primary/5 border-primary"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-sm border-2 flex-shrink-0 flex items-center justify-center ${
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/40"
                }`}
              >
                {isSelected && (
                  <svg
                    className="w-3 h-3 text-primary-foreground"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                )}
              </div>
              {option.image && (
                <img
                  src={option.image.url}
                  alt={option.image.alt ?? option.label}
                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                />
              )}
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Rating options (stars)                                            */
/* ------------------------------------------------------------------ */

function RatingOptions({
  question,
  selected,
  onSelect,
}: {
  question: PollQuestion;
  selected: string[];
  onSelect: (optionId: string) => void;
}) {
  const selectedIndex = question.options.findIndex(
    (o) => o.id === selected[0],
  );

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      {question.options.map((option, i) => {
        const isFilled = selectedIndex >= 0 && i <= selectedIndex;
        return (
          <motion.button
            key={option.id}
            type="button"
            variants={pressable}
            whileHover="hover"
            whileTap="tap"
            onClick={() => onSelect(option.id)}
            className={`text-3xl transition-colors ${
              isFilled
                ? "text-amber-500"
                : "text-muted-foreground/30 hover:text-amber-300"
            }`}
            aria-label={option.label}
          >
            &#9733;
          </motion.button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Ranking options (reorderable)                                     */
/* ------------------------------------------------------------------ */

function RankingOptions({
  question,
  currentOrder,
  onMove,
}: {
  question: PollQuestion;
  currentOrder: string[];
  onMove: (optionId: string, direction: "up" | "down") => void;
}) {
  const orderedOptions = useMemo(() => {
    return currentOrder
      .map((id) => question.options.find((o) => o.id === id))
      .filter(Boolean) as PollOption[];
  }, [currentOrder, question.options]);

  return (
    <motion.div
      variants={listContainer}
      initial="hidden"
      animate="visible"
      className="space-y-2"
    >
      {orderedOptions.map((option, i) => (
        <motion.div
          key={option.id}
          variants={listItem}
          layout
          className="flex items-center gap-2 rounded-lg border border-border p-3"
        >
          <span className="text-muted-foreground text-sm select-none w-5 text-center flex-shrink-0">
            {i + 1}.
          </span>
          <span className="text-sm font-medium flex-1">{option.label}</span>
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <button
              type="button"
              disabled={i === 0}
              onClick={() => onMove(option.id, "up")}
              className="text-xs px-1 py-0.5 rounded hover:bg-muted disabled:opacity-30 transition-colors"
              aria-label={`Move ${option.label} up`}
            >
              &#9650;
            </button>
            <button
              type="button"
              disabled={i === orderedOptions.length - 1}
              onClick={() => onMove(option.id, "down")}
              className="text-xs px-1 py-0.5 rounded hover:bg-muted disabled:opacity-30 transition-colors"
              aria-label={`Move ${option.label} down`}
            >
              &#9660;
            </button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Results bars                                                      */
/* ------------------------------------------------------------------ */

function ResultsBars({
  question,
  results,
}: {
  question: PollQuestion;
  results: PollResults;
}) {
  return (
    <div className="space-y-3">
      {results.votes.map((vote) => {
        const option = question.options.find((o) => o.id === vote.optionId);
        if (!option) return null;

        return (
          <div key={vote.optionId}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {vote.percentage}% ({vote.count})
              </span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor: option.color ?? "var(--color-primary)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${vote.percentage}%` }}
                transition={{
                  type: "tween",
                  ease: "easeOut",
                  duration: 0.6,
                  delay: 0.1,
                }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground mt-2">
        Total votes: {results.totalVotes}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatQuestionType(type: PollQuestion["type"]): string {
  switch (type) {
    case "single-choice":
      return "Single choice";
    case "multi-choice":
      return "Multiple choice";
    case "rating":
      return "Rating";
    case "ranking":
      return "Ranking";
  }
}

function simulateResults(
  question: PollQuestion,
  selected: string[],
): PollResults {
  const voteCounts: { optionId: string; count: number }[] =
    question.options.map((option) => {
      const isSelected = selected.includes(option.id);
      // Give the selected option(s) a higher count
      const count = isSelected
        ? 30 + Math.floor(Math.random() * 20)
        : 5 + Math.floor(Math.random() * 25);
      return { optionId: option.id, count };
    });

  const totalVotes = voteCounts.reduce((sum, v) => sum + v.count, 0);

  const votes: PollVote[] = voteCounts.map((v) => ({
    optionId: v.optionId,
    count: v.count,
    percentage: Math.round((v.count / totalVotes) * 100),
  }));

  return {
    questionId: question.id,
    votes,
    totalVotes,
  };
}
