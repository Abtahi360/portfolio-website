
(function () {
  "use strict";

  /* ── CONFIG ─────────────────────────────────────────────── */
  const API_ENDPOINT = "model/contact.php";   // adjust if needed
  const MAX_NAME     = 100;
  const MAX_EMAIL    = 150;
  const MAX_MESSAGE  = 2000;

  /* ── HELPERS ─────────────────────────────────────────────── */
  function $(id) { return document.getElementById(id); }

  function showFeedback(type, msg) {
    const success = $("form-success");
    const error   = $("form-error");
    const errText = $("form-error-text");

    if (type === "success") {
      if (success) { success.hidden = false; }
      if (error)   { error.hidden   = true;  }
    } else {
      if (errText) { errText.textContent = msg || "Something went wrong."; }
      if (error)   { error.hidden   = false; }
      if (success) { success.hidden = true;  }
    }
  }

  function clearFeedback() {
    const s = $("form-success"), e = $("form-error");
    if (s) s.hidden = true;
    if (e) e.hidden = true;
  }

  function setFieldError(fieldId, errId, msg) {
    const field = $(fieldId);
    const span  = $(errId);
    if (!field) return;
    if (msg) {
      field.classList.add("field-invalid");
      if (span) span.textContent = msg;
    } else {
      field.classList.remove("field-invalid");
      if (span) span.textContent = "";
    }
  }

  function clearFieldErrors() {
    ["contact-name", "contact-email", "contact-message"].forEach(id => {
      const el = $(id);
      if (el) el.classList.remove("field-invalid");
    });
    ["name-error", "email-error", "message-error"].forEach(id => {
      const el = $(id);
      if (el) el.textContent = "";
    });
  }

  function setLoading(on) {
    const btn     = $("contact-submit");
    const label   = btn && btn.querySelector(".contact-submit-label");
    const icon    = btn && btn.querySelector(".contact-submit-icon");
    const spinner = btn && btn.querySelector(".contact-submit-spinner");

    if (!btn) return;
    btn.disabled = on;
    if (label)   label.textContent  = on ? "Sending…" : "Send Message";
    if (icon)    icon.hidden        = on;
    if (spinner) spinner.hidden     = !on;
  }

  /* ── CLIENT-SIDE VALIDATION ──────────────────────────────── */
  function validateForm(name, email, message) {
    let valid = true;
    clearFieldErrors();

    // Name
    if (!name || name.trim().length < 2) {
      setFieldError("contact-name", "name-error", "Name must be at least 2 characters.");
      valid = false;
    } else if (name.trim().length > MAX_NAME) {
      setFieldError("contact-name", "name-error", `Name must be under ${MAX_NAME} characters.`);
      valid = false;
    }

    // Email
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!email || !emailRe.test(email.trim())) {
      setFieldError("contact-email", "email-error", "Please enter a valid email address.");
      valid = false;
    } else if (email.trim().length > MAX_EMAIL) {
      setFieldError("contact-email", "email-error", `Email too long (max ${MAX_EMAIL} chars).`);
      valid = false;
    }

    // Message
    const msgTrimmed = (message || "").trim();
    if (msgTrimmed.length < 10) {
      setFieldError("contact-message", "message-error", "Message must be at least 10 characters.");
      valid = false;
    } else if (msgTrimmed.length > MAX_MESSAGE) {
      setFieldError("contact-message", "message-error", `Message too long (max ${MAX_MESSAGE} chars).`);
      valid = false;
    }

    return valid;
  }

  /* ── CSRF TOKEN ──────────────────────────────────────────── */
  async function fetchCsrfToken() {
    try {
      const res  = await fetch(API_ENDPOINT + "?action=csrf", { credentials: "same-origin" });
      const data = await res.json();
      const tokenEl = $("csrf-token");
      if (tokenEl && data.token) {
        tokenEl.value = data.token;
        return data.token;
      }
    } catch (_) {
      // Non-PHP environments (static hosting) — skip token
    }
    return "";
  }

  /* ── SUBMIT ──────────────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    clearFeedback();

    const nameEl    = $("contact-name");
    const emailEl   = $("contact-email");
    const messageEl = $("contact-message");

    const name    = nameEl    ? nameEl.value    : "";
    const email   = emailEl   ? emailEl.value   : "";
    const message = messageEl ? messageEl.value : "";

    if (!validateForm(name, email, message)) return;

    setLoading(true);

    try {
      const token = $("csrf-token") ? $("csrf-token").value : "";

      const payload = new URLSearchParams({
        name:       name.trim().substring(0, MAX_NAME),
        email:      email.trim().substring(0, MAX_EMAIL),
        message:    message.trim().substring(0, MAX_MESSAGE),
        csrf_token: token
      });

      const res  = await fetch(API_ENDPOINT, {
        method:      "POST",
        credentials: "same-origin",
        headers:     { "Content-Type": "application/x-www-form-urlencoded" },
        body:        payload.toString()
      });

      const data = await res.json();

      if (data.success) {
        showFeedback("success");
        const form = $("contact-form");
        if (form) form.reset();
        const counter = $("char-count");
        if (counter) counter.textContent = "0";
      } else {
        showFeedback("error", data.message || "Something went wrong. Please try again.");
      }

    } catch (err) {
      showFeedback("error", "Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── CHARACTER COUNTER ───────────────────────────────────── */
  function initCharCounter() {
    const textarea = $("contact-message");
    const counter  = $("char-count");
    if (!textarea || !counter) return;

    textarea.addEventListener("input", () => {
      const len = textarea.value.length;
      counter.textContent = len;
      counter.style.color = len > MAX_MESSAGE * 0.9 ? "#ef4444" : "";
    });
  }

  /* ── INIT ────────────────────────────────────────────────── */
  function init() {
    const form = $("contact-form");
    if (!form) return;

    form.addEventListener("submit", handleSubmit);
    initCharCounter();

    // Fetch CSRF token on load (works only on PHP hosting)
    fetchCsrfToken();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
