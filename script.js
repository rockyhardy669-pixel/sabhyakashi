(function () {
  const KEY = "sabhyakashi-cart";
  const store = window.SABHYA_STORE;
  const seed = window.SABHYAKASHI || { products: [], whatsapp: "" };
  const products = () => (store ? store.getLiveProducts() : seed.products);
  const whatsapp = () => (store ? store.getSettings().whatsapp : seed.whatsapp);

  const rupees = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const readCart = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch { return []; }
  };
  const writeCart = (items) => localStorage.setItem(KEY, JSON.stringify(items));

  function cartCount() {
    return readCart().reduce((n, i) => n + i.qty, 0);
  }

  function refreshCount() {
    document.querySelectorAll(".cart-count").forEach((el) => { el.textContent = cartCount(); });
  }

  function addToCart(id, qty) {
    const product = products().find((p) => p.id === id);
    if (!product) return;
    const items = readCart();
    const found = items.find((i) => i.id === id);
    if (found) found.qty += qty;
    else items.push({ id, qty });
    writeCart(items);
    refreshCount();
    openCart();
  }

  function renderCart() {
    const box = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");
    if (!box) return;
    const items = readCart();
    if (!items.length) {
      box.innerHTML = "<p class='muted'>Your bag is empty.</p>";
      if (totalEl) totalEl.textContent = rupees(0);
      return;
    }
    let total = 0;
    box.innerHTML = items.map((item) => {
      const p = products().find((x) => x.id === item.id) || (store && store.getProducts().find((x) => x.id === item.id));
      if (!p) return "";
      total += p.price * item.qty;
      return `<article class="cart-item">
        <img src="${p.image}" alt="">
        <div>
          <strong>${p.name}</strong>
          <p class="muted">${item.qty} × ${rupees(p.price)}</p>
        </div>
        <button type="button" data-remove="${p.id}">Remove</button>
      </article>`;
    }).join("");
    if (totalEl) totalEl.textContent = rupees(total);
  }

  function openCart() {
    const drawer = document.getElementById("cart-drawer");
    if (!drawer) return;
    renderCart();
    drawer.classList.add("is-open");
  }

  function closeCart() {
    document.getElementById("cart-drawer")?.classList.remove("is-open");
  }

  function productCard(p) {
    return `<article class="card">
      <a href="product.html?id=${p.id}"><img src="${p.image}" alt="${p.name}"></a>
      <div class="card-body">
        <p class="badge">${p.badge}</p>
        <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <p class="muted">${p.weave}</p>
        <p class="price">${rupees(p.price)}</p>
      </div>
    </article>`;
  }

  function renderFeatured() {
    const root = document.getElementById("featured-grid");
    if (!root) return;
    root.innerHTML = products().slice(0, 4).map(productCard).join("");
  }

  function renderCatalog() {
    const root = document.getElementById("catalog-grid");
    if (!root) return;
    const active = document.querySelector(".filters button.is-on")?.dataset.weave || "all";
    const list = products().filter((p) => active === "all" || p.weave === active);
    root.innerHTML = list.map(productCard).join("");
  }

  function renderProduct() {
    const root = document.getElementById("product-view");
    if (!root) return;
    const list = products();
    if (!list.length) {
      root.innerHTML = "<p>No live sarees in the catalogue.</p>";
      return;
    }
    const id = new URLSearchParams(location.search).get("id") || list[0].id;
    const p = list.find((x) => x.id === id) || list[0];
    document.title = `${p.name} · Sabhyakashi`;
    root.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div class="product-meta">
        <p class="eyebrow">${p.weave} · ${p.color}</p>
        <h1>${p.name}</h1>
        <p class="price">${rupees(p.price)}</p>
        <p>${p.details}</p>
        <div class="qty-row">
          <label for="qty">Qty</label>
          <input id="qty" type="number" min="1" value="1">
        </div>
        <button class="btn" type="button" data-add="${p.id}">Add to bag</button>
        <a class="btn btn-ghost" href="https://wa.me/${whatsapp()}?text=${encodeURIComponent("I would like to order " + p.name + " from Sabhyakashi.")}">Order on WhatsApp</a>
        <p class="note">Sample listing. This catalogue does not accept online payments; confirm product details and availability before purchase.</p>
      </div>`;
  }

  document.addEventListener("click", (e) => {
    const menuBtn = e.target.closest(".menu-btn");
    if (menuBtn) document.querySelector(".nav")?.classList.toggle("is-open");

    if (e.target.closest("[data-open-cart]")) openCart();
    if (e.target.closest("[data-close-cart]")) closeCart();
    if (e.target.id === "cart-drawer") closeCart();

    const add = e.target.closest("[data-add]");
    if (add) {
      const qty = Number(document.getElementById("qty")?.value || 1);
      const qtyValue = Math.max(1, qty);
      addToCart(add.dataset.add, qtyValue);
      const added = products().find((p) => p.id === add.dataset.add);
      if (store && added) store.addEnquiry({ type: "bag", name: added.name, qty: qtyValue });
    }

    const remove = e.target.closest("[data-remove]");
    if (remove) {
      writeCart(readCart().filter((i) => i.id !== remove.dataset.remove));
      refreshCount();
      renderCart();
    }

    const filter = e.target.closest(".filters button");
    if (filter) {
      document.querySelectorAll(".filters button").forEach((b) => b.classList.remove("is-on"));
      filter.classList.add("is-on");
      renderCatalog();
    }
  });

  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.querySelector("[name=name]").value.trim();
      const phone = form.querySelector("[name=phone]")?.value.trim() || "";
      const note = form.querySelector("[name=message]").value.trim();
      const status = document.getElementById("form-status");
      if (status) status.textContent = "Thank you. We will reply by phone or WhatsApp.";
      if (store) store.addEnquiry({ type: "contact", name, phone, message: note });
      const text = `Hello Sabhyakashi, I am ${name}. ${note}`;
      window.open(`https://wa.me/${whatsapp()}?text=${encodeURIComponent(text)}`, "_blank");
      form.reset();
    });
  }

  renderFeatured();
  renderCatalog();
  renderProduct();
  refreshCount();
})();
