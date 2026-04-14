(function () {
  const data = window.C5DemoData;
  if (!data) return;

  const app = document.getElementById('demoApp');
  const progressBar = document.getElementById('demoProgressBar');
  const stepCount = document.getElementById('demoStepCount');
  if (!app || !progressBar || !stepCount) return;

  const steps = ['intro', 'discovery', 'match', 'messages', 'progress'];
  const state = {
    step: 'intro',
    profileIndex: 0,
    matchedProfile: data.profiles[0],
    messages: [...data.starterMessages],
    replyLocked: false,
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setStep(step) {
    state.step = step;
    render();
  }

  function animateRender(markup) {
    app.classList.remove('is-entering');
    app.innerHTML = markup;
    requestAnimationFrame(() => app.classList.add('is-entering'));
    bindEvents();
  }

  function renderIntro() {
    return `
      <section class="demo-screen">
        <div class="demo-screen-header">
          <span class="demo-mini-label">Welcome</span>
          <h2>Welcome to C5 Active</h2>
          <p>Fitness gets easier when routine, local discovery, and accountability all work together.</p>
        </div>
        <article class="demo-panel demo-onboarding">
          <div class="demo-avatar-lockup">
            <div class="demo-avatar demo-avatar-primary">C5</div>
            <div>
              <strong>${escapeHtml(data.viewer.name)}</strong>
              <span>${escapeHtml(data.viewer.city)}</span>
            </div>
          </div>
          <div class="demo-stat-row">
            <div class="demo-stat">
              <span>Goal</span>
              <strong>${escapeHtml(data.viewer.goal)}</strong>
            </div>
            <div class="demo-stat">
              <span>Level</span>
              <strong>${escapeHtml(data.viewer.level)}</strong>
            </div>
          </div>
          <div class="demo-list">
            <div><span>Preferred time</span><strong>${escapeHtml(data.viewer.preferredTime)}</strong></div>
            <div><span>Primary gym</span><strong>${escapeHtml(data.viewer.gym)}</strong></div>
          </div>
        </article>
        <button class="demo-action demo-action-primary" data-action="start-demo">Start Demo</button>
      </section>
    `;
  }

  function renderDiscovery() {
    const activeProfile = data.profiles[state.profileIndex];
    const nextProfile = data.profiles[state.profileIndex + 1];

    return `
      <section class="demo-screen">
        <div class="demo-screen-header">
          <span class="demo-mini-label">Discover</span>
          <h2>Find people near you</h2>
          <p>Profiles are ranked around local fit, shared goals, gym overlap, and accountability style.</p>
        </div>
        <div class="demo-deck">
          ${
            nextProfile
              ? `<div class="demo-profile-card demo-profile-card-back">
                  <div class="demo-profile-photo" style="background:${escapeHtml(nextProfile.gradient)}">
                    <span>${escapeHtml(nextProfile.initials)}</span>
                  </div>
                </div>`
              : ''
          }
          <article class="demo-profile-card">
            <div class="demo-profile-photo" style="background:${escapeHtml(activeProfile.gradient)}">
              <span>${escapeHtml(activeProfile.initials)}</span>
              <div class="demo-score-pill">${escapeHtml(activeProfile.score)}% match</div>
            </div>
            <div class="demo-profile-body">
              <div class="demo-profile-topline">
                <div>
                  <h3>${escapeHtml(activeProfile.name)}</h3>
                  <p>${escapeHtml(activeProfile.city)}</p>
                </div>
                ${activeProfile.availableNow ? '<span class="demo-live-pill">Available now</span>' : ''}
              </div>
              <div class="demo-profile-grid">
                <div><span>Goal</span><strong>${escapeHtml(activeProfile.goal)}</strong></div>
                <div><span>Age</span><strong>${escapeHtml(activeProfile.age)}</strong></div>
                <div><span>Gym</span><strong>${escapeHtml(activeProfile.gym)}</strong></div>
              </div>
              <p class="demo-profile-note">${escapeHtml(activeProfile.note)}</p>
            </div>
          </article>
        </div>
        <div class="demo-action-row">
          <button class="demo-action demo-action-ghost" data-action="pass-profile">Pass</button>
          <button class="demo-action demo-action-primary" data-action="connect-profile">Connect</button>
        </div>
      </section>
    `;
  }

  function renderMatch() {
    const match = state.matchedProfile;
    return `
      <section class="demo-screen">
        <div class="demo-screen-header">
          <span class="demo-mini-label">Match</span>
          <h2>You matched with ${escapeHtml(match.name)}</h2>
          <p>C5 turns compatibility into a clear next step instead of leaving people in random conversations.</p>
        </div>
        <article class="demo-panel">
          <div class="demo-match-lockup">
            <div class="demo-avatar demo-avatar-primary">${escapeHtml(data.viewer.name.slice(0, 1))}</div>
            <span class="demo-match-link"></span>
            <div class="demo-avatar" style="background:${escapeHtml(match.gradient)}">${escapeHtml(match.initials)}</div>
          </div>
          <div class="demo-match-score">${escapeHtml(match.score)}% compatibility</div>
          <div class="demo-reason-list">
            ${data.matchReasons.map((reason) => `<div class="demo-reason-row">${escapeHtml(reason)}</div>`).join('')}
          </div>
        </article>
        <button class="demo-action demo-action-primary" data-action="open-chat">Open Chat</button>
      </section>
    `;
  }

  function renderMessages() {
    const match = state.matchedProfile;
    return `
      <section class="demo-screen">
        <div class="demo-chat-header">
          <button class="demo-back-chip" data-action="back-to-match">Back</button>
          <div class="demo-chat-lockup">
            <div class="demo-avatar" style="background:${escapeHtml(match.gradient)}">${escapeHtml(match.initials)}</div>
            <div>
              <strong>${escapeHtml(match.name)}</strong>
              <span>Active conversation</span>
            </div>
          </div>
        </div>
        <div class="demo-chat-thread">
          ${state.messages
            .map(
              (message) => `
                <div class="demo-bubble-row ${message.from === 'me' ? 'is-me' : ''}">
                  <div class="demo-bubble ${message.from === 'me' ? 'is-me' : ''}">${escapeHtml(message.text)}</div>
                </div>
              `
            )
            .join('')}
        </div>
        <div class="demo-reply-bar">
          ${data.quickReplies
            .map(
              (reply) => `
                <button class="demo-reply-chip" data-action="quick-reply" data-reply="${escapeHtml(reply)}" ${state.replyLocked ? 'disabled' : ''}>${escapeHtml(reply)}</button>
              `
            )
            .join('')}
        </div>
        <button class="demo-action demo-action-primary" data-action="view-progress">View Progress</button>
      </section>
    `;
  }

  function renderProgress() {
    const maxValue = Math.max(...data.progress.chart.map((item) => item.value), 1);
    return `
      <section class="demo-screen">
        <div class="demo-screen-header">
          <span class="demo-mini-label">Momentum</span>
          <h2>Track consistency, not just workouts</h2>
          <p>C5 keeps the next good decision visible with routines, check-ins, and simple weekly progress.</p>
        </div>
        <article class="demo-panel">
          <div class="demo-stat-row">
            <div class="demo-stat">
              <span>This week</span>
              <strong>${escapeHtml(data.progress.weekPoints)} pts</strong>
            </div>
            <div class="demo-stat">
              <span>Level</span>
              <strong>${escapeHtml(data.progress.level)}</strong>
            </div>
          </div>
          <div class="demo-summary-row">
            <span>${escapeHtml(data.progress.daysLogged)}/7 days logged</span>
            <strong>Next: ${escapeHtml(data.progress.nextLevel)}</strong>
          </div>
          <div class="demo-chart">
            ${data.progress.chart
              .map(
                (item) => `
                  <div class="demo-chart-col">
                    <div class="demo-chart-track">
                      <span style="height:${item.value === 0 ? 16 : Math.max(20, (item.value / maxValue) * 92)}px"></span>
                    </div>
                    <label>${escapeHtml(item.day)}</label>
                  </div>
                `
              )
              .join('')}
          </div>
          <div class="demo-task-list">
            ${data.progress.tasks.map((task) => `<div class="demo-task">${escapeHtml(task)}</div>`).join('')}
          </div>
        </article>
        <div class="demo-action-row">
          <a class="demo-action demo-action-ghost demo-link-action" href="./index.html#launch-alerts">Join Launch Alerts</a>
          <a class="demo-action demo-action-primary demo-link-action" href="./contact.html">Contact C5 Team</a>
        </div>
      </section>
    `;
  }

  function render() {
    const currentIndex = steps.indexOf(state.step);
    stepCount.textContent = `Step ${currentIndex + 1} of ${steps.length}`;
    progressBar.style.width = `${((currentIndex + 1) / steps.length) * 100}%`;

    const markup =
      state.step === 'intro'
        ? renderIntro()
        : state.step === 'discovery'
          ? renderDiscovery()
          : state.step === 'match'
            ? renderMatch()
            : state.step === 'messages'
              ? renderMessages()
              : renderProgress();

    animateRender(markup);
  }

  function handlePassProfile() {
    state.profileIndex = (state.profileIndex + 1) % data.profiles.length;
    render();
  }

  function handleConnectProfile() {
    state.matchedProfile = data.profiles[state.profileIndex];
    setStep('match');
  }

  function handleQuickReply(reply) {
    if (state.replyLocked) return;
    state.replyLocked = true;
    state.messages.push({ from: 'me', text: reply });
    render();

    window.setTimeout(() => {
      state.messages.push({
        from: 'them',
        text: 'Sounds good. Let\'s lock it in and keep the streak going.',
      });
      state.replyLocked = false;
      render();
    }, 700);
  }

  function bindEvents() {
    app.querySelectorAll('[data-action]').forEach((element) => {
      element.addEventListener('click', () => {
        const action = element.dataset.action;
        if (action === 'start-demo') setStep('discovery');
        if (action === 'pass-profile') handlePassProfile();
        if (action === 'connect-profile') handleConnectProfile();
        if (action === 'open-chat') setStep('messages');
        if (action === 'back-to-match') setStep('match');
        if (action === 'view-progress') setStep('progress');
        if (action === 'quick-reply') handleQuickReply(element.dataset.reply || '');
      });
    });
  }

  render();
})();
