import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdaptiveQuizSession, QuestionResponse, PerformanceByDifficulty, LearningPattern } from './schemas/adaptive-quiz-session.schema';

@Injectable()
export class AdaptiveQuizAnalyticsService {
  constructor(
    @InjectModel(AdaptiveQuizSession.name) private adaptiveQuizModel: Model<AdaptiveQuizSession>
  ) {}

  /**
   * Validate analytics data before processing
   */
  validateAnalyticsData(responses: QuestionResponse[], abilityProgression: number[]): boolean {
    // Check for valid responses
    if (!responses || responses.length === 0) {
      console.warn('No responses provided for analytics');
      return false;
    }

    // Check for valid ability progression
    if (!abilityProgression || abilityProgression.length === 0) {
      console.warn('No ability progression provided for analytics');
      return false;
    }

    // Check for reasonable ability values
    for (let i = 0; i < abilityProgression.length; i++) {
      if (!isFinite(abilityProgression[i]) || Math.abs(abilityProgression[i]) > 10) {
        console.warn(`Invalid ability value at index ${i}: ${abilityProgression[i]}`);
        return false;
      }
    }

    // Check for valid response data
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      if (!isFinite(response.difficulty) || !isFinite(response.abilityBefore) || !isFinite(response.abilityAfter)) {
        console.warn(`Invalid response data at index ${i}:`, response);
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate performance by difficulty level with validation
   */
  calculatePerformanceByDifficulty(responses: QuestionResponse[]): PerformanceByDifficulty {
    // Validate input
    if (!this.validateAnalyticsData(responses, [])) {
      return {
        easy: { correct: 0, total: 0 },
        medium: { correct: 0, total: 0 },
        hard: { correct: 0, total: 0 }
      };
    }

    const performance = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 }
    };

    responses.forEach(response => {
      if (response.difficulty < -1) {
        performance.easy.total++;
        if (response.correct) performance.easy.correct++;
      } else if (response.difficulty > 1) {
        performance.hard.total++;
        if (response.correct) performance.hard.correct++;
      } else {
        performance.medium.total++;
        if (response.correct) performance.medium.correct++;
      }
    });

    return performance;
  }

  /**
   * Calculate learning patterns and insights with validation
   */
  calculateLearningPatterns(responses: QuestionResponse[], abilityProgression: number[]): LearningPattern {
    // Validate input
    if (!this.validateAnalyticsData(responses, abilityProgression)) {
      return {
        consistency: 0,
        optimalChallengeZone: 0,
        learningEfficiency: 0,
        engagementLevel: 0
      };
    }

    // Calculate consistency (how stable performance was)
    const correctResponses = responses.map(r => r.correct ? 1 : 0);
    const consistency = this.calculateConsistency(correctResponses);

    // Find optimal challenge zone (difficulty where student performs best)
    const optimalChallengeZone = this.findOptimalChallengeZone(responses);

    // Calculate learning efficiency (how quickly ability estimate stabilized)
    const learningEfficiency = this.calculateLearningEfficiency(abilityProgression);

    // Calculate engagement level (based on response patterns)
    const engagementLevel = this.calculateEngagementLevel(responses);

    return {
      consistency,
      optimalChallengeZone,
      learningEfficiency,
      engagementLevel
    };
  }

  /**
   * Calculate performance consistency
   */
  private calculateConsistency(correctResponses: number[]): number {
    if (correctResponses.length < 2) return 1;

    let consistency = 0;
    for (let i = 1; i < correctResponses.length; i++) {
      if (correctResponses[i] === correctResponses[i - 1]) {
        consistency++;
      }
    }
    return consistency / (correctResponses.length - 1);
  }

  /**
   * Find optimal challenge zone
   */
  private findOptimalChallengeZone(responses: QuestionResponse[]): number {
    const difficultyGroups = new Map<number, { correct: number; total: number }>();

    responses.forEach(response => {
      const difficulty = Math.round(response.difficulty * 2) / 2; // Round to nearest 0.5
      if (!difficultyGroups.has(difficulty)) {
        difficultyGroups.set(difficulty, { correct: 0, total: 0 });
      }
      const group = difficultyGroups.get(difficulty)!;
      group.total++;
      if (response.correct) group.correct++;
    });

    let bestDifficulty = 0;
    let bestPerformance = 0;

    difficultyGroups.forEach((performance, difficulty) => {
      const successRate = performance.correct / performance.total;
      if (successRate > bestPerformance && performance.total >= 2) {
        bestPerformance = successRate;
        bestDifficulty = difficulty;
      }
    });

    return bestDifficulty;
  }

  /**
   * Calculate learning efficiency
   */
  private calculateLearningEfficiency(abilityProgression: number[]): number {
    if (abilityProgression.length < 5) return 0;

    // Calculate how quickly the ability estimate stabilized
    const earlyAbility = abilityProgression.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
    const lateAbility = abilityProgression.slice(-5).reduce((a, b) => a + b, 0) / 5;
    
    // If ability changed significantly, learning was inefficient
    const stability = 1 - Math.abs(lateAbility - earlyAbility) / Math.max(Math.abs(earlyAbility), 0.1);
    return Math.max(0, stability);
  }

