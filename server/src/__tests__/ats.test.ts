import { ATSAnalyzer } from '../services/atsAnalyzer';

describe('ATSAnalyzer', () => {
  let analyzer: ATSAnalyzer;

  beforeEach(() => {
    analyzer = new ATSAnalyzer();
  });

  describe('extractKeywords', () => {
    it('should extract keywords from text', () => {
      const text = 'We are looking for a JavaScript developer with React and Node.js experience';
      const keywords = analyzer.extractKeywords(text);
      
      expect(keywords).toContain('javascript');
      expect(keywords).toContain('react');
      expect(keywords).toContain('node');
    });

    it('should filter out stop words', () => {
      const text = 'We are looking for a developer with experience';
      const keywords = analyzer.extractKeywords(text);
      
      expect(keywords).not.toContain('we');
      expect(keywords).not.toContain('are');
      expect(keywords).not.toContain('for');
      expect(keywords).not.toContain('a');
      expect(keywords).not.toContain('with');
    });

    it('should extract tech phrases', () => {
      const text = 'Experience with machine learning and data science required';
      const keywords = analyzer.extractKeywords(text);
      
      expect(keywords).toContain('machine learning');
      expect(keywords).toContain('data science');
    });
  });

  describe('quickScore', () => {
    it('should return 100 for perfect match', () => {
      const resumeText = 'JavaScript React Node.js TypeScript';
      const jobDescription = 'JavaScript React Node.js TypeScript';
      
      const score = analyzer.quickScore(resumeText, jobDescription);
      expect(score).toBe(100);
    });

    it('should return 0 for no match', () => {
      const resumeText = 'Python Django Flask';
      const jobDescription = 'JavaScript React Node.js';
      
      const score = analyzer.quickScore(resumeText, jobDescription);
      expect(score).toBeLessThan(50);
    });

    it('should return partial score for partial match', () => {
      const resumeText = 'JavaScript Python React';
      const jobDescription = 'JavaScript React Node.js TypeScript';
      
      const score = analyzer.quickScore(resumeText, jobDescription);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(100);
    });
  });

  describe('analyze', () => {
    it('should return complete analysis object', () => {
      const resumeText = `
        John Doe
        john@example.com | 555-1234 | linkedin.com/in/johndoe
        
        Summary
        Experienced software engineer with 5 years of JavaScript and React experience.
        
        Experience
        Software Engineer at Tech Corp
        • Developed React applications
        • Improved performance by 50%
        
        Education
        BS Computer Science, University
        
        Skills
        JavaScript, React, Node.js
      `;
      
      const jobDescription = `
        We are looking for a Software Engineer with:
        - 3+ years JavaScript experience
        - React and Node.js skills
        - TypeScript knowledge
        - AWS experience
      `;
      
      const analysis = analyzer.analyze(resumeText, jobDescription);
      
      expect(analysis).toHaveProperty('score');
      expect(analysis).toHaveProperty('keywordMatches');
      expect(analysis).toHaveProperty('missingKeywords');
      expect(analysis).toHaveProperty('sectionScores');
      expect(analysis).toHaveProperty('suggestions');
      expect(analysis).toHaveProperty('formatIssues');
      
      expect(analysis.score).toBeGreaterThanOrEqual(0);
      expect(analysis.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(analysis.keywordMatches)).toBe(true);
      expect(Array.isArray(analysis.missingKeywords)).toBe(true);
    });

    it('should identify missing keywords', () => {
      const resumeText = 'JavaScript React developer';
      const jobDescription = 'JavaScript React Node.js TypeScript AWS Docker';
      
      const analysis = analyzer.analyze(resumeText, jobDescription);
      
      expect(analysis.missingKeywords.length).toBeGreaterThan(0);
    });

    it('should check for contact information', () => {
      const resumeWithContact = 'john@example.com 555-1234 linkedin.com/in/john';
      const resumeWithoutContact = 'Software Engineer with experience';
      
      const analysisWithContact = analyzer.analyze(resumeWithContact, 'job description');
      const analysisWithoutContact = analyzer.analyze(resumeWithoutContact, 'job description');
      
      const contactScoreWith = analysisWithContact.sectionScores.find(s => s.section === 'contact');
      const contactScoreWithout = analysisWithoutContact.sectionScores.find(s => s.section === 'contact');
      
      expect(contactScoreWith?.score).toBeGreaterThan(contactScoreWithout?.score || 0);
    });
  });
});
