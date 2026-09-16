import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[IL 3D Studio ErrorBoundary]', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            backgroundColor: '#FAF7F2',
            color: '#1A1A1A',
            fontFamily: 'sans-serif',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          role="alert"
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Ops! Algo não carregou como esperado.
          </h2>
          <p style={{ color: '#666', marginBottom: '1.5rem', maxWidth: '400px' }}>
            Não se preocupe, seus dados estão seguros. Tente recarregar a página ou entre em contato via WhatsApp.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#FF2D78',
              color: '#FFFFFF',
              border: '2.5px solid #1A1A1A',
              borderRadius: '999px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Recarregar Página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
