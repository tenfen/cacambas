import React, { useEffect, useRef } from "react"
import Logo from "assets/images/logo.svg"
import FormUtils from "../../helpers/form-utils"
import UserController from "../../controllers/UserController"
import AuthContext from "../../contexts/AuthContext"
import { setSessionItem } from "../../helpers/StorageTools"
import "./registerEmail.scss"

export function RegisterEmail({ onClick, onLogin, onRegisterSuccess, onTerms, onPrivacy, onPermissions, onBack }) {
    const [register, setRegister] = React.useState({
    userName: "",
    userLastname: "",
    userPhone: "",
    userEmail: "",
    userPass: "",
    userPassConfirm: "",
  })

  
  const [agreement, setAgreement] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)

  const formRef = useRef(null)
  const cardRef = useRef(null)

  const { setUser } = React.useContext(AuthContext)

  useEffect(() => {
    if (cardRef.current) {
      FormUtils.addEntranceAnimation(cardRef.current)
    }

    if (formRef.current) {
      FormUtils.setupFloatingLabels(formRef.current)
    }

    FormUtils.addSharedAnimations()

    setTimeout(() => {
      const input = document.getElementById("userName")

      if (input) {
        input.focus()
      }
    }, 700)
  }, [])

  const handleChange = (field, value) => {
    setRegister((prev) => ({
      ...prev,
      [field]: value,
    }))

    FormUtils.clearError(field)
  }

  const validateForm = () => {
    let isValid = true

    if (!register.userName.trim()) {
      FormUtils.showError("userName", "Informe seu nome.")
      isValid = false
    }

    if (!register.userLastname.trim()) {
      FormUtils.showError("userLastname", "Informe seu sobrenome.")
      isValid = false
    }

    const phone = register.userPhone.replace(/\D/g, "")

    if (phone.length < 10) {
      FormUtils.showError("userPhone", "Informe um telefone válido.")
      isValid = false
    }

    const emailValidation = FormUtils.validateEmail(register.userEmail)

    if (!emailValidation.isValid) {
      FormUtils.showError("userEmail", emailValidation.message)
      isValid = false
    }

    const passwordValidation = FormUtils.validatePassword(register.userPass)

    if (!passwordValidation.isValid) {
      FormUtils.showError("userPass", passwordValidation.message)
      isValid = false
    }

    if (register.userPass !== register.userPassConfirm) {
      FormUtils.showError(
        "userPassConfirm",
        "As senhas não são iguais."
      )
      isValid = false
    }

    if (!agreement) {
      FormUtils.showError(
        "agreement",
        "Você precisa aceitar os termos de uso e a política de privacidade."
      )
      isValid = false
    }

    return isValid
  }

  const createUser = async () => {
  const userPhoneTrim = register.userPhone.replace(/\D/g, "");

  try {
    const post = {
      userName: register.userName.trim(),
      userLastname: register.userLastname.trim(),
      userPass: register.userPass,
      userPhone: userPhoneTrim,
      userEmail: register.userEmail.trim().toLowerCase(),
      userRole: "user",
      userAddressId: null,
    };

    console.log("Enviando dados de cadastro para API...", post);

    const res = await UserController.createUser(post);

    console.log(
      "Resposta do cadastro:",
      res.status,
      res.message
    );

    if (res.status !== 200) {
      FormUtils.showError(
        "userEmail",
        res.error || res.message || "Não foi possível realizar o cadastro."
      );

      return false;
    }

    console.log("Usuário cadastrado como pendente de ativação.");

    const createdUser = res.content?.user || res.content;
    const createdToken = res.content?.token;

    setShowSuccess(true);

    setTimeout(() => {
      if (onRegisterSuccess) {
        onRegisterSuccess(createdUser, createdToken);
      } else if (onLogin) {
        onLogin();
      }
    }, 1500);

    return true;
  } catch (error) {
    console.error("Erro no cadastro:", error);

    FormUtils.showError(
      "userEmail",
      error?.message || "Falha ao cadastrar usuário. Tente novamente."
    );

    return false;
  }
}

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isSubmitting) return

    const isValid = validateForm()

    if (!isValid) {
      if (formRef.current) {
        formRef.current.style.animation =
          "shake 0.5s ease-in-out"

        setTimeout(() => {
          if (formRef.current) {
            formRef.current.style.animation = ""
          }
        }, 500)
      }

      return
    }

    setIsSubmitting(true)

    try {
      if (onClick) {
        await onClick(register)
      } else {
        await createUser()
      }
    } catch (error) {
      console.error("Register error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11)

    if (numbers.length <= 2) {
      return numbers
    }

    if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    }

    return `(${numbers.slice(0, 2)}) ${numbers.slice(
      2,
      7
    )}-${numbers.slice(7)}`
  }

  return (
    <main id="register">
      <div className="register-container">
        <div className="register-card" ref={cardRef}>
          <div className="register-header">
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
              <img
                src={Logo}
                alt="Logomarca"
                className="logomarca"
              />
            )}

            <h2>Crie sua conta</h2>

            <p>
              Cadastre-se para acessar o painel administrativo
            </p>
          </div>

          <form
            className="register-form"
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="form-row">
              <div className="form-group">
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    required
                    autoComplete="given-name"
                    value={register.userName}
                    onChange={(e) =>
                      handleChange(
                        "userName",
                        e.target.value
                      )
                    }
                  />

                  <label htmlFor="userName">
                    Nome
                  </label>

                  <span className="focus-border"></span>
                </div>

                <span
                  className="error-message"
                  id="userNameError"
                ></span>
              </div>

              <div className="form-group">
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="userLastname"
                    name="userLastname"
                    required
                    autoComplete="family-name"
                    value={register.userLastname}
                    onChange={(e) =>
                      handleChange(
                        "userLastname",
                        e.target.value
                      )
                    }
                  />

                  <label htmlFor="userLastname">
                    Sobrenome
                  </label>

                  <span className="focus-border"></span>
                </div>

                <span
                  className="error-message"
                  id="userLastnameError"
                ></span>
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type="tel"
                  id="userPhone"
                  name="userPhone"
                  required
                  autoComplete="tel"
                  value={register.userPhone}
                  onChange={(e) =>
                    handleChange(
                      "userPhone",
                      formatPhone(e.target.value)
                    )
                  }
                />

                <label htmlFor="userPhone">
                  Telefone
                </label>

                <span className="focus-border"></span>
              </div>

              <span
                className="error-message"
                id="userPhoneError"
              ></span>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type="email"
                  id="userEmail"
                  name="userEmail"
                  required
                  autoComplete="email"
                  value={register.userEmail}
                  onChange={(e) =>
                    handleChange(
                      "userEmail",
                      e.target.value
                    )
                  }
                />

                <label htmlFor="userEmail">
                  Email
                </label>

                <span className="focus-border"></span>
              </div>

              <span
                className="error-message"
                id="userEmailError"
              ></span>
            </div>

            <div className="form-group">
              <div className="input-wrapper password-wrapper">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  id="userPass"
                  name="userPass"
                  required
                  autoComplete="new-password"
                  value={register.userPass}
                  onChange={(e) =>
                    handleChange(
                      "userPass",
                      e.target.value
                    )
                  }
                />

                <label htmlFor="userPass">
                  Senha
                </label>

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label="Alternar visibilidade da senha"
                >
                  <span
                    className={`eye-icon ${
                      showPassword
                        ? "show-password"
                        : ""
                    }`}
                  ></span>
                </button>

                <span className="focus-border"></span>
              </div>

              <span
                className="error-message"
                id="userPassError"
              ></span>
            </div>

            <div className="form-group">
              <div className="input-wrapper password-wrapper">
                <input
                  type={
                    showPasswordConfirm
                      ? "text"
                      : "password"
                  }
                  id="userPassConfirm"
                  name="userPassConfirm"
                  required
                  autoComplete="new-password"
                  value={register.userPassConfirm}
                  onChange={(e) =>
                    handleChange(
                      "userPassConfirm",
                      e.target.value
                    )
                  }
                />

                <label htmlFor="userPassConfirm">
                  Confirme sua senha
                </label>

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPasswordConfirm(
                      !showPasswordConfirm
                    )
                  }
                  aria-label="Alternar visibilidade da senha"
                >
                  <span
                    className={`eye-icon ${
                      showPasswordConfirm
                        ? "show-password"
                        : ""
                    }`}
                  ></span>
                </button>

                <span className="focus-border"></span>
              </div>

              <span
                className="error-message"
                id="userPassConfirmError"
              ></span>
            </div>

            <div className="agreement-group">
              <label className="agreement-label">
                <input
                  type="checkbox"
                  checked={agreement}
                  onChange={(e) =>
                    setAgreement(e.target.checked)
                  }
                />

                <span className="custom-checkbox"></span>

                <span className="agreement-text">
                  Eu aceito os{" "}
                  <button
                    type="button"
                    className="agreement-link"
                    onClick={onTerms}
                  >
                    Termos de Uso
                  </button>{" "}
                  e a{" "}
                  <button
                    type="button"
                    className="agreement-link"
                    onClick={onPrivacy}
                  >
                    Política de Privacidade
                  </button>
                </span>
              </label>

              <span
                className="error-message"
                id="agreementError"
              ></span>
            </div>

            <button
              type="submit"
              className={`register-btn btn ${
                isSubmitting ? "loading" : ""
              }`}
              disabled={isSubmitting || !agreement}
            >
              <span className="btn-text">
                Criar conta
              </span>

              <span className="btn-loader"></span>
            </button>
          </form>

          {showSuccess && (
            <div className="success-message show">
              <div className="success-icon">
                ✓
              </div>

              <h3>
                Cadastro realizado com sucesso!
              </h3>

              <p>
                Redirecionando...
              </p>
            </div>
          )}

          <div className="register-footer">
            <span>
              Já possui uma conta?
            </span>

            <button
              type="button"
              onClick={onLogin}
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
