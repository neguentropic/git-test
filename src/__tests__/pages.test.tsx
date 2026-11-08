import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import ContactPage from '@/pages/ContactPage'

describe('HomePage', () => {
  it('renders the visually-hidden h1 with site name', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )
    // h1 is sr-only but still present in the DOM (§11, §12)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1 }),
    ).toHaveTextContent('Neguentropia')
  })
})

describe('ContactPage', () => {
  it('renders a Contact section heading', () => {
    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('heading', { level: 2, name: /contact/i }),
    ).toBeInTheDocument()
  })
})
