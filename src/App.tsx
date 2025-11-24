import Desktop from '@/components/Desktop/Desktop'
import ErrorBoundary from '@/components/ErrorBoundary'
import AppProviders from '@/context/Providers'

const App = () => {
  return (
    <AppProviders>
      <ErrorBoundary>
        <Desktop />
      </ErrorBoundary>
    </AppProviders>
  )
}

export default App
