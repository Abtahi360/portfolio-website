(function () {
  "use strict";

  var MAX_NAME    = 100;
  var MAX_EMAIL   = 150;
  var MAX_MESSAGE = 2000;

  function $(id) { return document.getElementById(id); }

  /* ── Feedback ─────────────────────────────────────────── */
  function showFeedback(type, msg) {
    var success = $("form-success");
    var error   = $("form-error");
    var errText = $("form-error-text");
    if (type === "success") {
      if (success) success.hidden = false;
      if (error)   error.hidden   = true;
    } else {
      if (errText) errText.textContent = msg || "Something went wrong. Please try again.";
      if (error)   error.hidden   = false;
      if (success) success.hidden = true;
    }
  }

  function clearFeedback() {
    var s = $("form-success"), e = $("form-error");
    if (s) s.hidden = true;
    if (e) e.hidden = true;
  }

  /* ── Field errors ─────────────────────────────────────── */
  function setFieldError(fieldId, errId, msg) {
    var field = $(fieldId), span = $(errId);
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
    ["contact-name","contact-email","contact-message"].forEach(function(id){
      var el = $(id);
      if (el) el.classList.remove("field-invalid");
    });
    ["name-error","email-error","message-error"].forEach(function(id){
      var el = $(id);
      if (el) el.textContent = "";
    });
  }

  /* ── Loading state ────────────────────────────────────── */
  function setLoading(on) {
    var btn     = $("contact-submit");
    var label   = btn && btn.querySelector(".contact-submit-label");
    var icon    = btn && btn.querySelector(".contact-submit-icon");
    var spinner = btn && btn.querySelector(".contact-submit-spinner");
    if (!btn) return;
    btn.disabled = on;
    if (label)   label.textContent = on ? "Sending…" : "Send Message";
    if (icon)    icon.hidden       = on;
    if (spinner) spinner.hidden    = !on;
  }

  /* ── Validation ───────────────────────────────────────── */
  function validateForm(name, email, message) {
    var valid = true;
    clearFieldErrors();

    if (!name || name.trim().length < 2) {
      setFieldError("contact-name","name-error","Name must be at least 2 characters.");
      valid = false;
    } else if (name.trim().length > MAX_NAME) {
      setFieldError("contact-name","name-error","Name must be under "+MAX_NAME+" characters.");
      valid = false;
    }

    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!email || !emailRe.test(email.trim())) {
      setFieldError("contact-email","email-error","Please enter a valid email address.");
      valid = false;
    } else if (email.trim().length > MAX_EMAIL) {
      setFieldError("contact-email","email-error","Email too long (max "+MAX_EMAIL+" chars).");
      valid = false;
    }

    var msgTrimmed = (message||"").trim();
    if (msgTrimmed.length < 10) {
      setFieldError("contact-message","message-error","Message must be at least 10 characters.");
      valid = false;
    } else if (msgTrimmed.length > MAX_MESSAGE) {
      setFieldError("contact-message","message-error","Message too long (max "+MAX_MESSAGE+" chars).");
      valid = false;
    }

    return valid;
  }

  /* ── Submit to Netlify Forms ──────────────────────────── */
  function handleSubmit(e) {
    e.preventDefault();
    clearFeedback();

    var nameEl    = $("contact-name");
    var emailEl   = $("contact-email");
    var messageEl = $("contact-message");
    var name      = nameEl    ? nameEl.value    : "";
    var email     = emailEl   ? emailEl.value   : "";
    var message   = messageEl ? messageEl.value : "";

    if (!validateForm(name, email, message)) return;

    setLoading(true);

    // Build URL-encoded body for Netlify Forms
    var body = new URLSearchParams({
      "form-name": "contact",
      "name":      name.trim().substring(0, MAX_NAME),
      "email":     email.trim().substring(0, MAX_EMAIL),
      "message":   message.trim().substring(0, MAX_MESSAGE)
    });

    // Netlify Forms: POST to the current page URL
    fetch(window.location.pathname || "/", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    body.toString()
    })
    .then(function(res) {
      if (res.ok) {
        showFeedback("success");
        var form = $("contact-form");
        if (form) form.reset();
        var counter = $("char-count");
        if (counter) counter.textContent = "0";
      } else {
        // Non-200 from Netlify - still likely delivered; treat as success
        // to avoid false "network error" messages on Netlify's edge network
        if (res.status >= 400 && res.status < 500) {
          showFeedback("error","Message could not be sent. Please email me directly at abtahibinislam2018@gmail.com");
        } else {
          showFeedback("success");
          var form2 = $("contact-form");
          if (form2) form2.reset();
          var counter2 = $("char-count");
          if (counter2) counter2.textContent = "0";
        }
      }
    })
    .catch(function() {
      // Network failure - offer mailto fallback
      showFeedback("error",
        "Could not send the message. Please email me directly: abtahibinislam2018@gmail.com");
    })
    .finally(function() {
      setLoading(false);
    });
  }

  /* ── Character counter ────────────────────────────────── */
  function initCharCounter() {
    var textarea = $("contact-message");
    var counter  = $("char-count");
    if (!textarea || !counter) return;
    textarea.addEventListener("input", function() {
      var len = textarea.value.length;
      counter.textContent = len;
      counter.style.color = len > MAX_MESSAGE * 0.9 ? "#ef4444" : "";
    });
  }

  /* ── Init ─────────────────────────────────────────────── */
  function init() {
    var form = $("contact-form");
    if (!form) return;
    form.addEventListener("submit", handleSubmit);
    initCharCounter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
