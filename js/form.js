/* ============================================
   MHPL Project - Form Handling
   ============================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initContactForm();
    initNewsletterForm();
    initBrochureDownload();
  });

  /* ──────────────────────────────────────────────
     VALIDATION HELPERS
     ────────────────────────────────────────────── */

  /**
   * Validates a single field and updates UI accordingly.
   * @param {HTMLElement} input - The input element to validate
   * @param {Function} validationFn - Returns { valid: boolean, message: string }
   * @returns {boolean} Whether the field is valid
   */
  function validateField(input, validationFn) {
    const formGroup = input.closest('.form-group');
    const errorSpan = formGroup ? formGroup.querySelector('.form-error') : null;
    const result = validationFn(input.value.trim());

    if (formGroup) {
      formGroup.classList.remove('error', 'success');
      formGroup.classList.add(result.valid ? 'success' : 'error');
    }

    if (errorSpan) {
      errorSpan.textContent = result.valid ? '' : result.message;
    }

    return result.valid;
  }

  /** Clear field validation state */
  function clearFieldState(input) {
    const formGroup = input.closest('.form-group');
    const errorSpan = formGroup ? formGroup.querySelector('.form-error') : null;

    if (formGroup) {
      formGroup.classList.remove('error', 'success');
    }
    if (errorSpan) {
      errorSpan.textContent = '';
    }
  }

  /* ──────────────────────────────────────────────
     VALIDATION RULES
     ────────────────────────────────────────────── */

  function validateName(value) {
    if (!value) {
      return { valid: false, message: 'Full name is required.' };
    }
    if (value.length < 2) {
      return { valid: false, message: 'Name must be at least 2 characters.' };
    }
    return { valid: true, message: '' };
  }

  function validateEmail(value) {
    if (!value) {
      return { valid: false, message: 'Email address is required.' };
    }
    var emailPattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(value)) {
      return { valid: false, message: 'Please enter a valid email address.' };
    }
    return { valid: true, message: '' };
  }

  function validatePhone(value) {
    if (!value) {
      return { valid: false, message: 'Phone number is required.' };
    }
    // Indian phone: 10 digits, starts with 6-9
    var phonePattern = /^[6-9]\d{9}$/;
    // Strip spaces, dashes, +91 prefix for flexibility
    var cleaned = value.replace(/[\s\-\+]/g, '');
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      cleaned = cleaned.substring(2);
    }
    if (!phonePattern.test(cleaned)) {
      return { valid: false, message: 'Please enter a valid 10-digit Indian phone number.' };
    }
    return { valid: true, message: '' };
  }

  function validateMessage(value) {
    if (!value) {
      return { valid: false, message: 'Message is required.' };
    }
    if (value.length < 10) {
      return { valid: false, message: 'Message must be at least 10 characters.' };
    }
    return { valid: true, message: '' };
  }

  /* ──────────────────────────────────────────────
     1. CONTACT FORM
     ────────────────────────────────────────────── */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var nameInput = document.getElementById('contactName');
    var emailInput = document.getElementById('contactEmail');
    var phoneInput = document.getElementById('contactPhone');
    var messageInput = document.getElementById('contactMessage');
    var submitBtn = document.getElementById('submitBtn');
    var formStatus = document.getElementById('formStatus');

    // ── Real-time validation on blur ──
    if (nameInput) {
      nameInput.addEventListener('blur', function () {
        validateField(nameInput, validateName);
      });
      nameInput.addEventListener('input', function () {
        if (nameInput.closest('.form-group').classList.contains('error')) {
          validateField(nameInput, validateName);
        }
      });
    }

    if (emailInput) {
      emailInput.addEventListener('blur', function () {
        validateField(emailInput, validateEmail);
      });
      emailInput.addEventListener('input', function () {
        if (emailInput.closest('.form-group').classList.contains('error')) {
          validateField(emailInput, validateEmail);
        }
      });
    }

    if (phoneInput) {
      phoneInput.addEventListener('blur', function () {
        validateField(phoneInput, validatePhone);
      });
      phoneInput.addEventListener('input', function () {
        if (phoneInput.closest('.form-group').classList.contains('error')) {
          validateField(phoneInput, validatePhone);
        }
      });
    }

    if (messageInput) {
      messageInput.addEventListener('blur', function () {
        validateField(messageInput, validateMessage);
      });
      messageInput.addEventListener('input', function () {
        if (messageInput.closest('.form-group').classList.contains('error')) {
          validateField(messageInput, validateMessage);
        }
      });
    }

    // ── Form submission ──
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Validate all fields
      var isNameValid = validateField(nameInput, validateName);
      var isEmailValid = validateField(emailInput, validateEmail);
      var isPhoneValid = validateField(phoneInput, validatePhone);
      var isMessageValid = validateField(messageInput, validateMessage);

      if (!isNameValid || !isEmailValid || !isPhoneValid || !isMessageValid) {
        // Focus the first invalid field
        if (!isNameValid) nameInput.focus();
        else if (!isEmailValid) emailInput.focus();
        else if (!isPhoneValid) phoneInput.focus();
        else if (!isMessageValid) messageInput.focus();
        return;
      }

      // Show loading state
      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
      }

      if (formStatus) {
        formStatus.textContent = '';
        formStatus.className = 'form-status';
      }

      // Simulate form submission with 2s delay
      setTimeout(function () {
        // Remove loading state
        if (submitBtn) {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
        }

        // Show success message
        if (formStatus) {
          formStatus.textContent = 'Thank you! Your message has been sent successfully. We\'ll get back to you shortly.';
          formStatus.classList.add('success');
        }

        // Reset form
        form.reset();

        // Clear all validation states
        [nameInput, emailInput, phoneInput, messageInput].forEach(function (input) {
          if (input) clearFieldState(input);
        });

        // Clear success message after 5 seconds
        setTimeout(function () {
          if (formStatus) {
            formStatus.textContent = '';
            formStatus.className = 'form-status';
          }
        }, 5000);
      }, 2000);
    });
  }

  /* ──────────────────────────────────────────────
     2. NEWSLETTER FORM
     ────────────────────────────────────────────── */
  function initNewsletterForm() {
    var form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var emailInput = document.getElementById('newsletterEmail');
      if (!emailInput) return;

      var email = emailInput.value.trim();
      var result = validateEmail(email);

      if (!result.valid) {
        alert(result.message);
        emailInput.focus();
        return;
      }

      alert('Thank you for subscribing! You\'ll receive our latest updates at ' + email + '.');
      form.reset();
    });
  }

  /* ──────────────────────────────────────────────
     3. BROCHURE DOWNLOAD
     ────────────────────────────────────────────── */
  function initBrochureDownload() {
    var brochureBtns = document.querySelectorAll('.brochure-btn');
    if (brochureBtns.length === 0) return;

    brochureBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();

        var fileUrl = btn.getAttribute('href') || btn.getAttribute('data-file');

        if (fileUrl && fileUrl !== '#' && fileUrl !== '') {
          // Attempt to trigger file download
          var link = document.createElement('a');
          link.href = fileUrl;
          link.download = fileUrl.split('/').pop() || 'brochure.pdf';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          alert('The brochure is currently being updated. Please contact us directly to request a copy.');
        }
      });
    });
  }

})();
