// Imports
import { render, screen } from '@testing-library/react'
import user from '@testing-library/user-event'
import Button  from './Button'
//Testing Suite
describe('Button Test Suite', () => {

    it('shoulder render component', () => {
        render(<Button />)
        expect(getButton()).toBeVisible()
    })

    it('should render children', () => {
        render(<Button>Save</Button>)
        expect(screen.getByText("Save")).toBeVisible()
    })

    it('should apply className', () => {
        render(<Button className="red" >Save</Button>)
        expect(getButton()).toHaveClass("red")
    })

    it('should have className button-standard', () => {
        render(<Button>Save</Button>)
        expect(getButton()).toHaveClass("button-standard")
    })

    it('should receive onClick function', () => {
        const onClickMocked = jest.fn()
        render(<Button onClick={onClickMocked} >Save</Button>)
        user.click(getButton())
        expect(onClickMocked).toHaveBeenCalledTimes(1)
    })

    it('should receive other props', () => {
        render(<Button disabled >Save</Button>)
        expect(getButton()).toBeDisabled()
    })
})

export function getButton() {
    return screen.getByRole('button')
}