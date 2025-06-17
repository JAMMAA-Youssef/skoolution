"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import authService from "@/app/services/auth.service";

export default function QuizPage() {
  const { sousCompetenceId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [lastScore, setLastScore] = useState(null);

  useEffect(() => {
    const fetchQuestionsAndProgress = async () => {
      const token = Cookies.get("token");
      const user = authService.getCurrentUser();
      // Fetch questions
      const res = await axios.get(
        `/api/questions/quiz?sousCompetenceId=${sousCompetenceId}&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(res.data);
      // Fetch progress for this user and subject
      if (res.data.length > 0) {
        const subjectId = res.data[0]?.domaine || res.data[0]?.subject;
        const progressRes = await axios.get(
          `/api/progress/user/${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Find the progress for this subject
        const progress = progressRes.data.find(p => String(p.subject) === String(subjectId));
        if (progress && progress.sousCompetenceScores) {
          const score = progress.sousCompetenceScores[sousCompetenceId] || progress.sousCompetenceScores.get?.(sousCompetenceId) || 0;
          setLastScore(score);
        } else {
          setLastScore(0);
        }
      }
    };
    fetchQuestionsAndProgress();
  }, [sousCompetenceId]);

  if (!questions.length) return <div className="p-8">Chargement du quiz...</div>;

  const q = questions[current];

  const finishQuiz = async () => {
    setFinished(true);
    setSubmitError("");
    try {
      const user = authService.getCurrentUser();
      const subjectId = questions[0]?.domaine || questions[0]?.subject;
      const token = Cookies.get("token");
      await axios.post(
        "/api/progress/sous-competence-score",
        {
          userId: user._id,
          subjectId,
          sousCompetenceId,
          score: score * 1 // out of 20
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setSubmitError("Erreur lors de l'enregistrement du score.");
    }
  };

  const handleAnswer = (idx) => {
    setAnswers(a => {
      const newA = [...a];
      newA[current] = idx;
      return newA;
    });
    if (idx === q.response) setScore(s => s + 1);
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
    } else {
      finishQuiz();
    }
  };

  if (finished) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow text-center">
        <h2 className="font-bold text-2xl mb-4">Quiz terminé !</h2>
        <div className="text-lg mb-2">Votre note : <span className="font-bold">{score}/20</span></div>
        {submitError && <div className="text-red-500">{submitError}</div>}
      </div>
    );
  }

  // Progress bar width based on lastScore (out of 20)
  const progressPercent = lastScore !== null ? Math.round((lastScore / 20) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-bold text-xl">{q.sousCompetence || "Quiz"}</h2>
          <div className="text-neutral-500 text-sm">Question {current + 1} / {questions.length}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">{score * 1}</span>
          <span className="text-neutral-400">/20</span>
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="w-full h-2 bg-blue-100 rounded mr-3">
          <div className="h-2 bg-blue-500 rounded transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <span className="text-sm text-neutral-500">Dernière note : <span className="font-bold">{lastScore !== null ? lastScore : 0}/20</span></span>
      </div>
      <div className="mb-6">
        <div className="font-semibold text-lg mb-2">{q.question}</div>
        <div className="flex flex-col gap-3">
          {q.choices.map((choice, idx) => (
            <button
              key={idx}
              className="flex items-center gap-3 px-4 py-2 rounded border border-neutral-200 hover:bg-blue-50 text-left"
              onClick={() => handleAnswer(idx)}
              disabled={answers[current] !== undefined}
            >
              <span className="font-bold bg-blue-100 text-blue-700 rounded px-3 py-1">{String.fromCharCode(65 + idx)}</span>
              <span>{choice}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 