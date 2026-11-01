(function () {
  const AUTH = "sabhyakashi-auth";
  const CATALOG = "sabhyakashi-catalog";
  const SETTINGS = "sabhyakashi-settings";
  const ENQUIRIES = "sabhyakashi-enquiries";
  const seed = window.SABHYAKASHI || { products: [], whatsapp: "", admin: {} };

  const read = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  function seededProducts() {
    return seed.products.map((p) => ({
      ...p,
      stock: p.stock ?? 6,
      hidden: p.hidden ?? false
    }));
  }

  const store = {
    getSettings() {
      const saved = read(SETTINGS, {});
      return {
        whatsapp: saved.whatsapp || seed.whatsapp || "",
        username: saved.username || seed.admin.username,
        password: saved.password || seed.admin.password
      };
    },

    saveSettings(partial) {
      write(SETTINGS, { ...this.getSettings(), ...partial });
    },

    getProducts() {
      const saved = read(CATALOG, null);
      if (Array.isArray(saved) && saved.length) return saved;
      const seeded = seededProducts();
      write(CATALOG, seeded);
      return seeded;
    },

    saveProducts(list) {
      write(CATALOG, list);
    },

    getLiveProducts() {
      return this.getProducts().filter((p) => !p.hidden && Number(p.stock) > 0);
    },

    resetCatalog() {
      const seeded = seededProducts();
      write(CATALOG, seeded);
      return seeded;
    },

    isAuthed() {
      return sessionStorage.getItem(AUTH) === "ok";
    },

    login(username, password) {
      const settings = this.getSettings();
      if (username === settings.username && password === settings.password) {
        sessionStorage.setItem(AUTH, "ok");
        sessionStorage.setItem(AUTH + "-user", username);
        return true;
      }
      return false;
    },

    logout() {
      sessionStorage.removeItem(AUTH);
      sessionStorage.removeItem(AUTH + "-user");
    },

    currentUser() {
      return sessionStorage.getItem(AUTH + "-user") || "";
    },

    requireAuth() {
      if (!this.isAuthed()) {
        location.replace("login.html");
        return false;
      }
      return true;
    },

    addEnquiry(entry) {
      const list = read(ENQUIRIES, []);
      list.unshift({ at: Date.now(), ...entry });
      write(ENQUIRIES, list.slice(0, 50));
    },

    getEnquiries() {
      return read(ENQUIRIES, []);
    }
  };

  window.SABHYA_STORE = store;
})();
