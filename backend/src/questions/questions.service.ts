import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question } from './schemas/question.schema';
import { CreateQuestionDto } from './dto/create-question.dto';
import { AdaptiveQuizAnalyticsService } from '../adaptive-quiz/adaptive-quiz-analytics.service';
import { AdaptiveQuizSession } from '../adaptive-quiz/schemas/adaptive-quiz-session.schema';

export interface AdaptiveSession {
  sessionId: string;
  userId: string;
  sousCompetenceId: string;
  currentAbility: number;
  standardError: number;
  responses: Array<{
    questionId: string;
    response: number;
    correct: boolean;
    itemDifficulty: number;
  }>;
  answeredQuestionIds: string[];
  maxQuestions: number;
  startTime: Date;
  subjectId: string;
}

@Injectable()
export class QuestionsService {
  private adaptiveSessions = new Map<string, AdaptiveSession>();
  private readonly logger = new Logger(QuestionsService.name);

  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(AdaptiveQuizSession.name) private adaptiveQuizModel: Model<AdaptiveQuizSession>,
    private readonly analyticsService: AdaptiveQuizAnalyticsService
  ) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const question = new this.questionModel(createQuestionDto);
    return question.save();
  }

  async createMany(createQuestionDtos: CreateQuestionDto[]) {
    return this.questionModel.insertMany(createQuestionDtos);
  }

  async findByTeacher(teacherId: string) {
    return this.questionModel.find({ teacher: teacherId })
      .populate('competence')
      .populate('domaine');
  }

  async findAllPopulated() {
    return this.questionModel.find()
      .populate('competence')
      .populate('domaine');
  }

  async findBySousCompetence(sousCompetenceId: string, limit: number = 20) {
    return this.questionModel.find({ competence: sousCompetenceId }).limit(limit);
  }

  // ===== 1PL ADAPTIVE TESTING METHODS =====

  /**
   * Initialize adaptive test session
   */
  async initializeAdaptiveTest(
    userId: string,
    sousCompetenceId: string,
    subjectId: string,
    maxQuestions: number = 20
  ): Promise<{ session: AdaptiveSession; firstQuestion: Question }> {
    this.logger.log(`Initializing adaptive test with:`, {
      userId,
      sousCompetenceId,
      subjectId,
      maxQuestions
    });

    const sessionId = `adaptive_${Date.now()}_${userId}`;
    
    const session: AdaptiveSession = {
      sessionId,
      userId,
      sousCompetenceId,
      subjectId,
      currentAbility: 0.0, // Start with neutral ability
      standardError: 1.0,
      responses: [],
      answeredQuestionIds: [],
      maxQuestions: 20, // Always 20 questions
      startTime: new Date()
    };

    this.logger.log(`Created session:`, session);

    this.adaptiveSessions.set(sessionId, session);

    // Get first question using 1PL selection
    const firstQuestion = await this.selectNextAdaptiveQuestion(session);

    return { session, firstQuestion };
  }

  /**
   * Select next question using 1PL algorithm
   */
  async selectNextAdaptiveQuestion(session: AdaptiveSession): Promise<Question> {
    console.log('Selecting next question for session:', session.sessionId);
    console.log('Looking for questions with competence:', session.sousCompetenceId);
    
    // Get available questions (not yet answered)
    const availableQuestions = await this.questionModel.find({
      competence: session.sousCompetenceId,
      _id: { $nin: session.answeredQuestionIds }
    });

    console.log('Found available questions:', availableQuestions.length);

    if (availableQuestions.length === 0) {
      throw new Error('No more questions available');
    }

    // Select question closest to current ability estimate
    let bestQuestion = availableQuestions[0];
    let minDistance = Math.abs(bestQuestion.b - session.currentAbility);

    for (const question of availableQuestions) {
      const distance = Math.abs(question.b - session.currentAbility);
      if (distance < minDistance) {
        minDistance = distance;
        bestQuestion = question;
      }
    }

    console.log('Selected question:', bestQuestion._id, 'with difficulty:', bestQuestion.b);
    return bestQuestion;
  }

  /**
   * Process response and update ability estimate using 1PL
   */
  async processAdaptiveResponse(
    sessionId: string,
    questionId: string,
    response: number
  ): Promise<{
    session: AdaptiveSession;
    nextQuestion?: Question;
    isComplete: boolean;
    finalScore?: number;
  }> {
    const session = this.adaptiveSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Get question details
    const question = await this.questionModel.findById(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    // Store ability before response
    const abilityBefore = session.currentAbility;

    // Determine if response is correct
    const correct = response === question.response;

    // Add response to session
    session.responses.push({
      questionId,
      response,
      correct,
      itemDifficulty: question.b
    });

    session.answeredQuestionIds.push(questionId);

    // Log response details for debugging
    this.logger.debug(`Response ${session.responses.length}:`, {
      questionId,
      difficulty: question.b,
      response,
      correct,
      abilityBefore
    });

    // Update ability estimate using 1PL algorithm
    const newAbility = this.updateAbilityEstimate(session);
    session.currentAbility = newAbility;
    session.standardError = this.calculateStandardError(session);

    // Log ability update
    this.logger.debug(`Ability update: ${abilityBefore} -> ${newAbility} (SE: ${session.standardError})`);

    // Check if test should terminate
    const isComplete = this.shouldTerminateAdaptiveTest(session);

    let nextQuestion: Question | undefined;
    let finalScore: number | undefined;

    if (isComplete) {
      // Calculate final score (out of 20)
      const correctAnswers = session.responses.filter(r => r.correct).length;
      finalScore = correctAnswers;

      this.logger.log(`Quiz completed. Final score: ${finalScore}/20, Final ability: ${session.currentAbility}`);

      // Save comprehensive session data
      await this.saveAdaptiveSession(session, question, abilityBefore, finalScore);
    } else {
      // Get next question
      nextQuestion = await this.selectNextAdaptiveQuestion(session);
    }

    return {
      session,
      nextQuestion,
      isComplete,
      finalScore
    };
  }

  /**
   * Save comprehensive adaptive session data
   */
  private async saveAdaptiveSession(
    session: AdaptiveSession, 
    lastQuestion: Question, 
    abilityBefore: number, 
    finalScore: number
  ): Promise<void> {
    try {
      this.logger.log(`Starting to save adaptive session: ${session.sessionId}`);
      this.logger.log(`Session data:`, {
        userId: session.userId,
        subjectId: session.subjectId,
        sousCompetenceId: session.sousCompetenceId,
        finalScore,
        finalAbility: session.currentAbility
      });

      // Get historical context
      const historicalContext = await this.analyticsService.getHistoricalContext(
        session.userId, 
        session.sousCompetenceId
      );

      // Calculate class statistics
      const classStats = await this.analyticsService.calculateClassStatistics(
        session.sousCompetenceId, 
        session.currentAbility
      );

      // Prepare responses with full analytics data
      const detailedResponses = session.responses.map((response, index) => ({
        questionId: new Types.ObjectId(response.questionId),
        difficulty: response.itemDifficulty,
        studentResponse: response.response,
        correct: response.correct,
        abilityBefore: index === 0 ? 0 : this.calculateAbilityAtStep(session.responses, index - 1),
        abilityAfter: this.calculateAbilityAtStep(session.responses, index),
        questionNumber: index + 1
      }));

      // Calculate ability progression (20 data points)
      const abilityProgression = this.calculateAbilityProgression(session.responses);

      // Calculate performance by difficulty
      const performanceByDifficulty = this.analyticsService.calculatePerformanceByDifficulty(detailedResponses);

      // Calculate learning patterns
      const learningPattern = this.analyticsService.calculateLearningPatterns(detailedResponses, abilityProgression);

      // Calculate algorithm performance metrics
      const questionSelectionEffectiveness = this.analyticsService.calculateQuestionSelectionEffectiveness(detailedResponses);
      const informationGain = this.analyticsService.calculateInformationGain(detailedResponses);

      // Determine ability level
      const abilityLevel = this.getAbilityLevel(session.currentAbility);

      // Create comprehensive session record
      const sessionData = {
        userId: session.userId,
        subjectId: session.subjectId,
        sousCompetenceId: session.sousCompetenceId,
        sessionId: session.sessionId,
        startTime: session.startTime,
        endTime: new Date(),
        totalDuration: Date.now() - session.startTime.getTime(),
        finalScore,
        finalAbility: session.currentAbility,
        standardError: session.standardError,
        abilityLevel,
        responses: detailedResponses,
        abilityProgression,
        performanceByDifficulty,
        learningPattern,
        previousAbility: historicalContext.previousAbility,
        abilityImprovement: session.currentAbility - historicalContext.previousAbility,
        attemptsCount: historicalContext.attemptsCount + 1,
        questionSelectionEffectiveness,
        informationGain,
        classAverageAbility: classStats.classAverageAbility,
        percentileRank: classStats.percentileRank,
        isCompleted: true,
        algorithmVersion: '1.0'
      };

      this.logger.log(`Session data to save:`, sessionData);

      const adaptiveSession = new this.adaptiveQuizModel(sessionData);

      await adaptiveSession.save();
      this.logger.log(`Saved comprehensive adaptive session data for session: ${session.sessionId}`);

    } catch (error) {
      this.logger.error(`Error saving adaptive session data: ${error.message}`);
      this.logger.error(`Full error:`, error);
      // Don't throw error to avoid breaking the quiz flow
    }
  }

  /**
   * Calculate ability progression (20 data points)
   */
  private calculateAbilityProgression(responses: any[]): number[] {
    const progression = [0]; // Start with neutral ability
    
    for (let i = 0; i < responses.length; i++) {
      const stepResponses = responses.slice(0, i + 1);
      let ability = this.calculateAbilityAtStep(responses, i);
      
      // Apply safety bounds to each step
      ability = this.clampAbility(ability);
      
      // Validate the ability estimate
      if (!this.isValidAbility(ability)) {
        this.logger.warn(`Invalid ability at step ${i}, using previous value`);
        ability = progression[progression.length - 1];
      }
      
      progression.push(ability);
    }

    // Pad to 20 points if needed
    while (progression.length < 20) {
      progression.push(progression[progression.length - 1]);
    }

    return progression.slice(0, 20);
  }

  /**
   * Calculate ability at a specific step with safety checks
   */
  private calculateAbilityAtStep(responses: any[], step: number): number {
    if (step < 0) return 0;
    
    const stepResponses = responses.slice(0, step + 1);
    
    // Check for edge cases
    const allCorrect = stepResponses.every(r => r.correct);
    const allIncorrect = stepResponses.every(r => !r.correct);
    
    if (allCorrect) return 3.0;
    if (allIncorrect) return -3.0;
    
    // Use a simplified calculation for intermediate steps
    let ability = 0;
    let correctCount = 0;
    
    for (const response of stepResponses) {
      if (response.correct) correctCount++;
    }
    
    // Simple proportion-based estimate for intermediate steps
    const proportion = correctCount / stepResponses.length;
    ability = (proportion - 0.5) * 6; // Scale to [-3, 3] range
    
    return this.clampAbility(ability);
  }

  /**
   * Get ability level description
   */
  private getAbilityLevel(ability: number): string {
    if (ability < -1.5) return 'Débutant';
    if (ability < -0.5) return 'Intermédiaire';
    if (ability < 0.5) return 'Moyen';
    if (ability < 1.5) return 'Avancé';
    return 'Expert';
  }

  /**
   * Update ability estimate using Maximum Likelihood Estimation (MLE)
   */
  private updateAbilityEstimate(session: AdaptiveSession): number {
    if (session.responses.length === 0) {
      return session.currentAbility;
    }

    // Check for edge cases - all correct or all incorrect
    const allCorrect = session.responses.every(r => r.correct);
    const allIncorrect = session.responses.every(r => !r.correct);
    
    if (allCorrect) {
      this.logger.warn('All responses correct, setting ability to maximum');
      return 3.0;
    }
    
    if (allIncorrect) {
      this.logger.warn('All responses incorrect, setting ability to minimum');
      return -3.0;
    }

    let numerator = 0;
    let denominator = 0;

    for (const response of session.responses) {
      const p = this.calculateResponseProbability(session.currentAbility, response.itemDifficulty);
      const weight = p * (1 - p);
      
      // Prevent division by zero by ensuring weight is not too small
      const safeWeight = Math.max(weight, 0.001);
      
      numerator += (response.correct ? 1 : 0) - p;
      denominator += safeWeight;
    }

    // Prevent division by zero
    if (Math.abs(denominator) < 0.001) {
      this.logger.warn('Denominator too small, using previous ability estimate');
      return session.currentAbility;
    }

    let newAbility = session.currentAbility + numerator / denominator;

    // Validate the result
    if (!this.isValidAbility(newAbility)) {
      this.logger.warn(`Invalid ability estimate: ${newAbility}, resetting to reasonable value`);
      newAbility = this.clampAbility(session.currentAbility);
    }

    // Apply bounds to prevent extreme values
    newAbility = this.clampAbility(newAbility);

    this.logger.debug(`Ability update: ${session.currentAbility} -> ${newAbility}`);
    return newAbility;
  }

  /**
   * Calculate response probability using 1PL formula with numerical stability
   */
  private calculateResponseProbability(ability: number, difficulty: number): number {
    const logit = ability - difficulty;
    
    // Prevent overflow by clamping the logit value
    const clampedLogit = Math.max(-10, Math.min(10, logit));
    
    const probability = 1 / (1 + Math.exp(-clampedLogit));
    
    // Ensure probability is within valid range
    return Math.max(0.001, Math.min(0.999, probability));
  }

  /**
   * Check if ability estimate is valid
   */
  private isValidAbility(ability: number): boolean {
    return isFinite(ability) && !isNaN(ability) && Math.abs(ability) < 100;
  }

  /**
   * Clamp ability estimate to reasonable bounds
   */
  private clampAbility(ability: number): number {
    // Clamp to [-5, 5] range for numerical stability
    return Math.max(-5, Math.min(5, ability));
  }

  /**
   * Calculate standard error of ability estimate with safety checks
   */
  private calculateStandardError(session: AdaptiveSession): number {
    if (session.responses.length === 0) {
      return 1.0;
    }

    let information = 0;
    for (const response of session.responses) {
      const p = this.calculateResponseProbability(session.currentAbility, response.itemDifficulty);
      information += p * (1 - p);
    }

    // Prevent division by zero and ensure reasonable bounds
    if (information < 0.001) {
      this.logger.warn('Information too small, using default standard error');
      return 1.0;
    }

    const standardError = 1 / Math.sqrt(information);
    
    // Clamp standard error to reasonable bounds
    return Math.max(0.1, Math.min(5.0, standardError));
  }

  /**
   * Determine if adaptive test should terminate
   */
  private shouldTerminateAdaptiveTest(session: AdaptiveSession): boolean {
    // Terminate if exactly 20 questions reached
    if (session.responses.length >= 20) {
      return true;
    }

    return false;
  }

  /**
   * Get adaptive session
   */
  getAdaptiveSession(sessionId: string): AdaptiveSession | undefined {
    return this.adaptiveSessions.get(sessionId);
  }

  /**
   * Clean up adaptive session
   */
  cleanupAdaptiveSession(sessionId: string): void {
    this.adaptiveSessions.delete(sessionId);
  }
} 