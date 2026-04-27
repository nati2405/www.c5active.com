const FORMSUBMIT_TOKEN = '4deb7d076e4eb40630ca56f46c18d12e';
const CONTACT_ENDPOINT = `https://formsubmit.co/ajax/${FORMSUBMIT_TOKEN}`;
const ALERTS_ENDPOINT = `https://formsubmit.co/ajax/${FORMSUBMIT_TOKEN}`;
const SUBMIT_COOLDOWN_MS = 45 * 1000;

function getSubmitWaitSeconds(storageKey) {
  try {
    const lastSubmitAt = Number(localStorage.getItem(storageKey) || 0);
    const waitMs = SUBMIT_COOLDOWN_MS - (Date.now() - lastSubmitAt);
    return waitMs > 0 ? Math.ceil(waitMs / 1000) : 0;
  } catch {
    return 0;
  }
}

function setSubmitTimestamp(storageKey) {
  try {
    localStorage.setItem(storageKey, String(Date.now()));
  } catch {
    // Ignore storage errors so form submissions can continue.
  }
}

function markActiveNav() {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll('.site-nav a[data-page]').forEach((a) => {
    if (a.dataset.page === page) {
      a.classList.add('is-active');
    }
  });
}

function setupContactForm() {
  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('contactFeedback');
  if (!form || !feedback) return;
  const cooldownKey = 'c5_contact_last_submit_at';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nameInput = form.querySelector('input[name="name"]');
    const emailInput = form.querySelector('input[name="email"]');
    const messageInput = form.querySelector('textarea[name="message"]');
    const honeyInput = form.querySelector('input[name="_honey"]');
    const name = (nameInput?.value || '').trim();
    const email = (emailInput?.value || '').trim().toLowerCase();
    const message = (messageInput?.value || '').trim();
    const honeyValue = (honeyInput?.value || '').trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (honeyValue) {
      feedback.textContent = 'Could not send message. Please refresh and try again.';
      feedback.className = 'form-feedback is-error';
      return;
    }

    const waitSeconds = getSubmitWaitSeconds(cooldownKey);
    if (waitSeconds > 0) {
      feedback.textContent = `Please wait ${waitSeconds}s before sending another message.`;
      feedback.className = 'form-feedback is-error';
      return;
    }

    if (!name || !validEmail || message.length < 10) {
      feedback.textContent = 'Please enter valid details and a message of at least 10 characters.';
      feedback.className = 'form-feedback is-error';
      return;
    }

    try {
      feedback.textContent = 'Sending your message...';
      feedback.className = 'form-feedback';

      const response = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: 'New C5 Team Contact Message',
          _template: 'table',
          _captcha: 'false',
        }),
      });

      if (!response.ok) {
        throw new Error('Send failed');
      }

      feedback.textContent = 'Message sent. The C5 team will follow up soon.';
      feedback.className = 'form-feedback is-success';
      setSubmitTimestamp(cooldownKey);
      form.reset();
    } catch {
      feedback.textContent = 'Message failed to send. Please try again in a moment.';
      feedback.className = 'form-feedback is-error';
    }
  });
}

function setupLaunchAlertForm() {
  const form = document.getElementById('launchAlertForm');
  const feedback = document.getElementById('launchAlertFeedback');
  if (!form || !feedback) return;
  const cooldownKey = 'c5_launch_last_submit_at';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nameInput = form.querySelector('input[name="name"]');
    const emailInput = form.querySelector('input[name="email"]');
    const honeyInput = form.querySelector('input[name="_honey"]');
    const name = (nameInput?.value || '').trim() || 'C5 supporter';
    const email = (emailInput?.value || '').trim().toLowerCase();
    const honeyValue = (honeyInput?.value || '').trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (honeyValue) {
      feedback.textContent = 'Could not join launch alerts. Please refresh and try again.';
      feedback.className = 'form-feedback is-error';
      return;
    }

    const waitSeconds = getSubmitWaitSeconds(cooldownKey);
    if (waitSeconds > 0) {
      feedback.textContent = `Please wait ${waitSeconds}s before trying again.`;
      feedback.className = 'form-feedback is-error';
      return;
    }

    if (!validEmail) {
      feedback.textContent = 'Please enter a valid email address.';
      feedback.className = 'form-feedback is-error';
      return;
    }

    try {
      feedback.textContent = 'Adding you to launch alerts...';
      feedback.className = 'form-feedback';

      const response = await fetch(ALERTS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message: `${name} requested launch alert notifications for C5 Active.`,
          _subject: 'New C5 Launch Alert Signup',
          _template: 'table',
          _captcha: 'false',
          _autoresponse:
            'You are on the C5 Active launch alert list. We will email you when the app goes live.',
        }),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      feedback.textContent = 'You are in. We will notify you when C5 goes live.';
      feedback.className = 'form-feedback is-success';
      setSubmitTimestamp(cooldownKey);
      form.reset();
    } catch {
      feedback.textContent = 'Could not join launch alerts right now. Please try again.';
      feedback.className = 'form-feedback is-error';
    }
  });
}

function setYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function revealOnScroll() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );
  targets.forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
    observer.observe(el);
  });
}

function addCardTilt() {
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -6;
      const rotateY = ((x / rect.width) - 0.5) * 6;
      card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px) scale(1.01)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

function addAmbientParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const particleCount = 20;

  for (let i = 0; i < particleCount; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'particle';
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.top = `${Math.random() * 100}%`;
    dot.style.animationDuration = `${8 + Math.random() * 10}s`;
    dot.style.animationDelay = `${Math.random() * 3}s`;
    dot.style.opacity = `${0.25 + Math.random() * 0.45}`;
    container.appendChild(dot);
  }
}

function setupAutoHidingHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastY = window.scrollY;
  let ticking = false;

  function updateHeader() {
    const currentY = window.scrollY;
    const delta = currentY - lastY;

    if (currentY <= 16 || delta < -6) {
      header.classList.remove('is-hidden');
    } else if (delta > 8 && currentY > 120) {
      header.classList.add('is-hidden');
    }

    lastY = currentY;
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateHeader);
    },
    { passive: true }
  );
}

document.addEventListener('DOMContentLoaded', () => {
  markActiveNav();
  setupContactForm();
  setupLaunchAlertForm();
  setYear();
  revealOnScroll();
  addCardTilt();
  addAmbientParticles();
  setupAutoHidingHeader();
});
