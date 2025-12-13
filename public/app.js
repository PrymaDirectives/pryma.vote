const STORAGE_KEY = 'pryma.poll.responses';
const POW_DIFFICULTY = '0000';

const cards = [
  {
    id: 'card1',
    title: 'The Root — Where trust begins',
    description: 'What should PRYMA trust first, before anything else?',
    questions: [
      {
        type: 'single',
        name: 'trustPrimitive',
        prompt: 'What should PRYMA treat as its starting point for trust?',
        options: [
          'A real human',
          'A secret key or cryptographic proof',
          'A device you personally control',
          'A verified software agent',
          'A clear rule written into the system',
          'Not sure / it depends'
        ]
      },
      {
        type: 'text',
        name: 'rootRationale',
        prompt: 'Why did you pick that?',
        placeholder: 'Optional context'
      }
    ]
  },

  {
    id: 'card2',
    title: 'The Flame — Stopping power from piling up',
    description: 'Where should PRYMA strictly prevent power from concentrating?',
    questions: [
      {
        type: 'multi',
        name: 'powerForbidden',
        prompt: 'Select all areas where no one should be able to hoard power:',
        options: [
          'Governance',
          'Validation',
          'Networking / routing',
          'Data visibility',
          'Economic control',
          'Agent control'
        ]
      },
      {
        type: 'single',
        name: 'powerNeverCapturable',
        prompt: 'If only one area could never be captured, which would it be?',
        options: [
          'Governance',
          'Validation',
          'Networking / routing',
          'Data visibility',
          'Economic control',
          'Agent control'
        ]
      }
    ]
  },

  {
    id: 'card3',
    title: 'The Veil — Privacy basics',
    description: 'What information could leak while PRYMA still succeeds?',
    questions: [
      {
        type: 'multi',
        name: 'acceptableLeakage',
        prompt: 'Which kinds of information would be acceptable to leak?',
        options: [
          'Traffic volume',
          'Timing metadata',
          'Public actions (votes, proposals)',
          'Device type',
          'Nothing beyond what users choose to reveal'
        ]
      }
    ]
  },

  {
    id: 'card4',
    title: 'The Blade — Security style',
    description: 'What kind of safety mindset should PRYMA favor?',
    questions: [
      {
        type: 'single',
        name: 'securityApproach',
        prompt: 'Which approach should PRYMA lean on most?',
        options: [
          'Deterrence — make attacks costly',
          'Survivability — expect attacks and limit damage',
          'Balanced — choose based on the situation'
        ]
      }
    ]
  },

  {
    id: 'card5',
    title: 'The Mirror — What agents can do',
    description: 'How much autonomy should software agents have?',
    questions: [
      {
        type: 'matrix',
        name: 'agentCapabilities',
        prompt: 'For each action, say how agents should be treated:',
        rows: [
          'Hold and move assets',
          'Vote in governance decisions',
          'Create other agents',
          'Act without a human approving live',
          'Stand in for humans legally or financially'
        ],
        columns: ['Allowed', 'Restricted', 'Forbidden']
      }
    ]
  },

  {
    id: 'card6',
    title: 'The Ledger — What rules can change',
    description: 'How flexible should PRYMA’s rules be?',
    questions: [
      {
        type: 'matrix',
        name: 'governanceLimits',
        prompt: 'For each topic, how changeable should it be?',
        rows: [
          'Fees',
          'Validator rules',
          'Proof requirements (human / agent / device)',
          'Surveillance limits',
          'Emergency powers'
        ],
        columns: ['Changeable', 'Supermajority only', 'Never change']
      }
    ]
  },

  {
    id: 'card7',
    title: 'The Tower — Biggest threat',
    description: 'What outcome should PRYMA defend against most?',
    questions: [
      {
        type: 'single',
        name: 'worstThreat',
        prompt: 'Which danger worries you the most?',
        options: [
          'Nation-state coercion',
          'Hardware or supply-chain backdoors',
          'Billionaire or elite capture',
          'Silent mass surveillance',
          'Slow drift into benevolent centralization'
        ]
      }
    ]
  },

  {
    id: 'card8',
    title: 'The Gate — Who this is for first',
    description: 'Who should PRYMA focus on helping before anyone else?',
    questions: [
      {
        type: 'single',
        name: 'adoptionTarget',
        prompt: 'Who should PRYMA be built for first?',
        options: [
          'Privacy-focused users',
          'Developers',
          'NGOs and journalists',
          'Critical infrastructure / defense',
          'Everyday people'
        ]
      }
    ]
  },

  {
    id: 'card9',
    title: 'The Sun — Money and incentives',
    description: 'How should profit fit into PRYMA?',
    questions: [
      {
        type: 'single',
        name: 'profitRole',
        prompt: 'How important should profit be?',
        options: [
          'Main driver',
          'Useful but secondary',
          'Commons-first, profit optional',
          'Allowed but capped by rules'
        ]
      },
      {
        type: 'single',
        name: 'wealthCap',
        prompt: 'Should any type of participant be blocked from extreme wealth hoarding?',
        options: ['Yes', 'No', 'Not sure']
      }
    ]
  },

  {
    id: 'card10',
    title: 'The Star — Handling the future',
    description: 'How should PRYMA deal with long-term uncertainty?',
    questions: [
      {
        type: 'single',
        name: 'timeHorizon',
        prompt: 'How should PRYMA handle unknown future changes?',
        options: [
          'Lock core values permanently',
          'Let values evolve through governance',
          'Mix — firm core, flexible outer layer'
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

const powSearch = async (challenge, issuedAt, difficulty = POW_DIFFICULTY) => {
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

const loadStoredSubmissions = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Could not read stored submissions', err);
    return [];
  }
};

const persistStoredSubmissions = (records) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records, null, 2));
};

const dedupeSignature = async (payload) => {
  const safeAnswers = payload.answers || {};
  const sortedAnswers = JSON.stringify(safeAnswers, Object.keys(safeAnswers).sort());
  const salt = payload.metadata?.clientSalt || clientSalt;
  return sha256(`${sortedAnswers}:${salt}`);
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

const storeSubmission = async (payload) => {
  const duplicateHint = await dedupeSignature(payload);
  const record = {
    storedAt: new Date().toISOString(),
    metadata: {
      clientSalt: payload.metadata?.clientSalt || null,
      pseudonymKey: payload.metadata?.pseudonymKey || null,
      signedMessage: payload.metadata?.signedMessage || null,
      powUsed: Boolean(payload.metadata?.pow),
      encryption: payload.encryptedPayload ? { salt: payload.encryptedPayload.salt, iv: payload.encryptedPayload.iv } : null,
      duplicateHint,
      timingMs: payload.metadata?.timingMs || null,
      entropy: payload.metadata?.entropy || null
    },
    answers: payload.encryptedPayload ? null : payload.answers,
    encryptedPayload: payload.encryptedPayload || null
  };

  const existing = loadStoredSubmissions();
  const already = existing.find((entry) => entry.metadata?.duplicateHint === duplicateHint);
  if (already) {
    return { duplicate: true };
  }

  persistStoredSubmissions([...existing, record]);
  return { duplicate: false };
};

const submitForm = async (event) => {
  event.preventDefault();
  statusEl.style.color = '';
  statusEl.textContent = 'Saving locally…';
  try {
    const payload = await buildPayload();
    const { duplicate } = await storeSubmission(payload);
    statusEl.textContent = duplicate
      ? 'We already have a similar response saved in this browser.'
      : 'Saved locally. You can export or copy this data.';
    if (!duplicate && localSignToggle.checked) {
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
  const challenge = crypto.randomUUID().replace(/-/g, '');
  const issuedAt = Date.now();
  powStatus.textContent = 'Computing proof… this may take a moment.';
  powReceipt = await powSearch(challenge, issuedAt, POW_DIFFICULTY);
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