  /**
   * Calculate engagement level
   */
  private calculateEngagementLevel(responses: QuestionResponse[]): number {
    if (responses.length === 0) return 0;

    // Factors that indicate engagement:
    // 1. Consistent response times (not too fast, not too slow)
    // 2. Good performance on appropriate difficulty questions
    // 3. No pattern of random guessing

    let engagementScore = 0;
    let totalFactors = 0;

    // Factor 1: Performance on questions near student's ability level
    const avgAbility = responses.reduce((sum, r) => sum + r.abilityBefore, 0) / responses.length;
    const appropriateQuestions = responses.filter(r => Math.abs(r.difficulty - avgAbility) < 1);
    if (appropriateQuestions.length > 0) {
      const appropriatePerformance = appropriateQuestions.filter(r => r.correct).length / appropriateQuestions.length;
      engagementScore += appropriatePerformance;
      totalFactors++;
    }

    // Factor 2: Consistency in performance
    const consistency = this.calculateConsistency(responses.map(r => r.correct ? 1 : 0));
    engagementScore += consistency;
    totalFactors++;

    // Factor 3: No obvious guessing patterns
    const consecutiveSameAnswers = this.countConsecutiveSameAnswers(responses);
    const guessingPenalty = Math.min(consecutiveSameAnswers / responses.length, 0.5);
    engagementScore += (1 - guessingPenalty);
    totalFactors++;

    return totalFactors > 0 ? engagementScore / totalFactors : 0;
  }

  /**
   * Count consecutive same answers (potential guessing)
   */
  private countConsecutiveSameAnswers(responses: QuestionResponse[]): number {
    let count = 0;
    for (let i = 1; i < responses.length; i++) {
      if (responses[i].studentResponse === responses[i - 1].studentResponse) {
        count++;
      }
    }
    return count;
  }

  /**
   * Calculate question selection effectiveness
   */
  calculateQuestionSelectionEffectiveness(responses: QuestionResponse[]): number[] {
    return responses.map((response, index) => {
      // Effectiveness is based on how close the question difficulty was to student's ability
      const distance = Math.abs(response.difficulty - response.abilityBefore);
      // Lower distance = higher effectiveness
      return Math.max(0, 1 - distance / 3);
    });
  }

  /**
   * Calculate information gain for each question
   */
  calculateInformationGain(responses: QuestionResponse[]): number[] {
    return responses.map((response, index) => {
      // Information gain is based on how much the ability estimate changed
      const abilityChange = Math.abs(response.abilityAfter - response.abilityBefore);
      return abilityChange;
    });
  }

  /**
   * Get historical context for a student
   */
  async getHistoricalContext(userId: string, sousCompetenceId: string): Promise<{
    previousAbility: number;
    attemptsCount: number;
    averageAbility: number;
  }> {
    const previousSessions = await this.adaptiveQuizModel
      .find({ userId, sousCompetenceId, isCompleted: true })
      .sort({ startTime: -1 })
      .limit(5);

    if (previousSessions.length === 0) {
      return {
        previousAbility: 0,
        attemptsCount: 0,
        averageAbility: 0
      };
    }

    const previousAbility = previousSessions[0].finalAbility;
    const attemptsCount = previousSessions.length;
    const averageAbility = previousSessions.reduce((sum, session) => sum + session.finalAbility, 0) / previousSessions.length;

    return {
      previousAbility,
      attemptsCount,
      averageAbility
    };
  }

  /**
   * Calculate class statistics for comparative analytics
   */
  async calculateClassStatistics(sousCompetenceId: string, currentAbility: number): Promise<{
    classAverageAbility: number;
    percentileRank: number;
  }> {
    const recentSessions = await this.adaptiveQuizModel
      .find({ 
        sousCompetenceId, 
        isCompleted: true,
        startTime: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      })
      .select('finalAbility');

    if (recentSessions.length === 0) {
      return {
        classAverageAbility: currentAbility,
        percentileRank: 50
      };
    }

    const abilities = recentSessions.map(s => s.finalAbility);
    const classAverageAbility = abilities.reduce((sum, ability) => sum + ability, 0) / abilities.length;

    // Calculate percentile rank
    const sortedAbilities = abilities.sort((a, b) => a - b);
    const rank = sortedAbilities.findIndex(ability => ability >= currentAbility);
    const percentileRank = rank === -1 ? 100 : (rank / sortedAbilities.length) * 100;

    return {
      classAverageAbility,
      percentileRank
    };
  }

  /**
   * Generate comprehensive analytics report
   */
  async generateAnalyticsReport(sessionId: string): Promise<any> {
    const session = await this.adaptiveQuizModel.findOne({ sessionId });
    if (!session) {
      throw new Error('Session not found');
    }

    const performanceByDifficulty = this.calculatePerformanceByDifficulty(session.responses);
    const learningPattern = this.calculateLearningPatterns(session.responses, session.abilityProgression);
    const questionSelectionEffectiveness = this.calculateQuestionSelectionEffectiveness(session.responses);
    const informationGain = this.calculateInformationGain(session.responses);

    return {
      sessionId: session.sessionId,
      basicInfo: {
        userId: session.userId,
        sousCompetenceId: session.sousCompetenceId,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.totalDuration
      },
      finalResults: {
        score: session.finalScore,
        ability: session.finalAbility,
        standardError: session.standardError,
        abilityLevel: session.abilityLevel
      },
      performance: {
        byDifficulty: performanceByDifficulty,
        learningPattern,
        abilityProgression: session.abilityProgression
      },
      algorithmPerformance: {
        questionSelectionEffectiveness,
        informationGain
      },
      comparative: {
        classAverage: session.classAverageAbility,
        percentileRank: session.percentileRank,
        previousAbility: session.previousAbility,
        improvement: session.abilityImprovement
      }
    };
  }
} 