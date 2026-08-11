import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeContext';
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
  const [currentTab, setCurrentTab] = useState('landing');
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isAiBotOpen, setIsAiBotOpen] = useState(false);

  // Auth pages: 'signin' | 'signup' | null (no auth page)
  const [authPage, setAuthPage] = useState(null);

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
      <SignInPage
        onSwitchToSignUp={() => setAuthPage('signup')}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  if (authPage === 'signup') {
    return (
      <SignUpPage
        onSwitchToSignIn={() => setAuthPage('signin')}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Header Navigation Bar */}
      <Navbar
        onOpenSos={() => setIsSosOpen(true)}
        onOpenQr={() => setIsQrOpen(true)}
        onOpenAuth={() => setAuthPage('signin')}
        onOpenSignUp={() => setAuthPage('signup')}
        onOpenAiBot={() => setIsAiBotOpen(true)}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Main Active Page View */}
      <div style={{ flex: 1 }}>
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
      </div>

      {/* Footer */}
      <Footer
        onOpenSos={() => setIsSosOpen(true)}
        onOpenQr={() => setIsQrOpen(true)}
      />

      {/* Modals */}
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

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RealtimeProvider>
          <AppContent />
        </RealtimeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
