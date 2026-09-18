// Form Utilities - Shared validation and animation functions

const FormUtils = {
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || email.trim() === '') {
      return {
        isValid: false,
        message: 'Email é obrigatório'
      };
    }
    
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        message: 'Email inválido'
      };
    }
    
    return { isValid: true };
  },

  validatePassword(password) {
    if (!password || password.trim() === '') {
      return {
        isValid: false,
        message: 'Senha é obrigatória'
      };
    }
    
    if (password.length < 6) {
      return {
        isValid: false,
        message: 'Senha deve ter no mínimo 6 caracteres'
      };
    }
    
    return { isValid: true };
  },

  showError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    const formGroup = document.getElementById(fieldName)?.closest('.form-group');
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }
    
    if (formGroup) {
      formGroup.classList.add('error');
    }
  },

  clearError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    const formGroup = document.getElementById(fieldName)?.closest('.form-group');
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('show');
    }
    
    if (formGroup) {
      formGroup.classList.remove('error');
    }
  },

  showSuccess(fieldName) {
    const formGroup = document.getElementById(fieldName)?.closest('.form-group');
    if (formGroup) {
      formGroup.classList.add('success');
      setTimeout(() => {
        formGroup.classList.remove('success');
      }, 2000);
    }
  },

  setupFloatingLabels(form) {
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
      const updateLabel = () => {
        if (input.value.trim() !== '') {
          input.classList.add('has-value');
        } else {
          input.classList.remove('has-value');
        }
      };

      input.addEventListener('input', updateLabel);
      input.addEventListener('blur', updateLabel);
      updateLabel();
    });
  },

  setupPasswordToggle(passwordInput, toggleButton) {
    if (!passwordInput || !toggleButton) return;

    toggleButton.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      
      const eyeIcon = toggleButton.querySelector('.eye-icon');
      if (eyeIcon) {
        eyeIcon.classList.toggle('show-password');
      }
    });
  },

  addEntranceAnimation(element) {
    if (element) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 100);
    }
  },

  showNotification(message, type = 'info', parentElement) {
    const notification = document.createElement('div');
    notification.className = `form-notification ${type}`;
    notification.textContent = message;
    
    if (parentElement) {
      parentElement.appendChild(notification);
    } else {
      document.body.appendChild(notification);
    }
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  },

  addSharedAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
      }
      
      .form-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 10000;
      }
      
      .form-notification.show {
        opacity: 1;
        transform: translateX(0);
      }
      
      .form-notification.error {
        background: rgba(239, 68, 68, 0.95);
        color: white;
      }
      
      .form-notification.success {
        background: rgba(34, 197, 94, 0.95);
        color: white;
      }
      
      .form-notification.info {
        background: rgba(6, 182, 212, 0.95);
        color: white;
      }
    `;
    document.head.appendChild(style);
  }
};

export default FormUtils;
