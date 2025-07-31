import { render, screen, fireEvent } from '@testing-library/react'

import { Counter } from '../counter'

describe('Counter', () => {
  it('renders with initial count of 0', () => {
    render(<Counter />)
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('increments count when increment button is clicked', () => {
    render(<Counter />)
    fireEvent.click(screen.getByTestId('increment'))
    expect(screen.getByTestId('count')).toHaveTextContent('1')
  })

  it('decrements count when decrement button is clicked', () => {
    render(<Counter />)
    fireEvent.click(screen.getByTestId('increment'))
    fireEvent.click(screen.getByTestId('decrement'))
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('resets count when reset button is clicked', () => {
    render(<Counter />)
    fireEvent.click(screen.getByTestId('increment'))
    fireEvent.click(screen.getByTestId('increment'))
    fireEvent.click(screen.getByTestId('reset'))
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })
})
