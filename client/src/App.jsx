import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EmergencyModal } from './components/EmergencyModal';
import { QRCodeModal } from './components/QRCodeModal';
import { AiChatbotModal } from './components/AiChatbotModal';
import { HospitalPortal } from './components/HospitalPortal';
import { UserPortal } from './components/UserPortal';
import { LandingPage } from './pages/LandingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { MobileAppSimulator } from './pages/MobileAppSimulator';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import './styles/theme.css';

export function AppContent() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('landing');

  useEffect(() => {
    if (!user && ['user', 'hospital', 'admin'].includes(currentTab)) {
      setCurrentTab('landing');
      setAuthPage('signup');
    }
  }, [user, currentTab]);

  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isAiBotOpen, setIsAiBotOpen] = useState(false);

  // Auth pages: 'signin' | 'signup' | null (no auth page)
  const [authPage, setAuthPage] = useState('signup');

  const handleAuthSuccess = (role) => {
    setAuthPage(null);
    // Navigate to the matching portal after login
    if (role === 'admin') setCurrentTab('admin');
    else if (role === 'hospital') setCurrentTab('hospital');
    else setCurrentTab('user');
  };

  // Show full-page auth screens when requested
  if (authPage === 'signin') {
    return (
      <ErrorBoundary>
        <SignInPage
          onSwitchToSignUp={() => setAuthPage('signup')}
          onSuccess={handleAuthSuccess}
          onBackToHome={() => setAuthPage(null)}
        />
      </ErrorBoundary>
    );
  }

  if (authPage === 'signup') {
    return (
      <ErrorBoundary>
        <SignUpPage
          onSwitchToSignIn={() => setAuthPage('signin')}
          onSuccess={handleAuthSuccess}
          onBackToHome={() => setAuthPage(null)}
        />
      </ErrorBoundary>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Header Navigation Bar */}
      <ErrorBoundary>
        <Navbar
          onOpenSos={() => setIsSosOpen(true)}
          onOpenQr={() => setIsQrOpen(true)}
          onOpenAuth={() => setAuthPage('signin')}
          onOpenSignUp={() => setAuthPage('signup')}
          onOpenAiBot={() => setIsAiBotOpen(true)}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />
      </ErrorBoundary>

      {/* Main Active Page View */}
      <div style={{ flex: 1 }}>
        <ErrorBoundary>
          {currentTab === 'landing' && (
            <LandingPage
              onOpenSos={() => setIsSosOpen(true)}
              onOpenQr={() => setIsQrOpen(true)}
              onSwitchTab={setCurrentTab}
              onOpenSignIn={() => setAuthPage('signin')}
              onOpenSignUp={() => setAuthPage('signup')}
            />
          )}

          {currentTab === 'user' && (
            <UserPortal
              onOpenSos={() => setIsSosOpen(true)}
              onOpenQr={() => setIsQrOpen(true)}
            />
          )}

          {currentTab === 'hospital' && (
            <HospitalPortal />
          )}

          {currentTab === 'admin' && (
            <AdminDashboard />
          )}

          {currentTab === 'mobile' && (
            <MobileAppSimulator
              onOpenSos={() => setIsSosOpen(true)}
            />
          )}
        </ErrorBoundary>
      </div>

      {/* Footer */}
      <ErrorBoundary>
        <Footer
          onOpenSos={() => setIsSosOpen(true)}
          onOpenQr={() => setIsQrOpen(true)}
        />
      </ErrorBoundary>

      {/* Modals */}
      <ErrorBoundary>
        <EmergencyModal
          isOpen={isSosOpen}
          onClose={() => setIsSosOpen(false)}
        />

        <QRCodeModal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
        />

        <AiChatbotModal
          isOpen={isAiBotOpen}
          onClose={() => setIsAiBotOpen(false)}
          onOpenSos={() => { setIsAiBotOpen(false); setIsSosOpen(true); }}
        />
      </ErrorBoundary>

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <RealtimeProvider>
            <AppContent />
          </RealtimeProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
