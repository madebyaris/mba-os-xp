import type { ReactNode } from 'react'

import { AppProvider } from './AppContext'
import { ThemeProvider } from './ThemeContext'
import { WindowProvider } from './WindowContext'

const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <WindowProvider>
        <AppProvider>{children}</AppProvider>
      </WindowProvider>
    </ThemeProvider>
  )
}

export default AppProviders

