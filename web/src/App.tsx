import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import BuilderPage from '@/pages/BuilderPage';
import AnalyzerPage from '@/pages/AnalyzerPage';
import TemplatesPage from '@/pages/TemplatesPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import SmartAnalyzerPage from '@/pages/SmartAnalyzerPage';
import ResumeGeneratorPage from '@/pages/ResumeGeneratorPage';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ats-theme">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="builder" element={<BuilderPage />} />
          <Route path="builder/:id" element={<BuilderPage />} />
          <Route path="analyzer" element={<AnalyzerPage />} />
          <Route path="smart-analyzer" element={<SmartAnalyzerPage />} />
          <Route path="generate" element={<ResumeGeneratorPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
