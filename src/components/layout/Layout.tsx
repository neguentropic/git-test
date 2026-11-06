import { Outlet, useLocation } from 'react-router-dom'
import { useIntroStatus } from '@/hooks/useIntroStatus'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import Header from './Header'
import Footer from './Footer'
import IntroStage from './IntroStage'

export default function Layout() {
  const { pathname } = useLocation()
  const status = useIntroStatus()
  const locked = status === 'loading' || status === 'playing'
  const chromeClassName = `relative z-20 transition-opacity duration-1000 ${
    locked ? 'opacity-0' : 'opacity-100'
  }`

  useSmoothScroll(locked)

  return (
    <div className="relative flex min-h-screen flex-col">
      <IntroStage isHome={pathname === '/'} />
      <div inert={locked} className={chromeClassName}>
        <Header />
      </div>
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
      <div inert={locked} className={chromeClassName}>
        <Footer />
      </div>
    </div>
  )
}
