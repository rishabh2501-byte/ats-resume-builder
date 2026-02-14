// ATS Resume Optimizer - Content Script
// Runs on job posting pages to add quick actions

(function() {
  // Check if we're on a supported job page
  const url = window.location.href;
  const isJobPage = url.includes('/jobs/') || url.includes('/job/') || url.includes('jobdetails');
  
  if (!isJobPage) return;

  // Create floating button
  const button = document.createElement('div');
  button.id = 'ats-optimizer-btn';
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
    <span>ATS Check</span>
  `;
  
  document.body.appendChild(button);

  // Button click handler
  button.addEventListener('click', () => {
    // Send message to open popup or trigger analysis
    chrome.runtime.sendMessage({ action: 'openPopup' });
  });

  // Add indicator when job description is detected
  setTimeout(() => {
    const hasDescription = detectJobDescription();
    if (hasDescription) {
      button.classList.add('ready');
      button.querySelector('span').textContent = 'Analyze Job';
    }
  }, 1000);

  function detectJobDescription() {
    // LinkedIn
    if (url.includes('linkedin.com')) {
      return !!document.querySelector('.jobs-description__content, .jobs-box__html-content');
    }
    // Naukri
    if (url.includes('naukri.com')) {
      return !!document.querySelector('.job-desc, .dang-inner-html');
    }
    // Indeed
    if (url.includes('indeed.com')) {
      return !!document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText');
    }
    return false;
  }
})();
