// ATS Analyzer Service - Core scoring engine

interface KeywordMatch {
  keyword: string;
  found: boolean;
  count: number;
  importance: 'high' | 'medium' | 'low';
}

interface SectionScore {
  section: string;
  score: number;
  feedback: string;
}

interface Suggestion {
  id: string;
  type: 'keyword' | 'format' | 'content' | 'structure';
  priority: 'high' | 'medium' | 'low';
  section: string;
  message: string;
  action?: string;
}

interface FormatIssue {
  id: string;
  type: 'length' | 'formatting' | 'structure' | 'compatibility';
  severity: 'error' | 'warning' | 'info';
  message: string;
  location?: string;
}

interface ATSAnalysis {
  score: number;
  keywordMatches: KeywordMatch[];
  missingKeywords: string[];
  sectionScores: SectionScore[];
  suggestions: Suggestion[];
  formatIssues: FormatIssue[];
}

export class ATSAnalyzer {
  private stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
    'we', 'you', 'they', 'he', 'she', 'it', 'i', 'me', 'my', 'your',
    'their', 'our', 'this', 'that', 'these', 'those', 'which', 'who',
    'what', 'where', 'when', 'how', 'why', 'all', 'each', 'every',
    'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
    'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
    'also', 'now', 'here', 'there', 'then', 'once', 'about', 'after',
    'before', 'above', 'below', 'between', 'into', 'through', 'during',
    'under', 'again', 'further', 'while', 'any', 'being', 'having',
  ]);

  private technicalKeywords = new Set([
    'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue',
    'node', 'nodejs', 'express', 'django', 'flask', 'spring', 'aws', 'azure',
    'gcp', 'docker', 'kubernetes', 'sql', 'nosql', 'mongodb', 'postgresql',
    'mysql', 'redis', 'graphql', 'rest', 'api', 'microservices', 'agile',
    'scrum', 'ci/cd', 'devops', 'git', 'linux', 'cloud', 'machine learning',
    'ai', 'data science', 'analytics', 'tensorflow', 'pytorch', 'html', 'css',
    'sass', 'webpack', 'babel', 'npm', 'yarn', 'testing', 'jest', 'cypress',
  ]);

  analyze(resumeText: string, jobDescription: string): ATSAnalysis {
    const resumeLower = resumeText.toLowerCase();
    const jdLower = jobDescription.toLowerCase();

    // Extract keywords from job description
    const jdKeywords = this.extractKeywords(jobDescription);
    
    // Analyze keyword matches
    const keywordMatches = this.analyzeKeywordMatches(resumeLower, jdKeywords);
    
    // Find missing keywords
    const missingKeywords = keywordMatches
      .filter(k => !k.found)
      .map(k => k.keyword);

    // Calculate section scores
    const sectionScores = this.analyzeSections(resumeText);

    // Generate suggestions
    const suggestions = this.generateSuggestions(keywordMatches, sectionScores, resumeText);

    // Check format issues
    const formatIssues = this.checkFormatIssues(resumeText);

    // Calculate overall score
    const score = this.calculateOverallScore(keywordMatches, sectionScores, formatIssues);

    return {
      score,
      keywordMatches,
      missingKeywords,
      sectionScores,
      suggestions,
      formatIssues,
    };
  }

  quickScore(resumeText: string, jobDescription: string): number {
    const jdKeywords = this.extractKeywords(jobDescription);
    const resumeLower = resumeText.toLowerCase();
    
    let matches = 0;
    for (const keyword of jdKeywords) {
      if (resumeLower.includes(keyword.toLowerCase())) {
        matches++;
      }
    }

    return Math.min(100, Math.round((matches / Math.max(jdKeywords.length, 1)) * 100));
  }

  extractKeywords(text: string): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s\-\/\+\#\.]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);

    // Count word frequency
    const frequency: Record<string, number> = {};
    const phrases: string[] = [];

    // Extract single words
    for (const word of words) {
      if (!this.stopWords.has(word)) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    }

    // Extract common tech phrases (bigrams)
    const textLower = text.toLowerCase();
    const techPhrases = [
      'machine learning', 'data science', 'full stack', 'front end', 'back end',
      'project management', 'team lead', 'software engineer', 'web development',
      'mobile development', 'cloud computing', 'continuous integration',
      'version control', 'problem solving', 'communication skills',
    ];

    for (const phrase of techPhrases) {
      if (textLower.includes(phrase)) {
        phrases.push(phrase);
      }
    }

    // Sort by frequency and importance
    const sortedWords = Object.entries(frequency)
      .sort((a, b) => {
        const aIsTech = this.technicalKeywords.has(a[0]) ? 1 : 0;
        const bIsTech = this.technicalKeywords.has(b[0]) ? 1 : 0;
        if (aIsTech !== bIsTech) return bIsTech - aIsTech;
        return b[1] - a[1];
      })
      .slice(0, 30)
      .map(([word]) => word);

    return [...new Set([...phrases, ...sortedWords])];
  }

  private analyzeKeywordMatches(resumeText: string, keywords: string[]): KeywordMatch[] {
    return keywords.map(keyword => {
      const regex = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'gi');
      const matches = resumeText.match(regex);
      const count = matches ? matches.length : 0;

      return {
        keyword,
        found: count > 0,
        count,
        importance: this.getKeywordImportance(keyword),
      };
    });
  }

  private getKeywordImportance(keyword: string): 'high' | 'medium' | 'low' {
    const keywordLower = keyword.toLowerCase();
    
    if (this.technicalKeywords.has(keywordLower)) {
      return 'high';
    }
    
    const highImportance = ['experience', 'skills', 'years', 'degree', 'bachelor', 'master'];
    if (highImportance.some(h => keywordLower.includes(h))) {
      return 'high';
    }

    return 'medium';
  }

  private analyzeSections(resumeText: string): SectionScore[] {
    const sections: SectionScore[] = [];
    const textLower = resumeText.toLowerCase();

    // Check for contact info
    const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(resumeText);
    const hasPhone = /[\d\s\-+()]{10,}/.test(resumeText);
    const hasLinkedIn = textLower.includes('linkedin');
    
    sections.push({
      section: 'contact',
      score: (hasEmail ? 40 : 0) + (hasPhone ? 40 : 0) + (hasLinkedIn ? 20 : 0),
      feedback: this.getContactFeedback(hasEmail, hasPhone, hasLinkedIn),
    });

    // Check for summary/objective
    const hasSummary = /summary|objective|profile|about/i.test(resumeText);
    const summaryLength = this.estimateSectionLength(resumeText, 'summary');
    sections.push({
      section: 'summary',
      score: hasSummary ? Math.min(100, summaryLength > 50 ? 100 : summaryLength * 2) : 0,
      feedback: hasSummary ? 'Summary section found' : 'Consider adding a professional summary',
    });

    // Check for experience
    const hasExperience = /experience|work history|employment/i.test(resumeText);
    const hasBullets = resumeText.includes('•') || resumeText.includes('-');
    const hasMetrics = /\d+%|\$\d+|\d+ (years?|months?|projects?|team)/i.test(resumeText);
    
    sections.push({
      section: 'experience',
      score: (hasExperience ? 40 : 0) + (hasBullets ? 30 : 0) + (hasMetrics ? 30 : 0),
      feedback: this.getExperienceFeedback(hasExperience, hasBullets, hasMetrics),
    });

    // Check for education
    const hasEducation = /education|degree|university|college|bachelor|master/i.test(resumeText);
    sections.push({
      section: 'education',
      score: hasEducation ? 100 : 0,
      feedback: hasEducation ? 'Education section found' : 'Consider adding education details',
    });

    // Check for skills
    const hasSkills = /skills|technologies|proficiencies/i.test(resumeText);
    sections.push({
      section: 'skills',
      score: hasSkills ? 100 : 0,
      feedback: hasSkills ? 'Skills section found' : 'Add a dedicated skills section',
    });

    return sections;
  }

  private estimateSectionLength(text: string, section: string): number {
    const regex = new RegExp(`${section}[:\\s]*([^]*?)(?=\\n\\n|experience|education|skills|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim().length : 0;
  }

  private getContactFeedback(hasEmail: boolean, hasPhone: boolean, hasLinkedIn: boolean): string {
    const missing = [];
    if (!hasEmail) missing.push('email');
    if (!hasPhone) missing.push('phone');
    if (!hasLinkedIn) missing.push('LinkedIn');
    
    if (missing.length === 0) return 'Contact information is complete';
    return `Missing: ${missing.join(', ')}`;
  }

  private getExperienceFeedback(hasExperience: boolean, hasBullets: boolean, hasMetrics: boolean): string {
    if (!hasExperience) return 'Add work experience section';
    const improvements = [];
    if (!hasBullets) improvements.push('use bullet points');
    if (!hasMetrics) improvements.push('add quantifiable achievements');
    if (improvements.length === 0) return 'Experience section is well-formatted';
    return `Consider: ${improvements.join(', ')}`;
  }

  private generateSuggestions(
    keywordMatches: KeywordMatch[],
    sectionScores: SectionScore[],
    resumeText: string
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];
    let id = 1;

    // Missing high-importance keywords
    const missingHighKeywords = keywordMatches
      .filter(k => !k.found && k.importance === 'high')
      .slice(0, 5);

    for (const keyword of missingHighKeywords) {
      suggestions.push({
        id: `sug-${id++}`,
        type: 'keyword',
        priority: 'high',
        section: 'general',
        message: `Add keyword: "${keyword.keyword}"`,
        action: `Include "${keyword.keyword}" in your resume where relevant`,
      });
    }

    // Section improvements
    for (const section of sectionScores) {
      if (section.score < 50) {
        suggestions.push({
          id: `sug-${id++}`,
          type: 'content',
          priority: section.score < 30 ? 'high' : 'medium',
          section: section.section,
          message: section.feedback,
        });
      }
    }

    // Action verbs check
    const actionVerbs = ['achieved', 'implemented', 'developed', 'led', 'managed', 'created', 'designed', 'improved'];
    const hasActionVerbs = actionVerbs.some(v => resumeText.toLowerCase().includes(v));
    
    if (!hasActionVerbs) {
      suggestions.push({
        id: `sug-${id++}`,
        type: 'content',
        priority: 'medium',
        section: 'experience',
        message: 'Use strong action verbs to start bullet points',
        action: 'Start bullets with verbs like: Achieved, Implemented, Developed, Led',
      });
    }

    return suggestions;
  }

  private checkFormatIssues(resumeText: string): FormatIssue[] {
    const issues: FormatIssue[] = [];
    let id = 1;

    // Check length
    const wordCount = resumeText.split(/\s+/).length;
    if (wordCount < 200) {
      issues.push({
        id: `fmt-${id++}`,
        type: 'length',
        severity: 'warning',
        message: 'Resume appears too short. Aim for 400-800 words.',
      });
    } else if (wordCount > 1000) {
      issues.push({
        id: `fmt-${id++}`,
        type: 'length',
        severity: 'warning',
        message: 'Resume may be too long. Consider condensing to 1-2 pages.',
      });
    }

    // Check for special characters that might cause ATS issues
    if (/[│┃┆┇┊┋╎╏║]/.test(resumeText)) {
      issues.push({
        id: `fmt-${id++}`,
        type: 'compatibility',
        severity: 'error',
        message: 'Special table characters detected. These may not parse correctly in ATS.',
      });
    }

    // Check for images/graphics indicators
    if (/\[image\]|\[graphic\]|\[chart\]/i.test(resumeText)) {
      issues.push({
        id: `fmt-${id++}`,
        type: 'compatibility',
        severity: 'warning',
        message: 'Graphics/images may not be readable by ATS systems.',
      });
    }

    return issues;
  }

  private calculateOverallScore(
    keywordMatches: KeywordMatch[],
    sectionScores: SectionScore[],
    formatIssues: FormatIssue[]
  ): number {
    // Keyword match score (40% weight)
    const matchedKeywords = keywordMatches.filter(k => k.found).length;
    const keywordScore = (matchedKeywords / Math.max(keywordMatches.length, 1)) * 100;

    // Section completeness score (40% weight)
    const avgSectionScore = sectionScores.reduce((sum, s) => sum + s.score, 0) / sectionScores.length;

    // Format score (20% weight)
    const errorCount = formatIssues.filter(i => i.severity === 'error').length;
    const warningCount = formatIssues.filter(i => i.severity === 'warning').length;
    const formatScore = Math.max(0, 100 - (errorCount * 20) - (warningCount * 10));

    const overallScore = (keywordScore * 0.4) + (avgSectionScore * 0.4) + (formatScore * 0.2);

    return Math.round(Math.min(100, Math.max(0, overallScore)));
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
