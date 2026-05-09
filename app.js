(() => {
  "use strict";

  const DEFAULT_PASSWORD = "admin123";
  const DEFAULT_PASSWORD_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";
  const PASSWORD_KEY = "rkg_admin_password_hash";
  const SESSION_KEY = "rkg_admin_session";
  const SETTINGS_KEY = "rkg_generator_settings";
  const HISTORY_KEY = "rkg_history";

  const BASE_POOLS = {
    letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{};:,.?/|~",
    arrows: "<>^v"
  };

  const DEFAULT_SETTINGS = {
    prefix: "WEB-",
    middle: "",
    suffix: "",
    dayOptions: "1DAY-,5DAY-,7DAY-,10DAY-,30DAY-",
    randomDay: true,
    length: 5,
    quantity: 4,
    custom: "",
    selectedPools: ["letters", "numbers"],
    avoidSimilar: true,
    mustInclude: true,
    uppercase: false
  };

  const SIMILAR_CHARS = new Set(Array.from("0O1Il|`'\""));
  let generatedCodes = [];

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const refs = {};

  document.addEventListener("DOMContentLoaded", () => {
    bindRefs();
    bindEvents();
    loadSettings();
    renderHistory();
    updateStats();
    setLoggedIn(localStorage.getItem(SESSION_KEY) === "open");
  });

  function bindRefs() {
    refs.loginView = $("#loginView");
    refs.adminView = $("#adminView");
    refs.sessionState = $("#sessionState");
    refs.loginForm = $("#loginForm");
    refs.loginMessage = $("#loginMessage");
    refs.adminPassword = $("#adminPassword");
    refs.generatorForm = $("#generatorForm");
    refs.generatorMessage = $("#generatorMessage");
    refs.prefixInput = $("#prefixInput");
    refs.middleInput = $("#middleInput");
    refs.suffixInput = $("#suffixInput");
    refs.dayOptionsInput = $("#dayOptionsInput");
    refs.randomDayInput = $("#randomDayInput");
    refs.lengthInput = $("#lengthInput");
    refs.quantityInput = $("#quantityInput");
    refs.customInput = $("#customInput");
    refs.avoidSimilarInput = $("#avoidSimilarInput");
    refs.mustIncludeInput = $("#mustIncludeInput");
    refs.uppercaseInput = $("#uppercaseInput");
    refs.resultGrid = $("#resultGrid");
    refs.emptyState = $("#emptyState");
    refs.lengthStat = $("#lengthStat");
    refs.batchStat = $("#batchStat");
    refs.poolStat = $("#poolStat");
    refs.copyAllButton = $("#copyAllButton");
    refs.clearButton = $("#clearButton");
    refs.resetButton = $("#resetButton");
    refs.logoutButton = $("#logoutButton");
    refs.generateSideButton = $("#generateSideButton");
    refs.historyList = $("#historyList");
    refs.clearHistoryButton = $("#clearHistoryButton");
    refs.passwordForm = $("#passwordForm");
    refs.currentPasswordInput = $("#currentPasswordInput");
    refs.newPasswordInput = $("#newPasswordInput");
    refs.passwordMessage = $("#passwordMessage");
  }

  function bindEvents() {
    refs.loginForm.addEventListener("submit", handleLogin);
    refs.generatorForm.addEventListener("submit", handleGenerate);
    refs.generatorForm.addEventListener("input", () => {
      saveSettings();
      updateStats();
    });

    $$(".preset-button").forEach((button) => {
      button.addEventListener("click", () => {
        refs.lengthInput.value = button.dataset.length;
        setActivePreset(Number(button.dataset.length));
        saveSettings();
        updateStats();
      });
    });

    $$(".day-preset-button").forEach((button) => {
      button.addEventListener("click", () => {
        refs.middleInput.value = button.dataset.day;
        refs.randomDayInput.checked = false;
        saveSettings();
        updateStats();
      });
    });

    refs.resultGrid.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      await copyText(button.dataset.copy);
      flashMessage(refs.generatorMessage, "Copied.", true);
    });

    refs.copyAllButton.addEventListener("click", async () => {
      if (!generatedCodes.length) {
        flashMessage(refs.generatorMessage, "There are no codes to copy.");
        return;
      }
      await copyText(generatedCodes.join("\n"));
      flashMessage(refs.generatorMessage, "All codes copied.", true);
    });

    refs.clearButton.addEventListener("click", () => {
      generatedCodes = [];
      renderResults([]);
      flashMessage(refs.generatorMessage, "Results cleared.", true);
    });

    refs.resetButton.addEventListener("click", () => {
      applySettings(DEFAULT_SETTINGS);
      saveSettings();
      updateStats();
      flashMessage(refs.generatorMessage, "Settings reset.", true);
    });

    refs.logoutButton.addEventListener("click", () => {
      localStorage.removeItem(SESSION_KEY);
      setLoggedIn(false);
    });

    refs.generateSideButton.addEventListener("click", () => {
      refs.generatorForm.requestSubmit();
    });

    refs.clearHistoryButton.addEventListener("click", () => {
      localStorage.removeItem(HISTORY_KEY);
      renderHistory();
    });

    refs.historyList.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-history-index]");
      if (!button) return;
      const history = readHistory();
      const batch = history[Number(button.dataset.historyIndex)];
      if (!batch) return;
      await copyText(batch.codes.join("\n"));
      flashMessage(refs.generatorMessage, "History batch copied.", true);
    });

    refs.passwordForm.addEventListener("submit", handlePasswordChange);
  }

  async function handleLogin(event) {
    event.preventDefault();
    const password = refs.adminPassword.value;
    const ok = await verifyPassword(password);

    if (!ok) {
      flashMessage(refs.loginMessage, "Password is not correct.");
      refs.adminPassword.select();
      return;
    }

    localStorage.setItem(SESSION_KEY, "open");
    refs.loginForm.reset();
    flashMessage(refs.loginMessage, "");
    setLoggedIn(true);
  }

  function setLoggedIn(isLoggedIn) {
    refs.loginView.classList.toggle("hidden", isLoggedIn);
    refs.adminView.classList.toggle("hidden", !isLoggedIn);
    refs.adminView.setAttribute("aria-hidden", String(!isLoggedIn));
    refs.sessionState.textContent = isLoggedIn ? "Admin Open" : "Locked";

    if (isLoggedIn) {
      refs.prefixInput.focus();
    } else {
      refs.adminPassword.focus();
    }
  }

  async function handlePasswordChange(event) {
    event.preventDefault();
    const currentPassword = refs.currentPasswordInput.value;
    const newPassword = refs.newPasswordInput.value;

    if (!(await verifyPassword(currentPassword))) {
      flashMessage(refs.passwordMessage, "Current password is not correct.");
      refs.currentPasswordInput.select();
      return;
    }

    if (newPassword.trim().length < 4) {
      flashMessage(refs.passwordMessage, "New password must be at least 4 characters.");
      refs.newPasswordInput.select();
      return;
    }

    localStorage.setItem(PASSWORD_KEY, await hashText(newPassword));
    refs.passwordForm.reset();
    flashMessage(refs.passwordMessage, "Password saved.", true);
  }

  async function verifyPassword(password) {
    const storedHash = localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD_HASH;
    const enteredHash = await hashText(password);

    if (storedHash === DEFAULT_PASSWORD_HASH && enteredHash === `plain:${password}`) {
      return password === DEFAULT_PASSWORD;
    }

    return storedHash === enteredHash;
  }

  async function hashText(value) {
    if (!window.crypto || !window.crypto.subtle) {
      return `plain:${value}`;
    }

    const bytes = new TextEncoder().encode(value);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function handleGenerate(event) {
    event.preventDefault();

    const settings = collectSettings();
    const built = buildCharacterPool(settings);

    if (!built.merged.length) {
      flashMessage(refs.generatorMessage, "Select at least one type or enter custom characters.");
      return;
    }

    const codes = [];
    for (let index = 0; index < settings.quantity; index += 1) {
      const randomPart = generateRandomPart(settings.length, built.pools, built.merged, settings.mustInclude);
      codes.push(composeCode(randomPart, settings));
    }

    generatedCodes = codes;
    renderResults(codes);
    saveHistory(codes, settings);
    renderHistory();
    saveSettings();
    updateStats();
    flashMessage(refs.generatorMessage, `${codes.length} codes generated.`, true);
  }

  function collectSettings() {
    const length = clampNumber(refs.lengthInput.value, 1, 128, DEFAULT_SETTINGS.length);

    return {
      prefix: refs.prefixInput.value,
      middle: refs.middleInput.value,
      suffix: refs.suffixInput.value,
      dayOptions: refs.dayOptionsInput.value,
      randomDay: refs.randomDayInput.checked,
      length,
      quantity: clampNumber(refs.quantityInput.value, 1, 100, DEFAULT_SETTINGS.quantity),
      custom: refs.customInput.value,
      selectedPools: $$("[data-pool]:checked").map((input) => input.dataset.pool),
      avoidSimilar: refs.avoidSimilarInput.checked,
      mustInclude: refs.mustIncludeInput.checked,
      uppercase: refs.uppercaseInput.checked
    };
  }

  function applySettings(settings) {
    refs.prefixInput.value = settings.prefix;
    refs.middleInput.value = settings.middle;
    refs.suffixInput.value = settings.suffix;
    refs.dayOptionsInput.value = settings.dayOptions;
    refs.randomDayInput.checked = settings.randomDay;
    refs.lengthInput.value = settings.length;
    refs.quantityInput.value = settings.quantity;
    refs.customInput.value = settings.custom;
    refs.avoidSimilarInput.checked = settings.avoidSimilar;
    refs.mustIncludeInput.checked = settings.mustInclude;
    refs.uppercaseInput.checked = settings.uppercase;

    $$("[data-pool]").forEach((input) => {
      input.checked = settings.selectedPools.includes(input.dataset.pool);
    });

    setActivePreset(Number(settings.length));
  }

  function loadSettings() {
    const saved = safeJsonParse(localStorage.getItem(SETTINGS_KEY), null);
    applySettings({ ...DEFAULT_SETTINGS, ...saved });
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(collectSettings()));
  }

  function buildCharacterPool(settings) {
    const pools = settings.selectedPools
      .map((name) => ({ name, chars: BASE_POOLS[name] || "" }))
      .filter((pool) => pool.chars.length);

    if (settings.custom.trim()) {
      pools.push({ name: "custom", chars: settings.custom });
    }

    const normalizedPools = pools
      .map((pool) => {
        let chars = Array.from(pool.chars);

        if (settings.avoidSimilar) {
          chars = chars.filter((char) => !SIMILAR_CHARS.has(char));
        }

        if (settings.uppercase) {
          chars = chars.map((char) => char.toUpperCase());
        }

        return {
          name: pool.name,
          chars: uniqueChars(chars.join(""))
        };
      })
      .filter((pool) => pool.chars.length);

    return {
      pools: normalizedPools,
      merged: uniqueChars(normalizedPools.map((pool) => pool.chars).join(""))
    };
  }

  function generateRandomPart(length, pools, merged, mustInclude) {
    const chars = [];
    const eligiblePools = pools.filter((pool) => pool.chars.length);

    if (mustInclude && length >= eligiblePools.length) {
      eligiblePools.forEach((pool) => {
        chars.push(pickChar(pool.chars));
      });
    }

    while (chars.length < length) {
      chars.push(pickChar(merged));
    }

    return shuffle(chars).join("");
  }

  function composeCode(randomPart, settings) {
    const segment = pickMiddleSegment(settings);
    return `${settings.prefix}${segment}${randomPart}${settings.suffix}`;
  }

  function pickMiddleSegment(settings) {
    if (!settings.randomDay) {
      return settings.middle;
    }

    const options = parseList(settings.dayOptions);
    if (!options.length) {
      return settings.middle;
    }

    return options[randomInt(options.length)];
  }

  function pickChar(chars) {
    const list = Array.from(chars);
    return list[randomInt(list.length)];
  }

  function randomInt(max) {
    if (max <= 0) return 0;

    if (window.crypto && window.crypto.getRandomValues) {
      const range = 0x100000000;
      const limit = range - (range % max);
      const bucket = new Uint32Array(1);

      do {
        window.crypto.getRandomValues(bucket);
      } while (bucket[0] >= limit);

      return bucket[0] % max;
    }

    return Math.floor(Math.random() * max);
  }

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = randomInt(index + 1);
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function renderResults(codes) {
    refs.resultGrid.replaceChildren();
    refs.emptyState.classList.toggle("hidden", codes.length > 0);

    const fragment = document.createDocumentFragment();
    codes.forEach((code, index) => {
      const card = document.createElement("article");
      card.className = "code-card";

      const meta = document.createElement("div");
      meta.className = "code-meta";

      const serial = document.createElement("span");
      serial.textContent = `#${String(index + 1).padStart(2, "0")}`;

      const length = document.createElement("span");
      length.textContent = `${Array.from(code).length} chars`;

      const value = document.createElement("code");
      value.className = "code-value";
      value.textContent = code;

      const button = document.createElement("button");
      button.className = "copy-button";
      button.type = "button";
      button.dataset.copy = code;
      button.textContent = "Copy";

      meta.append(serial, length);
      card.append(meta, value, button);
      fragment.append(card);
    });

    refs.resultGrid.append(fragment);
  }

  function saveHistory(codes, settings) {
    const history = readHistory();
    history.unshift({
      at: new Date().toISOString(),
      codes,
      meta: {
        length: settings.length,
        quantity: settings.quantity,
        prefix: settings.prefix,
        middle: settings.middle,
        dayOptions: settings.dayOptions,
        randomDay: settings.randomDay,
        suffix: settings.suffix
      }
    });

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 8)));
  }

  function readHistory() {
    return safeJsonParse(localStorage.getItem(HISTORY_KEY), []);
  }

  function renderHistory() {
    const history = readHistory();
    refs.historyList.replaceChildren();

    if (!history.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "History is empty.";
      refs.historyList.append(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    history.forEach((batch, index) => {
      const item = document.createElement("article");
      item.className = "history-item";

      const meta = document.createElement("div");
      meta.className = "history-meta";

      const time = document.createElement("span");
      time.textContent = formatDate(batch.at);

      const count = document.createElement("span");
      count.textContent = `${batch.codes.length} codes`;

      const sample = document.createElement("div");
      sample.className = "history-code";
      sample.textContent = batch.codes[0] || "";

      const button = document.createElement("button");
      button.className = "copy-button";
      button.type = "button";
      button.dataset.historyIndex = String(index);
      button.textContent = "Copy Batch";

      meta.append(time, count);
      item.append(meta, sample, button);
      fragment.append(item);
    });

    refs.historyList.append(fragment);
  }

  function updateStats() {
    const settings = collectSettings();
    const built = buildCharacterPool(settings);

    refs.lengthStat.textContent = String(settings.length);
    refs.batchStat.textContent = String(settings.quantity);
    refs.poolStat.textContent = String(Array.from(built.merged).length);
    setActivePreset(settings.length);
  }

  function setActivePreset(length) {
    $$(".preset-button").forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.length) === Number(length));
    });
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-999px";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  function flashMessage(element, message, isGood = false) {
    element.textContent = message;
    element.classList.toggle("is-good", isGood);
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, Math.floor(number)));
  }

  function uniqueChars(value) {
    return Array.from(new Set(Array.from(value))).join("");
  }

  function parseList(value) {
    return value
      .split(/[,\n]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function safeJsonParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  }
})();
