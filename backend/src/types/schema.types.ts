export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin'
}

export enum QuestionSource {
  AI = 'ai',
  MANUAL = 'manual'
}

export enum LessonFileType {
  PDF = 'pdf',
  VIDEO = 'video',
  MARKDOWN = 'markdown'
}

export interface IQuizResponse {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
}

export interface IQuizTemplateCriteria {
  difficulty?: {
    min: number;
    max: number;
  };
  bloomLevel?: string[];
  domain?: string[];
  topic?: string[];
}

export interface IEvaluationPerformance {
  scoresByCompetence: {
    [competenceId: string]: number;
  };
  progress: {
    previousScore: number;
    currentScore: number;
    improvement: number;
  };
  strengths: string[];
  weaknesses: string[];
} 