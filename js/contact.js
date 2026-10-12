/* =========================================================
   EMPro Solutions — Contact Modal
   - Bubble-style open/close
   - Client-side validation
   - Submits to letstalk@emprosolution.co.nz via FormSubmit
   - Shows thank-you view on success
   ========================================================= */
(function () {
  const modal    = document.getElementById('contactModal');
  const card     = document.getElementById('modalCard');
  const formView = document.getElementById('viewForm');
  const thankView= document.getElementById('viewThanks');
  const form     = document.getElementById('contactForm');
  const submitBtn= document.getElementById('submitBtn');

  let lastFocused = null;
  let isOpen = false;

  /* ---------- OPEN ---------- */
  function openModal() {
    if (isOpen) return;
    isOpen = true;
    lastFocused = document.activeElement;

    // Reset views
    formView.hidden = false;
    thankView.hidden = true;
    form.reset();
    clearErrors();
    submitBtn.classList.remove('is-loading');
    submitBtn.disabled = false;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-lock');

    // Focus first field after animation
    setTimeout(() => {
      const first = form.querySelector('input, select, textarea');
      if (first) first.focus();
    }, 520);
  }

  /* ---------- CLOSE ---------- */
  function closeModal() {
    if (!isOpen) return;
    isOpen = false;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');

    // Wait for bubble-out animation to finish before unlocking scroll
    setTimeout(() => {
      document.body.classList.remove('modal-lock');
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }, 420);
  }

  /* ---------- TRIGGERS ---------- */
  document.querySelectorAll('[data-open-contact]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  document.querySelectorAll('[data-close-contact]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  // Click on backdrop (outside card) closes
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // ESC closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeModal();
  });

  // Focus trap
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !isOpen) return;
    const focusables = card.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  /* ---------- VALIDATION ---------- */
  function setError(id, msg) {
    const field = document.getElementById(id);
    const err   = document.querySelector(`[data-error-for="${id}"]`);
    if (field) field.classList.add('has-error');
    if (err)   err.textContent = msg;
  }
  function clearError(id) {
    const field = document.getElementById(id);
    const err   = document.querySelector(`[data-error-for="${id}"]`);
    if (field) field.classList.remove('has-error');
    if (err)   err.textContent = '';
  }
  function clearErrors() {
    ['fullName','email','reason','message'].forEach(clearError);
  }

  function validate() {
    clearErrors();
    let ok = true;

    const name  = form.fullName.value.trim();
    const email = form.email.value.trim();
    const reason= form.reason.value;
    const msg   = form.message.value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name.length < 2) { setError('fullName', 'Please enter your name.'); ok = false; }
    if (!emailRe.test(email)) { setError('email', 'Please enter a valid email.'); ok = false; }
    if (!reason) { setError('reason', 'Please choose a reason.'); ok = false; }
    if (msg.length < 10) { setError('message', 'Please tell us a bit more (min 10 characters).'); ok = false; }

    return ok;
  }

  // Live-clear on input
  ['fullName','email','reason','message'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => clearError(id));
    el.addEventListener('change', () => clearError(id));
  });

  /* ---------- SUBMIT ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) {
      // Shake the card gently
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
      return;
    }

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    try {
      const data = new FormData(form);
      const res  = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok || res.type === 'opaque') {
        // Success → show thank-you view
        formView.hidden = true;
        thankView.hidden = false;
      } else {
        throw new Error('Send failed');
      }
    } catch (err) {
      // Fallback: open mailto with prefilled content
      const subject = encodeURIComponent('New enquiry from EMPro Solutions website');
      const body    = encodeURIComponent(
        `Full Name: ${form.fullName.value}\n` +
        `Email: ${form.email.value}\n` +
        `Organization: ${form.organization.value}\n` +
        `Reason: ${form.reason.value}\n\n` +
        `${form.message.value}`
      );
      window.location.href = `mailto:letstalk@emprosolution.co.nz?subject=${subject}&body=${body}`;

      // Still show thank-you so the user gets feedback
      formView.hidden = true;
      thankView.hidden = false;
    } finally {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  });
})();
