import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import ContactPage from '@/pages/ContactPage'

describe('HomePage', () => {
  it('renders the visually-hidden h1', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})

describe('ContactPage', () => {
  it('renders the contact heading', () => {
    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1, name: /contact/i })).toBeInTheDocument()
  })

  it('renders the form with required fields', () => {
    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>,
    )
    expect(screen.getByLabelText(/nom/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
  })
})
