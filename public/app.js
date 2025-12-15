if (!window.crypto.randomUUID) {
  window.crypto.randomUUID = function () {
    // Polyfill: generates a v4 UUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

const STORAGE_KEY = 'pryma.poll.responses';
const POW_DIFFICULTY = '0000';

const cards = [
  {
    id: 'card1',
    title: 'Trust: Where does it start?',
    description: 'Every system has to decide what it trusts first.',
    questions: [
      {
        type: 'single',
        name: 'trustPrimitive',
        prompt: 'What should PRYMA trust as its starting point?\nExample: should it trust a real person, a device, or a secret code first?',
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
        prompt: 'Why did you pick that? (optional)',
        placeholder: 'Example: “People can be held responsible” or “Keys are harder to fake.”'
      }
    ]
  },

  {
    id: 'card2',
    title: 'Power: What must never be taken over?',
    description: 'In some systems, power slowly ends up in the hands of a few people. Where should that never happen?',
    questions: [
      {
        type: 'multi',
        name: 'powerForbidden',
        prompt: 'Select all areas where no one should be able to take over control.\nExample: no single group should become the permanent boss.',
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
        prompt: 'If you could protect only ONE area from takeover, which would it be?',
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
    title: 'Privacy: What information is okay to leak?',
    description: 'No system is perfect. This asks what info could leak while the system still feels okay to use.',
    questions: [
      {
        type: 'multi',
        name: 'acceptableLeakage',
        prompt: 'Which information, if any, would be acceptable to leak?\nExample: someone knows you sent a message, but not what it said.',
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
    title: 'Security: How should safety work?',
    description: 'Different systems stay safe in different ways.',
    questions: [
      {
        type: 'single',
        name: 'securityApproach',
        prompt: 'Which safety approach should PRYMA use most?',
        options: [
          'Make attacks costly (example: puzzles or limits that slow attackers down)',
          'Expect attacks and limit damage (example: assume something breaks and contain it)',
          'Use both depending on the situation'
        ]
      }
    ]
  },

  {
    id: 'card5',
    title: 'Software agents: What should they be allowed to do?',
    description: 'Software agents are programs that can act for people. This asks how much freedom they should have.',
    questions: [
      {
        type: 'matrix',
        name: 'agentCapabilities',
        prompt: 'For each action, choose what agents should be allowed to do.\nExample: can a bot spend money or vote for you?',
        rows: [
          'Hold and move assets (spend money / move tokens)',
          'Vote on rule changes (vote like a person)',
          'Create other agents (bots making bots)',
          'Act without a human watching (do things while you’re offline)',
          'Act legally or financially for a human (sign contracts, take loans)'
        ],
        columns: ['Allowed', 'Allowed with rules', 'Not allowed']
      }
    ]
  },

  {
    id: 'card6',
    title: 'Rules: What should be changeable?',
    description: 'Some rules should be flexible. Others should be very hard or impossible to change.',
    questions: [
      {
        type: 'matrix',
        name: 'governanceLimits',
        prompt: 'How changeable should these rules be?\nExample: like school rules—some can change, but others shouldn’t.',
        rows: [
          'Fees (cost to use the system)',
          'Validator rules (how referees are chosen)',
          'Proof requirements (how you prove you’re real)',
          'Surveillance limits (rules about tracking or spying)',
          'Emergency powers (what happens during attacks)'
        ],
        columns: ['Easy to change', 'Hard to change (needs broad agreement)', 'Should never change']
      }
    ]
  },

  {
    id: 'card7',
    title: 'Risks: What worries you most?',
    description: 'No system fails in just one way. This asks which risk matters most to you.',
    questions: [
      {
        type: 'single',
        name: 'worstThreat',
        prompt: 'Which outcome worries you the most?',
        options: [
          'Government pressure or control (a government forces people to comply)',
          'Hidden hardware backdoors (hardware secretly hacked at the factory)',
          'Takeover by the very rich or powerful (elite capture)',
          'Quiet mass surveillance (everyone gets tracked quietly)',
          'Slow drift into centralization (slowly becomes one company’s system)'
        ]
      }
    ]
  },

  {
    id: 'card8',
    title: 'People: Who should this help first?',
    description: 'Different groups have different needs. This asks who PRYMA should prioritize.',
    questions: [
      {
        type: 'single',
        name: 'adoptionTarget',
        prompt: 'Who should PRYMA be built for first?',
        options: [
          'People who strongly care about privacy',
          'Developers building applications',
          'NGOs and journalists protecting sources',
          'Critical infrastructure (hospitals, utilities, defense)',
          'Everyday people'
        ]
      }
    ]
  },

  {
    id: 'card9',
    title: 'Money: How should profit work?',
    description: 'Money affects incentives and power.',
    questions: [
      {
        type: 'single',
        name: 'profitRole',
        prompt: 'How important should making profit be?\nExample: company-first vs public-good-first.',
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
        prompt: 'Should the system stop anyone from hoarding extreme wealth or power?\nExample: no one can own almost everything.',
        options: ['Yes', 'No', 'Not sure']
      }
    ]
  },

  {
    id: 'card10',
    title: 'Future: How should change be handled?',
    description: 'The future is unpredictable.',
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
          <p class="eyebrow">Question ${index + 1}</p>
          <h2>${card.title}</h2>
        </div>
        <span class="muted">${card.description}</span>
      </header>
    `;

    card.questions.forEach((question) => {
      const field = document.createElement('div');
      field.className = 'field';
      const label = document.createElement('label');
      const [promptText, helperText] = question.prompt.split('\nExample:');
      const strong = document.createElement('strong');
      strong.textContent = promptText;
      label.appendChild(strong);
      if (helperText !== undefined) {
        const helper = document.createElement('small');
        helper.className = 'helper';
        helper.textContent = `Example:${helperText}`.trim();
        label.appendChild(document.createElement('br'));
        label.appendChild(helper);
      }
      field.appendChild(label);

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
