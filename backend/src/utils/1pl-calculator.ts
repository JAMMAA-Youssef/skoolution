/**
 * 1PL (One-Parameter Logistic) Algorithm Calculator
 * 
 * This utility demonstrates how the 1PL algorithm works for adaptive testing.
 * 
 * Key Concepts:
 * - θ (theta): Student ability level
 * - b: Item difficulty level
 * - P(θ): Probability of correct response
 * 
 * Formula: P(θ) = 1 / (1 + e^(-(θ - b)))
 */

export class OnePLCalculator {
  /**
   * Calculate response probability using 1PL formula
   * @param ability Student ability level (θ)
   * @param difficulty Item difficulty level (b)
   * @returns Probability of correct response
   */
  static calculateResponseProbability(ability: number, difficulty: number): number {
    return 1 / (1 + Math.exp(-(ability - difficulty)));
  }

  /**
   * Calculate item information (Fisher information)
   * @param ability Student ability level
   * @param difficulty Item difficulty level
   * @returns Item information value
   */
  static calculateItemInformation(ability: number, difficulty: number): number {
    const p = this.calculateResponseProbability(ability, difficulty);
    return p * (1 - p);
  }

  /**
   * Update ability estimate using Maximum Likelihood Estimation (MLE)
   * @param currentAbility Current ability estimate
   * @param responses Array of responses with difficulty levels
   * @returns Updated ability estimate
   */
  static updateAbilityEstimate(
    currentAbility: number,
    responses: Array<{ correct: boolean; difficulty: number }>
  ): number {
    if (responses.length === 0) {
      return currentAbility;
    }

    let numerator = 0;
    let denominator = 0;

    for (const response of responses) {
      const p = this.calculateResponseProbability(currentAbility, response.difficulty);
      const weight = p * (1 - p);
      
      numerator += (response.correct ? 1 : 0) - p;
      denominator += weight;
    }

    if (denominator === 0) {
      return currentAbility;
    }

    return currentAbility + numerator / denominator;
  }

  /**
   * Calculate standard error of ability estimate
   * @param ability Current ability estimate
   * @param responses Array of responses with difficulty levels
   * @returns Standard error
   */
  static calculateStandardError(
    ability: number,
    responses: Array<{ difficulty: number }>
  ): number {
    if (responses.length === 0) {
      return 1.0;
    }

    let information = 0;
    for (const response of responses) {
      const p = this.calculateResponseProbability(ability, response.difficulty);
      information += p * (1 - p);
    }

    return information > 0 ? 1 / Math.sqrt(information) : 1.0;
  }

  /**
   * Select optimal next item based on current ability
   * @param availableItems Array of items with difficulty levels
   * @param currentAbility Current ability estimate
   * @returns Best item to administer next
   */
  static selectNextItem(
    availableItems: Array<{ id: string; difficulty: number }>,
    currentAbility: number
  ): { id: string; difficulty: number } | null {
    if (availableItems.length === 0) {
      return null;
    }

    // Select item closest to current ability (maximum information)
    let bestItem = availableItems[0];
    let maxInformation = this.calculateItemInformation(currentAbility, bestItem.difficulty);

    for (const item of availableItems) {
      const information = this.calculateItemInformation(currentAbility, item.difficulty);
      if (information > maxInformation) {
        maxInformation = information;
        bestItem = item;
      }
    }

    return bestItem;
  }

  /**
   * Determine if test should terminate
   * @param ability Current ability estimate
   * @param standardError Current standard error
   * @param responseCount Number of responses
   * @param maxResponses Maximum allowed responses
   * @returns True if test should terminate
   */
  static shouldTerminateTest(
    ability: number,
    standardError: number,
    responseCount: number,
    maxResponses: number
  ): boolean {
    // Terminate if max responses reached
    if (responseCount >= maxResponses) {
      return true;
    }

    // Terminate if standard error is small enough (high precision)
    if (standardError < 0.3) {
      return true;
    }

    // Terminate if ability estimate is very high or very low
    if (Math.abs(ability) > 3.0) {
      return true;
    }

    return false;
  }

  /**
   * Convert ability level to descriptive text
   * @param ability Ability level
   * @returns Description of ability level
   */
  static getAbilityDescription(ability: number): {
    level: string;
    description: string;
    color: string;
  } {
    if (ability < -1.5) {
      return {
        level: 'Débutant',
        description: 'Besoin de révision et de pratique supplémentaire',
        color: 'text-red-600'
      };
    }
    if (ability < -0.5) {
      return {
        level: 'Intermédiaire',
        description: 'Progression en cours, quelques points à améliorer',
        color: 'text-orange-600'
      };
    }
    if (ability < 0.5) {
      return {
        level: 'Moyen',
        description: 'Bonne maîtrise des concepts de base',
        color: 'text-yellow-600'
      };
    }
    if (ability < 1.5) {
      return {
        level: 'Avancé',
        description: 'Excellente maîtrise, compétences solides',
        color: 'text-green-600'
      };
    }
    return {
      level: 'Expert',
      description: 'Maîtrise complète et approfondie',
      color: 'text-blue-600'
    };
  }

  /**
   * Example usage demonstration
   */
  static demonstrate1PL(): void {
    console.log('=== 1PL Algorithm Demonstration ===\n');

    // Example 1: Calculate response probability
    const ability = 0.5;
    const difficulty = 0.0;
    const probability = this.calculateResponseProbability(ability, difficulty);
    console.log(`Example 1: Student ability=${ability}, Item difficulty=${difficulty}`);
    console.log(`Probability of correct response: ${probability.toFixed(3)} (${(probability * 100).toFixed(1)}%)\n`);

    // Example 2: Update ability estimate
    const responses = [
      { correct: true, difficulty: -0.5 },
      { correct: false, difficulty: 0.5 },
      { correct: true, difficulty: 0.0 }
    ];
    const newAbility = this.updateAbilityEstimate(ability, responses);
    console.log(`Example 2: Updated ability from ${ability} to ${newAbility.toFixed(3)}\n`);

    // Example 3: Select next item
    const availableItems = [
      { id: '1', difficulty: -1.0 },
      { id: '2', difficulty: 0.0 },
      { id: '3', difficulty: 1.0 }
    ];
    const nextItem = this.selectNextItem(availableItems, newAbility);
    console.log(`Example 3: Selected next item: ${nextItem?.id} (difficulty: ${nextItem?.difficulty})\n`);

    // Example 4: Ability description
    const description = this.getAbilityDescription(newAbility);
    console.log(`Example 4: Ability level: ${description.level}`);
    console.log(`Description: ${description.description}\n`);
  }
}

// Export for use in other modules
export default OnePLCalculator; 