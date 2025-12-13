const cards = [
  {
    id: 'card1',
    title: 'The Root — Trust Primitive',
    description: 'What should be the irreducible unit of trust in PRYMA?',
    questions: [
      {
        type: 'single',
        name: 'trustPrimitive',
        prompt: 'What should be the irreducible unit of trust in PRYMA?',
        options: [
          'A living human',
          'A cryptographic capability',
          'A sovereign device',
          'A verifiable software agent',
          'A constitutional rule',
          'Unsure / depends'
        ]
      },
      {
        type: 'text',
        name: 'rootRationale',
        prompt: 'Why did you choose this?',
        placeholder: 'Optional context'
      }
    ]
  },
  {
    id: 'card2',
    title: 'The Flame — Power Accumulation',
    description: 'Where should power be forbidden from accumulating?',
    questions: [
      {
        type: 'multi',
        name: 'powerForbidden',
        prompt: 'Where should power be forbidden from accumulating?',
        options: [
          'Governance',
          'Validation',
          'Routing / networking',
          'Data visibility',
          'Economic control',
          'Agent orchestration'
        ]
      },
      {
        type: 'single',
        name: 'powerNeverCapturable',
        prompt: 'If one thing must never be capturable, what is it?',
        options: [
          'Governance',
          'Validation',
          'Routing / networking',
          'Data visibility',
          'Economic control',
          'Agent orchestration'
        ]
      }
    ]
  },
  {
    id: 'card3',
    title: 'The Veil — Privacy Baseline',
    description: 'What information is acceptable to leak if the system still succeeds?',
    questions: [
      {
        type: 'multi',
        name: 'acceptableLeakage',
        prompt: 'What information is acceptable to leak?',
        options: [
          'Traffic volume',
          'Timing metadata',
          'Public actions (votes, proposals)',
          'Device type',
          'Nothing beyond what the user explicitly reveals'
        ]
      }
    ]
  },
  {
    id: 'card4',
    title: 'The Blade — Security Philosophy',
    description: 'Which approach should PRYMA prioritize?',
    questions: [
      {
        type: 'single',
        name: 'securityApproach',
        prompt: 'Which approach should PRYMA prioritize?',
        options: [
          'Deterrence (make attacks expensive/punishable)',
          'Survivability (assume attacks, bound damage)',
          'Balanced / context-dependent'
        ]
      }
    ]
  },
  {
    id: 'card5',
    title: 'The Mirror — Agents',
    description: 'Which capabilities should autonomous agents have?',
    questions: [
      {
        type: 'matrix',
        name: 'agentCapabilities',
        prompt: 'Select how each agent capability should be treated.',
        rows: [
          'Hold assets',
          'Vote in governance',
          'Spawn other agents',
          'Act without live human approval',
          'Represent humans legally/economically'
        ],
        columns: ['Allowed', 'Restricted', 'Forbidden']
      }
    ]
  },
  {
    id: 'card6',
    title: 'The Ledger — Governance Limits',
    description: 'Which of the following should governance be allowed to change?',
    questions: [
      {
        type: 'matrix',
        name: 'governanceLimits',
        prompt: 'Mark how changeable each item should be.',
        rows: [
          'Fees',
          'Validator rules',
          'Proof requirements (human/agent/device)',
          'Surveillance constraints',
          'Emergency powers'
        ],
        columns: ['Allowed', 'Supermajority Only', 'Never']
      }
    ]
  },
  {
    id: 'card7',
    title: 'The Tower — Worst-Case Threat',
    description: 'What is the most dangerous failure mode to design against?',
    questions: [
      {
        type: 'single',
        name: 'worstThreat',
        prompt: 'Most dangerous failure mode?',
        options: [
          'Nation-state coercion',
          'Hardware/OEM backdoors',
          'Billionaire capture',
          'Silent mass surveillance',
          'Benevolent centralization drift'
        ]
      }
    ]
  },
  {
    id: 'card8',
    title: 'The Gate — Adoption Target',
    description: 'Who should PRYMA be designed for first?',
    questions: [
      {
        type: 'single',
        name: 'adoptionTarget',
        prompt: 'Who should PRYMA be designed for first?',
        options: [
          'Privacy maximalists',
          'Developers',
          'NGOs / journalists',
          'Critical infrastructure / military',
          'Everyday users'
        ]
      }
    ]
  },
  {
    id: 'card9',
    title: 'The Sun — Economics',
    description: 'What role should profit play?',
    questions: [
      {
        type: 'single',
        name: 'profitRole',
        prompt: 'What role should profit play?',
        options: [
          'Primary incentive',
          'Secondary incentive',
          'Shared commons',
          'Capped by protocol rules'
        ]
      },
      {
        type: 'single',
        name: 'wealthCap',
        prompt: 'Should any class of actor be structurally prevented from extreme wealth accumulation?',
        options: ['Yes', 'No', 'Unsure']
      }
    ]
  },
  {
    id: 'card10',
    title: 'The Star — Time Horizon',
    description: 'How should PRYMA treat future uncertainty?',
    questions: [
      {
        type: 'single',
        name: 'timeHorizon',
        prompt: 'How should PRYMA treat future uncertainty?',
        options: [
          'Freeze core values now',
          'Allow values to evolve via governance',
          'Hybrid (constitutional core + adaptive layer)'
        ]
      }
    ]
  }
];

