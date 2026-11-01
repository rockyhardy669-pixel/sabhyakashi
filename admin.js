(function () {
  const store = window.SABHYA_STORE;
  if (!store || !store.requireAuth()) return;

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));

  const rupees = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const images = [
    "images/katan-crimson.jpg",
    "images/jangla-green.jpg",
    "images/kadhua-ivory.jpg",
    "images/tanchoi-navy.jpg",
    "images/tissue-gulabi.jpg",
    "images/shikargah-marigold.jpg",
    "images/georgette-wine.jpg",
    "images/butidaar-ebony.jpg",
    "images/hero.jpg",
    "images/zari-detail.jpg"
  ];

  const slug = (name) =>
    name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "saree-" + Date.now();

  const who = document.getElementById("admin-user");
  if (who) who.textContent = store.currentUser();

  document.getElementById("logout-btn")?.addEventListener("click", () => {
    store.logout();
    location.href = "login.html";
  });

  function stats() {
    const products = store.getProducts();
    const live = products.filter((p) => !p.hidden && Number(p.stock) > 0);
    const hidden = products.filter((p) => p.hidden || Number(p.stock) <= 0);
    document.getElementById("stat-live").textContent = live.length;
    document.getElementById("stat-hidden").textContent = hidden.length;
    document.getElementById("stat-enquiries").textContent = store.getEnquiries().length;
    document.getElementById("stat-whatsapp").textContent = store.getSettings().whatsapp;
  }

  function fillSettings() {
    const s = store.getSettings();
    document.getElementById("set-whatsapp").value = s.whatsapp;
    document.getElementById("set-username").value = s.username;
  }

  function renderTable() {
    const body = document.getElementById("product-rows");
    body.innerHTML = store.getProducts().map((p) => `
      <tr>
        <td><img src="${esc(p.image)}" alt=""></td>
        <td>
          <strong>${esc(p.name)}</strong>
          <div class="muted">${esc(p.weave)} · ${esc(p.color)}</div>
        </td>
        <td>${rupees(p.price)}</td>
        <td>${esc(p.stock)}</td>
        <td>${p.hidden ? "Hidden" : "Live"}</td>
        <td class="row-actions">
          <button type="button" data-edit="${esc(p.id)}">Edit</button>
          <button type="button" data-toggle="${esc(p.id)}">${p.hidden ? "Show" : "Hide"}</button>
          <button type="button" data-delete="${esc(p.id)}">Delete</button>
        </td>
      </tr>
    `).join("");
  }

  function renderEnquiries() {
    const box = document.getElementById("enquiry-list");
    const list = store.getEnquiries();
    if (!list.length) {
      box.innerHTML = "<p class='muted'>No enquiries yet. Add-to-bag and the contact form appear here.</p>";
      return;
    }
    box.innerHTML = list.map((e) => {
      const when = new Date(e.at).toLocaleString("en-IN");
      if (e.type === "bag") {
        return `<article class="enquiry"><strong>Bag</strong> · ${esc(e.name)} × ${esc(e.qty)}<div class="muted">${esc(when)}</div></article>`;
      }
      return `<article class="enquiry"><strong>Contact</strong> · ${esc(e.name)} · ${esc(e.phone)}<div class="muted">${esc(e.message)} · ${esc(when)}</div></article>`;
    }).join("");
  }

  function imageOptions(selected) {
    const extra = selected && !images.includes(selected) ? `<option selected value="${esc(selected)}">${esc(selected)}</option>` : "";
    return extra + images.map((src) =>
      `<option value="${src}" ${src === selected ? "selected" : ""}>${src.replace("images/", "")}</option>`
    ).join("");
  }

  function fillForm(p) {
    document.getElementById("p-id").value = p?.id || "";
    document.getElementById("p-name").value = p?.name || "";
    document.getElementById("p-weave").value = p?.weave || "";
    document.getElementById("p-color").value = p?.color || "";
    document.getElementById("p-price").value = p?.price || "";
    document.getElementById("p-stock").value = p?.stock ?? 6;
    document.getElementById("p-badge").value = p?.badge || "";
    document.getElementById("p-image").innerHTML = imageOptions(p?.image || images[0]);
    document.getElementById("p-blurb").value = p?.blurb || "";
    document.getElementById("p-details").value = p?.details || "";
    document.getElementById("form-title").textContent = p ? "Edit saree" : "Add saree";
  }

  function refresh() {
    stats();
    fillSettings();
    renderTable();
    renderEnquiries();
  }

  document.getElementById("settings-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const password = document.getElementById("set-password").value;
    const next = {
      whatsapp: document.getElementById("set-whatsapp").value.trim(),
      username: document.getElementById("set-username").value.trim()
    };
    if (password) next.password = password;
    store.saveSettings(next);
    document.getElementById("set-password").value = "";
    document.getElementById("settings-status").textContent = "Settings saved.";
    refresh();
  });

  document.getElementById("product-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const list = store.getProducts();
    const existingId = document.getElementById("p-id").value;
    const name = document.getElementById("p-name").value.trim();
    const product = {
      id: existingId || slug(name),
      name,
      weave: document.getElementById("p-weave").value.trim(),
      color: document.getElementById("p-color").value.trim(),
      price: Number(document.getElementById("p-price").value),
      stock: Number(document.getElementById("p-stock").value),
      badge: document.getElementById("p-badge").value.trim() || "New",
      image: document.getElementById("p-image").value,
      blurb: document.getElementById("p-blurb").value.trim(),
      details: document.getElementById("p-details").value.trim(),
      hidden: false
    };
    const idx = list.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      product.hidden = list[idx].hidden;
      list[idx] = product;
    } else {
      list.unshift(product);
    }
    store.saveProducts(list);
    e.target.reset();
    fillForm(null);
    refresh();
  });

  document.getElementById("reset-form").addEventListener("click", () => fillForm(null));

  document.getElementById("reset-catalog").addEventListener("click", () => {
    if (confirm("Restore the original eight sarees?")) {
      store.resetCatalog();
      fillForm(null);
      refresh();
    }
  });

  document.getElementById("product-rows").addEventListener("click", (e) => {
    const id = e.target.dataset.edit || e.target.dataset.toggle || e.target.dataset.delete;
    if (!id) return;
    const list = store.getProducts();
    const idx = list.findIndex((p) => p.id === id);
    if (idx < 0) return;
    if (e.target.dataset.edit) {
      fillForm(list[idx]);
      document.getElementById("product-form").scrollIntoView({ behavior: "smooth" });
    }
    if (e.target.dataset.toggle) {
      list[idx].hidden = !list[idx].hidden;
      store.saveProducts(list);
      refresh();
    }
    if (e.target.dataset.delete) {
      if (confirm("Delete " + list[idx].name + "?")) {
        list.splice(idx, 1);
        store.saveProducts(list);
        fillForm(null);
        refresh();
      }
    }
  });

  fillForm(null);
  refresh();
})();
