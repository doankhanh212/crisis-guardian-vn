import { useEffect, useRef, useState, type FormEvent } from "react";
import type { GameMode } from "@/game/data";
import { LandingHero } from "@/game/landing/LandingHero";
import { ParticipantForm } from "@/game/landing/ParticipantForm";
import { AgreementGate } from "@/game/landing/AgreementGate";
import { HQGQuiz } from "@/game/landing/HQGQuiz";
import { QuizComplete } from "@/game/landing/QuizComplete";
import { SafetyNote } from "@/game/landing/SafetyNote";
import { FEEDBACK_MS, HQG_QUIZ } from "@/game/landing/quizData";
import type { LandingStep, QuizAnswer, QuizFeedback, QuizKey } from "@/game/landing/types";

interface Props {
  onStart: (mode: GameMode, teamName: string) => void;
}

const UNIFIED_MODE: GameMode = "default";
const GUEST_NAME = "Khách tham gia";

export function Landing({ onStart }: Props) {
  const [step, setStep] = useState<LandingStep>("form");
  const [playerName, setPlayerName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [activeFeedback, setActiveFeedback] = useState<QuizFeedback | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trimmedName = playerName.trim();
  const displayName = trimmedName || GUEST_NAME;
  const canContinue = trimmedName.length > 0;
  const currentQuestion = HQG_QUIZ[quizIndex];

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canContinue) return;
    setStep("agreement");
  }

  function startGame() {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    onStart(UNIFIED_MODE, displayName);
  }

  function startHostMode() {
    onStart("stage", "Host Mode");
  }

  function advanceQuizFeedback() {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    setActiveFeedback(null);
    if (quizIndex + 1 >= HQG_QUIZ.length) {
      setStep("complete");
    } else {
      setQuizIndex((index) => index + 1);
    }
  }

  function selectAnswer(selected: QuizKey) {
    if (activeFeedback) return;

    const correct = selected === currentQuestion.correct;
    setQuizAnswers((answers) => [
      ...answers,
      { questionIndex: quizIndex, selected, correct },
    ]);
    setActiveFeedback({
      selected,
      correct,
      message: correct ? currentQuestion.correctFeedback : currentQuestion.wrongFeedback,
    });

    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(advanceQuizFeedback, FEEDBACK_MS);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden grid-bg">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.08_0.025_260/0.15),oklch(0.05_0.02_260/0.78))]" />
      <button
        onClick={startHostMode}
        className="absolute right-4 top-4 z-20 text-xs uppercase tracking-widest text-muted-foreground hover:text-neon-blue transition"
      >
        Host Mode
      </button>

      <div className="relative w-full max-w-5xl">
        <LandingHero />

        {step === "form" && (
          <ParticipantForm
            playerName={playerName}
            company={company}
            phone={phone}
            canContinue={canContinue}
            onPlayerNameChange={setPlayerName}
            onCompanyChange={setCompany}
            onPhoneChange={setPhone}
            onSubmit={handleFormSubmit}
          />
        )}

        {step === "agreement" && (
          <AgreementGate onAgree={() => setStep("quiz")} />
        )}

        {step === "quiz" && (
          <HQGQuiz
            quizIndex={quizIndex}
            currentQuestion={currentQuestion}
            activeFeedback={activeFeedback}
            onSelectAnswer={selectAnswer}
            onContinueFeedback={advanceQuizFeedback}
            onSkip={startGame}
          />
        )}

        {step === "complete" && (
          <QuizComplete
            answeredCount={quizAnswers.length}
            totalQuestions={HQG_QUIZ.length}
            onStartGame={startGame}
          />
        )}

        <SafetyNote />
      </div>
    </div>
  );
}