const cardsContainer = document.getElementById('cards');
const form = document.getElementById('poll-form');
const statusEl = document.getElementById('status');
const previewDialog = document.getElementById('preview-dialog');
const previewContent = document.getElementById('preview-content');
const previewBtn = document.getElementById('preview-btn');
const closePreviewBtn = document.getElementById('close-preview');
const saveLocalBtn = document.getElementById('save-local-btn');
const powToggle = document.getElementById('pow-toggle');
const powStatus = document.getElementById('pow-status');
const generatePowBtn = document.getElementById('generate-pow');
const encryptToggle = document.getElementById('encrypt-toggle');
const encryptionPassphrase = document.getElementById('encryption-passphrase');
const localSignToggle = document.getElementById('local-sign-toggle');

const startTime = Date.now();
let powReceipt = null;
let clientSalt = crypto.randomUUID();
generatePowBtn.disabled = true;

const renderCards = () => {
  cards.forEach((card, index) => {
    const section = document.createElement('section');
    section.className = 'card';
    section.innerHTML = `
      <header>
        <div>
          <p class="eyebrow">Card ${index + 1}</p>
          <h2>${card.title}</h2>
        </div>
        <span class="muted">${card.description}</span>
      </header>
    `;

    card.questions.forEach((question) => {
      const field = document.createElement('div');
      field.className = 'field';
      field.innerHTML = `<label><strong>${question.prompt}</strong></label>`;

      if (question.type === 'single') {
        const group = document.createElement('div');
        group.className = 'radio-group';
        question.options.forEach((opt, idx) => {
          const optionId = `${card.id}-${question.name}-${idx}`;
          group.innerHTML += `
            <label class="option" for="${optionId}">
              <input type="radio" name="${question.name}" id="${optionId}" value="${opt}" aria-label="${opt}" required>
              <span>${opt}</span>
            </label>
          `;
        });
        field.appendChild(group);
      }

      if (question.type === 'multi') {
        const group = document.createElement('div');
        group.className = 'checkbox-group';
        question.options.forEach((opt, idx) => {
          const optionId = `${card.id}-${question.name}-${idx}`;
          group.innerHTML += `
            <label class="option" for="${optionId}">
              <input type="checkbox" name="${question.name}" id="${optionId}" value="${opt}">
              <span>${opt}</span>
            </label>
          `;
        });
        field.appendChild(group);
      }

      if (question.type === 'text') {
        field.innerHTML += `
          <textarea name="${question.name}" rows="3" placeholder="${question.placeholder || ''}"></textarea>
        `;
      }

      if (question.type === 'matrix') {
        const table = document.createElement('table');
        table.className = 'matrix';
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `<th>Capability</th>${question.columns.map((c) => `<th>${c}</th>`).join('')}`;
        table.appendChild(headerRow);
        question.rows.forEach((row) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${row}</td>`;
          question.columns.forEach((column) => {
            const id = `${question.name}-${row}-${column}`;
            tr.innerHTML += `
              <td>
                <label class="option" for="${id}">
                  <input type="radio" name="${question.name}-${row}" id="${id}" value="${column}" required>
                </label>
              </td>
            `;
          });
          table.appendChild(tr);
        });
        field.appendChild(table);
      }

      section.appendChild(field);
    });

    cardsContainer.appendChild(section);
  });
};

const collectAnswers = () => {
  const data = {};

  cards.forEach((card) => {
    card.questions.forEach((question) => {
      if (question.type === 'single') {
        const selected = form.querySelector(`input[name="${question.name}"]:checked`);
        data[question.name] = selected ? selected.value : null;
      }
      if (question.type === 'multi') {
        const selected = Array.from(form.querySelectorAll(`input[name="${question.name}"]:checked`)).map((el) => el.value);
        data[question.name] = selected;
      }
      if (question.type === 'text') {
        const text = form.querySelector(`textarea[name="${question.name}"]`);
        data[question.name] = text?.value?.trim() || null;
      }
      if (question.type === 'matrix') {
        const rows = {};
        question.rows.forEach((row) => {
          const selected = form.querySelector(`input[name="${question.name}-${row}"]:checked`);
          rows[row] = selected ? selected.value : null;
        });
        data[question.name] = rows;
      }
    });
  });

  return data;
};

const downloadBlob = (content, filename) => {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const sha256 = async (input) => {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

const deriveKey = async (passphrase, salt) => {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
};

const encryptPayload = async (payload, passphrase) => {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(payload)));
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(cipherBuffer))),
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt))
  };
};

const powSearch = async (challenge, issuedAt, difficulty = '0000') => {
  let nonce = 0;
  while (nonce < Number.MAX_SAFE_INTEGER) {
    const digest = await sha256(`${challenge}:${nonce}`);
    if (digest.startsWith(difficulty)) {
      return { nonce, digest, issuedAt, challenge };
    }
    nonce++;
  }
  return null;
};

const buildPayload = async () => {
  const answers = collectAnswers();
  const pseudonymKey = form.querySelector('input[name="pseudonymKey"]').value.trim() || null;
  const signedMessage = form.querySelector('textarea[name="signedMessage"]').value.trim() || null;
  const timingMs = Date.now() - startTime;
  const entropy = crypto.getRandomValues(new Uint32Array(4)).join('-');

  const metadata = { pseudonymKey, signedMessage, clientSalt, timingMs, entropy, pow: powReceipt };
  const payload = { answers, metadata };

  if (encryptToggle.checked) {
    const passphrase = encryptionPassphrase.value;
    if (!passphrase) {
      throw new Error('Provide a passphrase or disable encryption.');
    }
    const encryptedPayload = await encryptPayload(payload, passphrase);
    return { encryptedPayload, metadata };
  }

  return payload;
};

const openPreview = async () => {
  const payload = await buildPayload();
  previewContent.textContent = JSON.stringify(payload, null, 2);
  previewDialog.showModal();
};

const saveLocal = async () => {
  const payload = await buildPayload();
  const digest = await sha256(JSON.stringify(payload));
  const bundle = { ...payload, localSignature: digest };
  downloadBlob(JSON.stringify(bundle, null, 2), 'pryma-poll-local.json');
};

const submitForm = async (event) => {
  event.preventDefault();
  statusEl.textContent = 'Submitting…';
  try {
    const payload = await buildPayload();
    const res = await fetch('/api/poll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      throw new Error(`Server rejected submission: ${detail.reason || res.status}`);
    }
    const response = await res.json();
    statusEl.textContent = response.reason === 'duplicate-suspected'
      ? 'We already have a similar response. Thanks for trying to avoid spam.'
      : 'Submitted. Thank you for your input.';
    if (localSignToggle.checked) {
      await saveLocal();
    }
  } catch (err) {
    statusEl.textContent = err.message;
    statusEl.style.color = 'var(--danger)';
  }
};

const updateEncryptionUI = () => {
  encryptionPassphrase.disabled = !encryptToggle.checked;
};

const requestPow = async () => {
  powStatus.textContent = 'Preparing…';
  const challengeRes = await fetch('/api/pow-challenge');
  const { challenge, issuedAt, difficulty } = await challengeRes.json();
  powStatus.textContent = 'Computing proof… this may take a moment.';
  powReceipt = await powSearch(challenge, issuedAt, difficulty);
  if (powReceipt) {
    powStatus.textContent = `Proof ready (nonce ${powReceipt.nonce}, digest ${powReceipt.digest.slice(0, 10)}…)`;
  } else {
    powStatus.textContent = 'Unable to find a proof right now.';
  }
};

renderCards();

previewBtn.addEventListener('click', () => openPreview());
closePreviewBtn.addEventListener('click', () => previewDialog.close());
saveLocalBtn.addEventListener('click', () => saveLocal());
form.addEventListener('submit', submitForm);
encryptToggle.addEventListener('change', updateEncryptionUI);
powToggle.addEventListener('change', () => {
  generatePowBtn.disabled = !powToggle.checked;
  if (!powToggle.checked) {
    powReceipt = null;
    powStatus.textContent = 'No proof generated.';
  }
});
generatePowBtn.addEventListener('click', () => {
  if (powToggle.checked) {
    requestPow();
  }
});
updateEncryptionUI();

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    statusEl.textContent = '';
  }
});
