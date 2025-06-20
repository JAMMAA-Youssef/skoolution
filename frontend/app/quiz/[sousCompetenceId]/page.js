"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/app/services/api";
import authService from "@/app/services/auth.service";

export default function QuizPage() {
  const { sousCompetenceId } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [session, setSession] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [lastScore, setLastScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAbility, setCurrentAbility] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerStatus, setAnswerStatus] = useState('unanswered'); // unanswered, answered

  useEffect(() => {
    const initializeAdaptiveQuiz = async () => {
      setIsLoading(true);
      try {
      const user = authService.getCurrentUser();
        console.log('Current user:', user);
        
        if (!user) {
          setSubmitError("Utilisateur non connecté. Veuillez vous connecter.");
          return;
        }

        // First, get a question to determine the subjectId
        const questionsRes = await api.get(`/questions/quiz?sousCompetenceId=${sousCompetenceId}&limit=1`);
        if (!questionsRes.data || questionsRes.data.length === 0) {
          setSubmitError("Aucune question disponible pour cette compétence.");
          return;
        }

        const subjectId = questionsRes.data[0].domaine;

        // Initialize adaptive test
        const adaptiveRes = await api.post(
          `/questions/adaptive/initialize`,
          {
            sousCompetenceId,
            subjectId,
            maxQuestions: 20
          }
        );

        console.log('Adaptive response:', adaptiveRes.data);

        setSession(adaptiveRes.data.session);
        setCurrentQuestion(adaptiveRes.data.firstQuestion);
        setCurrentAbility(adaptiveRes.data.session.currentAbility);
        setQuestionCount(1);

        // Fetch previous progress for comparison
        if (adaptiveRes.data.firstQuestion) {
          const progressRes = await api.get(`/progress/user/${user._id}`);
          
        const progress = progressRes.data.find(p =>
          (p.subject && (p.subject._id === subjectId || p.subject === subjectId))
        );
          
        if (progress && progress.sousCompetenceScores) {
          let arr = progress.sousCompetenceScores[sousCompetenceId] || progress.sousCompetenceScores.get?.(sousCompetenceId);
          if (Array.isArray(arr) && arr.length > 0) {
            setLastScore(arr[arr.length - 1]);
          } else {
            setLastScore(0);
          }
        } else {
          setLastScore(0);
        }
        }
      } catch (error) {
        console.error('Error initializing adaptive quiz:', error);
        console.error('Error details:', error.response?.data);
        setSubmitError("Erreur lors de l'initialisation du quiz adaptatif.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAdaptiveQuiz();
  }, [sousCompetenceId]);

  const handleSelectAnswer = (index) => {
    if (answerStatus === 'unanswered') {
      setSelectedAnswer(index);
    }
  };

  const handleValidate = async () => {
    if (selectedAnswer === null) return;

    if (answerStatus === 'answered') {
      // This is now the "Next" button's action
      setIsLoading(true);
      
      try {
        const result = await api.post(
          `/questions/adaptive/response`,
          {
            sessionId: session.sessionId,
            questionId: currentQuestion._id,
            response: selectedAnswer
          }
        );

        // Reset for next question
        setSelectedAnswer(null);
        setAnswerStatus('unanswered');
        
        // Update session and ability
        setSession(result.data.session);
        setCurrentAbility(result.data.session.currentAbility);
        setQuestionCount(result.data.session.responses.length + 1);

        // Update score
        const correctAnswers = result.data.session.responses.filter(r => r.correct).length;
        setScore(correctAnswers);

        if (result.data.isComplete) {
          // Test is complete
          setFinished(true);
          
          // Save final score to progress
          const user = authService.getCurrentUser();
          const subjectId = currentQuestion.domaine;
          
          await api.post(
            "/progress/sous-competence-score",
            {
              userId: user._id,
              subjectId,
              sousCompetenceId,
              score: result.data.finalScore
            }
          );
        } else {
          // Continue with next question
          setCurrentQuestion(result.data.nextQuestion);
        }
      } catch (error) {
        console.error('Error submitting answer:', error);
        setSubmitError("Erreur lors de la soumission de la réponse.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // This is the "Validate" button's action
      setAnswerStatus('answered');
    }
  };

  const cleanChoice = (choice) => {
    if (!choice) return '';
    // Remove escaped semicolons and other unwanted characters
    return choice.replace(/\\;/g, '').replace(/\\/g, '').trim();
  };

  if (isLoading && !currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-skblue mx-auto mb-4"></div>
        <p className="text-skgray">Initialisation du quiz adaptatif...</p>
      </div>
    );
  }

  if (finished) {
    const finalScore = Math.round((score / 20) * 20);
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow text-center">
        <h2 className="font-bold text-2xl mb-4">Quiz adaptatif terminé !</h2>
        <div className="text-lg mb-2">Votre note : <span className="font-bold">{finalScore}/20</span></div>
        <div className="text-sm text-skgray mb-4">
          Niveau estimé : <span className="font-semibold">{currentAbility.toFixed(2)}</span>
        </div>
        <div className="text-sm text-skgray mb-4">
          Questions répondues : 20 / 20
        </div>
        <div className="text-sm text-skgray mb-4">
          Réponses correctes : {score} / 20
        </div>
        {submitError && <div className="text-red-500">{submitError}</div>}
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow text-center">
        <p className="text-skgray">Aucune question disponible pour cette compétence.</p>
      </div>
    );
  }

  // Progress bar width based on lastScore (out of 20)
  const progressPercent = lastScore !== null ? Math.round((lastScore / 20) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow relative">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-bold text-xl">{currentQuestion.sousCompetence || "Quiz Adaptatif"}</h2>
          <div className="text-neutral-500 text-sm">Question {questionCount} / 20</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">{score}</span>
          <span className="text-neutral-400">réponses correctes</span>
        </div>
      </div>

      {/* Progress bar for previous performance */}
      <div className="flex items-center mb-2">
        <div className="w-full h-2 bg-blue-100 rounded mr-3">
          <div className="h-2 bg-blue-500 rounded transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <span className="text-sm text-neutral-500">Dernière note : <span className="font-bold">{lastScore !== null ? lastScore : 0}/20</span></span>
      </div>

      <div className="mb-6">
        <div className="font-semibold text-lg mb-4">{currentQuestion.question}</div>
      </div>

      {/* Current ability indicator */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-skgray">
          Niveau estimé : <span className="font-semibold text-skblue">{currentAbility.toFixed(2)}</span>
        </p>
        <p className="text-xs text-skgray mt-1">
          {currentAbility < -1.5 && "Niveau débutant"}
          {currentAbility >= -1.5 && currentAbility < -0.5 && "Niveau intermédiaire"}
          {currentAbility >= -0.5 && currentAbility < 0.5 && "Niveau moyen"}
          {currentAbility >= 0.5 && currentAbility < 1.5 && "Niveau avancé"}
          {currentAbility >= 1.5 && "Niveau expert"}
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {currentQuestion.choices.map((choice, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = currentQuestion.response === index;
          let choiceClass = "border-gray-300 hover:border-skblue";

          if (answerStatus === 'answered') {
            if (isCorrect) {
              choiceClass = "border-green-500 bg-green-50 text-green-800";
            } else if (isSelected && !isCorrect) {
              choiceClass = "border-red-500 bg-red-50 text-red-800";
            } else {
              choiceClass = "border-gray-300 text-gray-500";
            }
          } else if (isSelected) {
            choiceClass = "border-skblue bg-blue-50";
          }

          return (
            <div
              key={index}
              onClick={() => handleSelectAnswer(index)}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${choiceClass}`}
            >
              <span className="font-bold mr-4">{String.fromCharCode(65 + index)}</span>
              <p>{cleanChoice(choice)}</p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleValidate}
          disabled={selectedAnswer === null || isLoading}
          className={`px-8 py-3 rounded-lg font-bold text-white transition-all duration-300 ${
            answerStatus === 'answered' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-skblue hover:bg-skdark-blue'
          } disabled:bg-gray-400 disabled:cursor-not-allowed`}
        >
          {answerStatus === 'answered' ? 'Suivant' : 'Valider'}
        </button>
      </div>

      <div className="text-center mt-4">
        <p className="text-xs text-skgray">
          Difficulté : {currentQuestion.difficultyLevel} (b = {currentQuestion.b.toFixed(2)})
        </p>
      </div>
    </div>
  );
} 