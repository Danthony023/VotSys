/**
 * VotSys Configuration & Session Management
 */
const CONFIG = {
  API_BASE_URL: "https://votingsystemservice.herokuapp.com",
  IDLE_TIMEOUT_MS: 15 * 60 * 1000, // 15 minutes inactivity auto-logout
  KEYS: {
    USER: "user",
    LOGGED_IN: "lg",
    API_URL: "url",
    ROLE: "votsys_role"
  }
};

// Initialize default session URL
sessionStorage.setItem(CONFIG.KEYS.API_URL, CONFIG.API_BASE_URL);

/**
 * Session Helpers
 */
const Auth = {
  getUser() {
    try {
      const data = sessionStorage.getItem(CONFIG.KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(userData, role = "voter") {
    sessionStorage.setItem(CONFIG.KEYS.USER, JSON.stringify(userData));
    sessionStorage.setItem(CONFIG.KEYS.LOGGED_IN, "1");
    sessionStorage.setItem(CONFIG.KEYS.ROLE, role);
    sessionStorage.setItem(CONFIG.KEYS.API_URL, CONFIG.API_BASE_URL);
  },

  isLoggedIn() {
    return sessionStorage.getItem(CONFIG.KEYS.LOGGED_IN) === "1" && Auth.getUser() !== null;
  },

  logout(reason = null) {
    sessionStorage.clear();
    if (reason) {
      alert(reason);
    }
    window.location.href = "index.html";
  },

  requireAuth(requiredRole = null) {
    if (!Auth.isLoggedIn()) {
      window.location.href = "index.html";
      return false;
    }
    if (requiredRole) {
      const currentRole = sessionStorage.getItem(CONFIG.KEYS.ROLE);
      if (currentRole && currentRole !== requiredRole && currentRole !== "admin") {
        console.warn(`Role mismatch: Expected ${requiredRole}, found ${currentRole}`);
      }
    }
    return true;
  }
};

/**
 * Inactivity Monitor
 */
(function setupInactivityMonitor() {
  // Only monitor on protected pages (not on login/registration pages)
  const isAuthPage = [
    "index.html",
    "admin-login.html",
    "aspirants-login.html",
    "voters-registration.html",
    "aspirants-registration.html"
  ].some(page => window.location.pathname.endsWith(page) || window.location.pathname === "/" || window.location.pathname === "");

  if (isAuthPage) return;

  let idleTimer;

  function resetTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (Auth.isLoggedIn()) {
        swal({
          title: "Session Expired",
          text: "You have been logged out due to 15 minutes of inactivity.",
          icon: "warning",
        }).then(() => {
          Auth.logout();
        });
      }
    }, CONFIG.IDLE_TIMEOUT_MS);
  }

  // Events that reset inactivity timer
  ["mousemove", "keypress", "click", "scroll", "touchstart"].forEach(evt => {
    document.addEventListener(evt, resetTimer, { passive: true });
  });

  resetTimer();
})();
