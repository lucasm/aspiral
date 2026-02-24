'use client'

import { MantineProvider, createTheme } from '@mantine/core'

const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: 9,
  colors: {
    brand: ['#f0f0f0', '#d9d9d9', '#bfbfbf', '#a6a6a6', '#8c8c8c', '#737373', '#595959', '#404040', '#262626', '#000000'],
  },
  autoContrast: true,
  defaultRadius: 'md', // 8px — igual ao --radius do globals.css
  fontFamily: 'var(--font), sans-serif',
  fontFamilyMonospace: 'var(--font), monospace',
})

export default function MantineWrapper({ children }: { children: React.ReactNode }) {
  return <MantineProvider theme={theme}>{children}</MantineProvider>
}
