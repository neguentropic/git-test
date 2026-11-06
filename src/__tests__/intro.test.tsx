import { describe, it, expect } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import { introStore } from '@/lib/introStore'
import HomePage from '@/pages/HomePage'

describe('intro without WebGL', () => {
  it('falls back to a visible h1 and unlocks the page', () => {
    act(() => introStore.setStatus('loading'))
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(introStore.getStatus()).toBe('fallback')
    expect(screen.getByRole('heading', { level: 1, name: 'Neguentropia' })).not.toHaveClass(
      'sr-only',
    )
    expect(screen.getByRole('link', { name: /nous contacter/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /passer/i })).not.toBeInTheDocument()
  })
})

describe('HomePage during the intro', () => {
  it('keeps the h1 for assistive technology but hides it visually', () => {
    act(() => introStore.setStatus('playing'))
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Neguentropia' })).toHaveClass('sr-only')
  })
})
