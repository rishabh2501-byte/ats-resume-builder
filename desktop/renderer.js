// Renderer script for Electron desktop app

document.addEventListener('DOMContentLoaded', () => {
  // Try to load the web app in an iframe
  const app = document.getElementById('app');
  
  // Check if web server is available
  fetch('http://localhost:5173')
    .then(response => {
      if (response.ok) {
        // Load web app in iframe
        app.innerHTML = '<iframe src="http://localhost:5173" id="web-frame"></iframe>';
      } else {
        showOfflineMode();
      }
    })
    .catch(() => {
      showOfflineMode();
    });
});

function showOfflineMode() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="offline-mode">
      <h1>ATS Resume Builder</h1>
      <p>The web server is not running. Please start the development server:</p>
      <code>cd web && npm run dev</code>
      <p>Or use the application in offline mode with limited features.</p>
      <button onclick="location.reload()">Retry Connection</button>
    </div>
  `;
}

// Handle Electron API events if available
if (window.electronAPI) {
  window.electronAPI.onNewResume(() => {
    const frame = document.getElementById('web-frame');
    if (frame) {
      frame.contentWindow.postMessage({ type: 'NEW_RESUME' }, '*');
    }
  });

  window.electronAPI.onSaveResume(() => {
    const frame = document.getElementById('web-frame');
    if (frame) {
      frame.contentWindow.postMessage({ type: 'SAVE_RESUME' }, '*');
    }
  });

  window.electronAPI.onExportPDF(() => {
    const frame = document.getElementById('web-frame');
    if (frame) {
      frame.contentWindow.postMessage({ type: 'EXPORT_PDF' }, '*');
    }
  });

  window.electronAPI.onResumeLoaded((data) => {
    const frame = document.getElementById('web-frame');
    if (frame) {
      frame.contentWindow.postMessage({ type: 'LOAD_RESUME', data }, '*');
    }
  });
}
