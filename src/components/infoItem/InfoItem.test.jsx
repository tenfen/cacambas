import { render, screen } from '@testing-library/react'
import { InfoItem } from './InfoItem'
describe('InfoItem Test Suite', () => {
    
    it('should render component', () => {
        render(<InfoItem label="Armazenamento" content="128 GB"/>)
        expect(screen.getByRole('list')).toBeVisible()
    })
    it('should receive and display label', () => { 
        render(<InfoItem label="Armazenamento" content="128 GB"/>)
        expect(screen.getByText(/Armazenamento/)).toBeVisible()
    })

    it('should receive and display Value', () => {
        render(<InfoItem label="Armazenamento" content="128 GB"/>)
        expect(screen.getByText('128 GB')).toBeVisible()
    })
})