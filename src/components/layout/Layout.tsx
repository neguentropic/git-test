import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import IntroScene from '@/components/three/IntroScene'

export default function Layout() {
  return (
    <>
      {/* Skip to content — accessibility (§11) */}
      <a href="#main-content" className="skip-link">
        Aller au contenu
      </a>

      {/* Global WebGL canvas — fixed, z-index -1 (§7) */}
      <IntroScene />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main
          id="main-content"
          className="flex-1"
          tabIndex={-1}
        >
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  )
}
