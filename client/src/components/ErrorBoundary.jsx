import React from 'react';

/**
 * ErrorBoundary — Catches any unhandled React render errors and shows
 * a branded recovery page instead of a blank white screen.
 *
 * Usage: Wrap any subtree that could crash:
 *   <ErrorBoundary>
 *     <MyComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('💥 React Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        padding: '24px',
      }}>
        <div style={{
          maxWidth: 520,
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: '40px 36px',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Logo */}
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 32,
          }}>
            ❤️
          </div>

          <h1 style={{ color: '#f8fafc', fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>
            Something went wrong
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.6 }}>
            LifeLink encountered an unexpected error. Your data is safe — this is a display issue only.
          </p>

          {/* Error details (dev mode only) */}
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 24,
              textAlign: 'left',
              fontSize: '0.78rem',
              color: '#fca5a5',
              fontFamily: 'monospace',
              maxHeight: 120,
              overflowY: 'auto',
            }}>
              <strong>Error:</strong> {this.state.error.toString()}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #E53935, #C62828)',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.target.style.opacity = '0.85'}
              onMouseLeave={e => e.target.style.opacity = '1'}
            >
              🔄 Try Again
            </button>

            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 28px',
                background: 'transparent',
                color: '#94a3b8',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; }}
            >
              ↺ Reload Page
            </button>
          </div>

          <p style={{ color: '#475569', fontSize: '0.78rem', marginTop: 24 }}>
            If this keeps happening, please contact{' '}
            <a href="mailto:support@lifelink.org" style={{ color: '#E53935' }}>
              support@lifelink.org
            </a>
          </p>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
