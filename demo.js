(function () {
  const data = window.C5DemoData;
  if (!data) return;

  const app = document.getElementById('demoApp');
  const progressBar = document.getElementById('demoProgressBar');
  const stepCount = document.getElementById('demoStepCount');
  if (!app || !progressBar || !stepCount) return;

  const steps = ['intro', 'gyms', 'discovery', 'match', 'messages', 'progress'];
  const state = {
    step: 'intro',
    viewer: (data.viewerProfiles && data.viewerProfiles.length
      ? data.viewerProfiles[Math.floor(Math.random() * data.viewerProfiles.length)]
      : data.viewer) || {
      name: 'C5 User',
      goal: 'Get consistent',
      level: 'Beginner',
      preferredTime: 'Mornings',
      gym: 'Crunch - Tampa',
      city: 'Tampa, FL',
    },
    profileIndex: 0,
    matchedProfile: null,
    messages: [...data.starterMessages],
    replyLocked: false,
  };

  const activeGyms = state.viewer.gyms && state.viewer.gyms.length ? state.viewer.gyms : data.gyms || [];
  const activeProfiles = state.viewer.profiles && state.viewer.profiles.length ? state.viewer.profiles : data.profiles || [];
  const activeMatchReasons =
    state.viewer.matchReasons && state.viewer.matchReasons.length ? state.viewer.matchReasons : data.matchReasons || [];

  state.profileIndex = 0;
  state.matchedProfile = activeProfiles[0] || null;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCountryFromLocation(location) {
    const parts = String(location || '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    return parts.length ? parts[parts.length - 1] : '';
  }

  function getLocationScopedProfiles() {
    const sameCityProfiles = activeProfiles.filter((profile) => profile.city === state.viewer.city);
    if (sameCityProfiles.length) return sameCityProfiles;

    const viewerCountry = getCountryFromLocation(state.viewer.city);
    const sameCountryProfiles = activeProfiles.filter(
      (profile) => getCountryFromLocation(profile.city) === viewerCountry
    );

    return sameCountryProfiles.length ? sameCountryProfiles : activeProfiles;
  }

  const scopedProfiles = getLocationScopedProfiles();
  state.matchedProfile = scopedProfiles[0] || state.matchedProfile;

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
              <strong>${escapeHtml(state.viewer.name)}</strong>
              <span>${escapeHtml(state.viewer.city)}</span>
            </div>
          </div>
          <div class="demo-stat-row">
            <div class="demo-stat">
              <span>Goal</span>
              <strong>${escapeHtml(state.viewer.goal)}</strong>
            </div>
            <div class="demo-stat">
              <span>Level</span>
              <strong>${escapeHtml(state.viewer.level)}</strong>
            </div>
          </div>
          <div class="demo-list">
            <div><span>Preferred time</span><strong>${escapeHtml(state.viewer.preferredTime)}</strong></div>
            <div><span>Primary gym</span><strong>${escapeHtml(state.viewer.gym)}</strong></div>
          </div>
        </article>
        <button class="demo-action demo-action-primary" data-action="start-demo">Start Demo</button>
      </section>
    `;
  }

  function renderGyms() {
    const featuredGym = activeGyms[0];
    if (!featuredGym) return '';
    return `
      <section class="demo-screen">
        <div class="demo-screen-header">
          <span class="demo-mini-label">Gyms</span>
          <h2>Find the nearest gyms first</h2>
          <p>C5 can help users start from location, not guesswork, by surfacing nearby gyms before matching.</p>
        </div>
        <article class="demo-panel demo-map-panel">
          <div class="demo-map-stage" style="background:${escapeHtml(featuredGym.accent)}">
            <svg class="demo-map-svg" viewBox="0 0 420 240" aria-hidden="true" focusable="false">
              <rect class="demo-map-water" x="0" y="0" width="420" height="240" rx="22"></rect>
              <g class="demo-map-blocks">
                <rect x="26" y="26" width="78" height="42" rx="10"></rect>
                <rect x="128" y="24" width="98" height="52" rx="12"></rect>
                <rect x="256" y="28" width="126" height="46" rx="12"></rect>
                <rect x="48" y="104" width="114" height="54" rx="12"></rect>
                <rect x="190" y="96" width="84" height="62" rx="12"></rect>
                <rect x="296" y="104" width="88" height="52" rx="12"></rect>
                <rect x="28" y="178" width="92" height="34" rx="10"></rect>
                <rect x="148" y="174" width="120" height="38" rx="12"></rect>
                <rect x="292" y="174" width="94" height="34" rx="10"></rect>
              </g>
              <g class="demo-map-roads">
                <path d="M-10 78 C46 70, 88 88, 148 82 S250 60, 326 76 S390 98, 438 88"></path>
                <path d="M-20 152 C50 136, 118 166, 184 150 S306 118, 438 144"></path>
                <path d="M96 -10 C108 36, 86 92, 108 148 S160 226, 148 260"></path>
                <path d="M246 -8 C234 42, 260 88, 242 138 S214 202, 226 258"></path>
                <path d="M332 -6 C348 54, 316 110, 336 166 S374 220, 362 262"></path>
              </g>
              <path class="demo-map-route" d="M108 142 C138 132, 176 128, 214 110 S286 74, 328 86"></path>
              <g class="demo-map-labels">
                <text x="40" y="93">${escapeHtml(state.viewer.city)}</text>
                <text x="284" y="162">Nearest gyms</text>
              </g>
            </svg>
            <div class="demo-map-grid"></div>
            <div class="demo-map-pin demo-map-pin-primary">
              <label>You</label>
            </div>
            <div class="demo-map-pin demo-map-pin-gym demo-pin-a">
              <label>${escapeHtml(activeGyms[0].name)}</label>
            </div>
            <div class="demo-map-pin demo-map-pin-gym demo-pin-b">
              <label>${escapeHtml((activeGyms[1] || activeGyms[0]).name)}</label>
            </div>
            <div class="demo-map-pin demo-map-pin-gym demo-pin-c">
              <label>${escapeHtml((activeGyms[2] || activeGyms[0]).name)}</label>
            </div>
          </div>
          <div class="demo-gym-list">
            ${activeGyms
              .map(
                (gym, index) => `
                  <article class="demo-gym-card ${index === 0 ? 'is-featured' : ''}">
                    <div class="demo-gym-topline">
                      <div>
                        <h3>${escapeHtml(gym.name)}</h3>
                        <p>${escapeHtml(gym.vibe)}</p>
                      </div>
                      <span class="demo-gym-distance">${escapeHtml(gym.distance)}</span>
                    </div>
                    <div class="demo-gym-features">
                      ${gym.features.map((feature) => `<span>${escapeHtml(feature)}</span>`).join('')}
                    </div>
                  </article>
                `
              )
              .join('')}
          </div>
        </article>
        <button class="demo-action demo-action-primary" data-action="see-people">See Nearby People</button>
      </section>
    `;
  }

  function renderDiscovery() {
    const activeProfile = scopedProfiles[state.profileIndex];
    const nextProfile = scopedProfiles[state.profileIndex + 1];
    if (!activeProfile) return '';

    return `
      <section class="demo-screen">
        <div class="demo-screen-header">
          <span class="demo-mini-label">Discover</span>
          <h2>Find people near you in ${escapeHtml(state.viewer.city)}</h2>
          <p>Profiles are ranked around local fit, shared goals, gym overlap, and accountability style in your area.</p>
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
    if (!match) return '';
    return `
      <section class="demo-screen">
        <div class="demo-screen-header">
          <span class="demo-mini-label">Match</span>
          <h2>You matched with ${escapeHtml(match.name)}</h2>
          <p>C5 turns compatibility into a clear next step instead of leaving people in random conversations.</p>
        </div>
        <article class="demo-panel">
          <div class="demo-match-lockup">
            <div class="demo-avatar demo-avatar-primary">${escapeHtml(state.viewer.name.slice(0, 1))}</div>
            <span class="demo-match-link"></span>
            <div class="demo-avatar" style="background:${escapeHtml(match.gradient)}">${escapeHtml(match.initials)}</div>
          </div>
          <div class="demo-match-score">${escapeHtml(match.score)}% compatibility</div>
          <div class="demo-reason-list">
            ${activeMatchReasons.map((reason) => `<div class="demo-reason-row">${escapeHtml(reason)}</div>`).join('')}
          </div>
        </article>
        <button class="demo-action demo-action-primary" data-action="open-chat">Open Chat</button>
      </section>
    `;
  }

  function renderMessages() {
    const match = state.matchedProfile;
    if (!match) return '';
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
        : state.step === 'gyms'
          ? renderGyms()
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
    state.profileIndex = (state.profileIndex + 1) % scopedProfiles.length;
    render();
  }

  function handleConnectProfile() {
    state.matchedProfile = scopedProfiles[state.profileIndex];
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
        if (action === 'start-demo') setStep('gyms');
        if (action === 'see-people') setStep('discovery');
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
