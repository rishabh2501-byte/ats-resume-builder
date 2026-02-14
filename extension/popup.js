// ATS Resume Optimizer - Popup Script

const API_URL = 'http://localhost:3001';

// DOM Elements
const loadingEl = document.getElementById('loading');
const noJobEl = document.getElementById('no-job');
const jobFoundEl = document.getElementById('job-found');
const scoreSectionEl = document.getElementById('score-section');
const keywordsSectionEl = document.getElementById('keywords-section');

const jobTitleEl = document.getElementById('job-title');
const jobCompanyEl = document.getElementById('job-company');
const atsScoreEl = document.getElementById('ats-score');
const missingKeywordsEl = document.getElementById('missing-keywords');
const resumeTextEl = document.getElementById('resume-text');

const extractBtn = document.getElementById('extract-btn');
const analyzeBtn = document.getElementById('analyze-btn');
const optimizeBtn = document.getElementById('optimize-btn');
const saveResumeBtn = document.getElementById('save-resume');

let currentJobData = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Load saved resume
  const saved = await chrome.storage.local.get(['resumeText', 'lastJobData']);
  if (saved.resumeText) {
    resumeTextEl.value = saved.resumeText;
  }
  if (saved.lastJobData) {
    currentJobData = saved.lastJobData;
    showJobData(currentJobData);
  }
});

// Extract job description from current page
extractBtn.addEventListener('click', async () => {
  showLoading(true);
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractJobDescription,
    });

    if (result && result[0] && result[0].result) {
      currentJobData = result[0].result;
      await chrome.storage.local.set({ lastJobData: currentJobData });
      showJobData(currentJobData);
    } else {
      alert('Could not extract job description. Make sure you are on a job posting page.');
    }
  } catch (error) {
    console.error('Extraction error:', error);
    alert('Failed to extract job description. Please try again.');
  }
  
  showLoading(false);
});

// Analyze resume against job description
analyzeBtn.addEventListener('click', async () => {
  const resumeText = resumeTextEl.value.trim();
  
  if (!resumeText) {
    alert('Please paste your resume text first.');
    return;
  }
  
  if (!currentJobData || !currentJobData.description) {
    alert('Please extract a job description first.');
    return;
  }
  
  showLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/api/ats/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeText,
        jobDescription: currentJobData.description,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      showAnalysisResults(data.data);
    } else {
      alert('Analysis failed. Please try again.');
    }
  } catch (error) {
    console.error('Analysis error:', error);
    alert('Failed to connect to server. Make sure the ATS Resume Builder is running.');
  }
  
  showLoading(false);
});

// Open full app with job data
optimizeBtn.addEventListener('click', () => {
  const url = new URL('http://localhost:5173/builder');
  if (currentJobData) {
    url.searchParams.set('jd', encodeURIComponent(currentJobData.description || ''));
  }
  chrome.tabs.create({ url: url.toString() });
});

// Save resume to storage
saveResumeBtn.addEventListener('click', async () => {
  const resumeText = resumeTextEl.value.trim();
  await chrome.storage.local.set({ resumeText });
  saveResumeBtn.textContent = 'Saved!';
  setTimeout(() => {
    saveResumeBtn.textContent = 'Save Resume';
  }, 2000);
});

// Helper Functions
function showLoading(show) {
  loadingEl.classList.toggle('hidden', !show);
  noJobEl.classList.toggle('hidden', show || currentJobData);
  jobFoundEl.classList.toggle('hidden', show || !currentJobData);
}

function showJobData(data) {
  noJobEl.classList.add('hidden');
  jobFoundEl.classList.remove('hidden');
  
  jobTitleEl.textContent = data.title || 'Job Position';
  jobCompanyEl.textContent = data.company || 'Company';
}

function showAnalysisResults(analysis) {
  scoreSectionEl.classList.remove('hidden');
  keywordsSectionEl.classList.remove('hidden');
  
  // Update score
  atsScoreEl.textContent = analysis.score;
  
  // Update score circle color based on score
  const scoreCircle = document.querySelector('.score-circle');
  if (analysis.score >= 80) {
    scoreCircle.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
  } else if (analysis.score >= 60) {
    scoreCircle.style.background = 'linear-gradient(135deg, #eab308, #ca8a04)';
  } else if (analysis.score >= 40) {
    scoreCircle.style.background = 'linear-gradient(135deg, #f97316, #ea580c)';
  } else {
    scoreCircle.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
  }
  
  // Update missing keywords
  missingKeywordsEl.innerHTML = '';
  const keywords = analysis.missingKeywords.slice(0, 10);
  keywords.forEach(keyword => {
    const span = document.createElement('span');
    span.className = 'keyword';
    span.textContent = keyword;
    missingKeywordsEl.appendChild(span);
  });
  
  if (keywords.length === 0) {
    missingKeywordsEl.innerHTML = '<span style="color: #22c55e;">Great! No critical keywords missing.</span>';
  }
}

// Content script function to extract job description
function extractJobDescription() {
  const url = window.location.href;
  let title = '';
  let company = '';
  let description = '';
  
  // LinkedIn
  if (url.includes('linkedin.com')) {
    title = document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title')?.textContent?.trim() || '';
    company = document.querySelector('.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name')?.textContent?.trim() || '';
    description = document.querySelector('.jobs-description__content, .jobs-box__html-content')?.textContent?.trim() || '';
  }
  
  // Naukri
  else if (url.includes('naukri.com')) {
    title = document.querySelector('.jd-header-title, h1.title')?.textContent?.trim() || '';
    company = document.querySelector('.jd-header-comp-name, .comp-name')?.textContent?.trim() || '';
    description = document.querySelector('.job-desc, .dang-inner-html')?.textContent?.trim() || '';
  }
  
  // Indeed
  else if (url.includes('indeed.com')) {
    title = document.querySelector('.jobsearch-JobInfoHeader-title, h1[data-testid="jobsearch-JobInfoHeader-title"]')?.textContent?.trim() || '';
    company = document.querySelector('.jobsearch-InlineCompanyRating-companyHeader, [data-testid="inlineHeader-companyName"]')?.textContent?.trim() || '';
    description = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText')?.textContent?.trim() || '';
  }
  
  // Fallback - try to get any job-related content
  if (!description) {
    const possibleContainers = document.querySelectorAll('[class*="description"], [class*="job"], [id*="description"], [id*="job"]');
    for (const container of possibleContainers) {
      const text = container.textContent?.trim();
      if (text && text.length > 200) {
        description = text;
        break;
      }
    }
  }
  
  if (!title) {
    title = document.querySelector('h1')?.textContent?.trim() || document.title;
  }
  
  return {
    title,
    company,
    description,
    url,
    source: url.includes('linkedin') ? 'linkedin' : url.includes('naukri') ? 'naukri' : url.includes('indeed') ? 'indeed' : 'other',
    extractedAt: new Date().toISOString(),
  };
}
