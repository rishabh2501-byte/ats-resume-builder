const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  saveResume: (filePath, data) => ipcRenderer.invoke('save-resume', { filePath, data }),
  exportPDF: (resumeData) => ipcRenderer.invoke('export-pdf', resumeData),
  
  // Storage
  getStoredData: (key) => ipcRenderer.invoke('get-stored-data', key),
  setStoredData: (key, value) => ipcRenderer.invoke('set-stored-data', { key, value }),
  
  // Menu events
  onNewResume: (callback) => ipcRenderer.on('menu-new-resume', callback),
  onSaveResume: (callback) => ipcRenderer.on('menu-save-resume', callback),
  onExportPDF: (callback) => ipcRenderer.on('menu-export-pdf', callback),
  onExportDOCX: (callback) => ipcRenderer.on('menu-export-docx', callback),
  onResumeLoaded: (callback) => ipcRenderer.on('resume-loaded', (event, data) => callback(data)),
  onRequestResumeData: (callback) => ipcRenderer.on('request-resume-data', (event, filePath) => callback(filePath)),
  
  // Platform info
  platform: process.platform,
  isElectron: true,
});
