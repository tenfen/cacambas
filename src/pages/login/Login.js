import React, { useEffect, useRef } from "react"
import Logo from "assets/images/logo.svg"
import FormUtils from "../../helpers/form-utils"
import "./Login.scss"

export function Login({ onClick, onRegister, onForgotPassword, onBack }) {
  const [login, setLogin] = React.useState({ userEmail: "", userPass: "" })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const formRef = useRef(null)
  const cardRef = useRef(null)
  const passwordInputRef = useRef(null)

  useEffect(() => {
    // Add entrance animation
    if (cardRef.current) {
      FormUtils.addEntranceAnimation(cardRef.current)
    }

    // Setup floating labels
    if (formRef.current) {
      FormUtils.setupFloatingLabels(formRef.current)
    }

    // Add shared animations
    FormUtils.addSharedAnimations()

    // Focus on email input after animation
    setTimeout(() => {
      const emailInput = document.getElementById('email')
      if (emailInput) emailInput.focus()
    }, 700)
  }, [])

  const onChangeUsername = (userEmail) => {
    setLogin({ ...login, userEmail })
    FormUtils.clearError('email')
  }

  const onChangePassword = (userPass) => {
    setLogin({ ...login, userPass })
    FormUtils.clearError('password')
  }

  const validateForm = () => {
    let isValid = true

    const emailValidation = FormUtils.validateEmail(login.userEmail)
    if (!emailValidation.isValid) {
      FormUtils.showError('email', emailValidation.message)
      isValid = false
    }

    const passwordValidation = FormUtils.validatePassword(login.userPass)
    if (!passwordValidation.isValid) {
      FormUtils.showError('password', passwordValidation.message)
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (isSubmitting) return

    const isValid = validateForm()

    if (isValid) {
      setIsSubmitting(true)
      
      try {
        await onClick(login)
      } catch (error) {
        console.error('Login error:', error)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Shake animation on error
      if (formRef.current) {
        formRef.current.style.animation = 'shake 0.5s ease-in-out'
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.style.animation = ''
          }
        }, 500)
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <main id="login">
      <div className="login-container">
        <div className="login-card" ref={cardRef}>
          <div className="login-header">
            {onBack ? (
              <button
                type="button"
                className="logomarca-link"
                onClick={onBack}
                aria-label="Voltar para a página inicial"
              >
                <img src={Logo} alt="Logomarca" className="logomarca" />
              </button>
            ) : (
              <img src={Logo} alt="Logomarca" className="logomarca" />
            )}
            <h2>Bem-vindo de volta</h2>
            <p>Acesse o painel administrativo</p>
          </div>
          
          <form className="login-form" ref={formRef} onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <div className="input-wrapper">
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  autoComplete="email"
                  value={login.userEmail}
                  onChange={(e) => onChangeUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <label htmlFor="email">Email</label>
                <span className="focus-border"></span>
              </div>
              <span className="error-message" id="emailError"></span>
            </div>

            <div className="form-group">
              <div className="input-wrapper password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password" 
                  name="password" 
                  required 
                  autoComplete="current-password"
                  ref={passwordInputRef}
                  value={login.userPass}
                  onChange={(e) => onChangePassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />

                <label htmlFor="password">Senha</label>

                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={togglePasswordVisibility}
                  aria-label="Alternar visibilidade da senha"
                >
                  <span
                    className={`eye-icon ${
                      showPassword ? "show-password" : ""
                    }`}
                  ></span>
                </button>

                <span className="focus-border"></span>
              </div>

              <span
                className="error-message"
                id="passwordError"
              ></span>

              <button
                type="button"
                className="forgot-password-link"
                onClick={onForgotPassword}
              >
                Esqueci minha senha
              </button>
            </div>

            {/* Cadastro */}
            <div className="register-link-container">
              <span className="register-link-text">
                Ainda não possui uma conta?
              </span>

              <button
                type="button"
                className="register-link"
                onClick={onRegister}
              >
                Cadastre-se
              </button>
            </div>

            <button
              type="submit"
              className={`login-btn btn ${
                isSubmitting ? "loading" : ""
              }`}
              disabled={isSubmitting}
            >
              <span className="btn-text">Entrar</span>
              <span className="btn-loader"></span>
            </button>
          </form>

          {showSuccess && (
            <div className="success-message show">
              <div className="success-icon">✓</div>
              <h3>Login realizado com sucesso!</h3>
              <p>Redirecionando para o painel...</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
