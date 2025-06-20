import api from './api';

class AdaptiveAnalyticsService {
  /**
   * Get comprehensive analytics report for a session
   */
  async getAnalyticsReport(sessionId) {
    try {
      const response = await api.get(`/adaptive-quiz/analytics/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting analytics report:', error);
      throw error;
    }
  }

  /**
   * Get student progress over time
   */
  async getStudentProgress(userId, sousCompetenceId = null) {
    try {
      const params = sousCompetenceId ? `?sousCompetenceId=${sousCompetenceId}` : '';
      const response = await api.get(`/adaptive-quiz/student-progress/${userId}${params}`);
      return response.data;
    } catch (error) {
      console.error('Error getting student progress:', error);
      throw error;
    }
  }

  /**
   * Get class analytics for a competence
   */
  async getClassAnalytics(sousCompetenceId) {
    try {
      const response = await api.get(`/adaptive-quiz/class-analytics/${sousCompetenceId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting class analytics:', error);
      throw error;
    }
  }

  /**
   * Format ability level for display
   */
  formatAbilityLevel(ability) {
    if (ability < -1.5) return { level: 'Débutant', color: 'text-red-600', description: 'Besoin de révision' };
    if (ability < -0.5) return { level: 'Intermédiaire', color: 'text-orange-600', description: 'Progression en cours' };
    if (ability < 0.5) return { level: 'Moyen', color: 'text-yellow-600', description: 'Bonne maîtrise' };
    if (ability < 1.5) return { level: 'Avancé', color: 'text-green-600', description: 'Excellente maîtrise' };
    return { level: 'Expert', color: 'text-blue-600', description: 'Maîtrise complète' };
  }

  /**
   * Calculate performance insights
   */
  calculatePerformanceInsights(performanceByDifficulty) {
    const insights = [];

    // Easy questions performance
    if (performanceByDifficulty.easy.total > 0) {
      const easyRate = performanceByDifficulty.easy.correct / performanceByDifficulty.easy.total;
      if (easyRate < 0.8) {
        insights.push('Struggles with basic concepts - needs foundational review');
      }
    }

    // Medium questions performance
    if (performanceByDifficulty.medium.total > 0) {
      const mediumRate = performanceByDifficulty.medium.correct / performanceByDifficulty.medium.total;
      if (mediumRate < 0.6) {
        insights.push('Has difficulty with standard concepts - needs more practice');
      }
    }

    // Hard questions performance
    if (performanceByDifficulty.hard.total > 0) {
      const hardRate = performanceByDifficulty.hard.correct / performanceByDifficulty.hard.total;
      if (hardRate > 0.7) {
        insights.push('Excels at challenging concepts - ready for advanced topics');
      }
    }

    return insights;
  }

  /**
   * Generate learning recommendations
   */
  generateRecommendations(analytics) {
    const recommendations = [];

    // Based on ability level
    const abilityLevel = this.formatAbilityLevel(analytics.finalResults.ability);
    if (abilityLevel.level === 'Débutant') {
      recommendations.push('Focus on foundational concepts and basic exercises');
    } else if (abilityLevel.level === 'Intermédiaire') {
      recommendations.push('Practice with medium-difficulty problems to build confidence');
    } else if (abilityLevel.level === 'Moyen') {
      recommendations.push('Challenge yourself with advanced problems to reach the next level');
    }

    // Based on consistency
    if (analytics.performance.learningPattern.consistency < 0.7) {
      recommendations.push('Work on maintaining consistent performance across different question types');
    }

    // Based on learning efficiency
    if (analytics.performance.learningPattern.learningEfficiency < 0.6) {
      recommendations.push('Take more time to understand concepts before moving forward');
    }

    return recommendations;
  }
}

export default new AdaptiveAnalyticsService(); 