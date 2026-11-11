import { Outlet } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Header from './Header'
import Footer from './Footer'

const IntroScene = lazy(() => import('@/components/three/IntroScene'))

export default function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <IntroScene />
      </Suspense>
      <Header />
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
