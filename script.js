document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const yearSpan = document.getElementById("year");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });

    navLinks.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
      }
    });
  }

  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  const slider = document.getElementById("testimonialSlider");
  if (slider) {
    const slides = slider.querySelectorAll(".testimonial");
    const dots = slider.querySelectorAll(".dot-btn");
    let current = 0;
    let timer;

    const goTo = (index) => {
      slides[current].classList.remove("active");
      dots[current].classList.remove("active");
      current = index;
      slides[current].classList.add("active");
      dots[current].classList.add("active");
    };

    dots.forEach((dot, idx) => {
      dot.addEventListener("click", () => {
        goTo(idx);
        resetTimer();
      });
    });

    const next = () => {
      const nextIndex = (current + 1) % slides.length;
      goTo(nextIndex);
    };

    const resetTimer = () => {
      clearInterval(timer);
      timer = setInterval(next, 5000);
    };

    if (slides.length > 1) {
      timer = setInterval(next, 5000);
    }
  }

  const accordionItems = document.querySelectorAll(".accordion-item");
  accordionItems.forEach((item) => {
    const header = item.querySelector(".accordion-header");
    header.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      accordionItems.forEach((i) => i.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });

  const modal = document.getElementById("projectModal");
  const modalBody = document.getElementById("modalBody");

  const projectDetails = {
    logo: {
      title: "Branding Coffee Shop",
      description:
        "Konsep logo clean dengan sentuhan ikon cup dan bentuk lingkaran untuk melambangkan kehangatan dan keakraban.",
      points: [
        "Logo utama + versi horizontal",
        "Palet warna warm dengan accent biru",
        "Mockup untuk gelas dan packaging",
        "File siap cetak & digital"
      ]
    },
    social: {
      title: "Instagram Content Pack Fashion",
      description:
        "Feed dibuat dalam grid yang konsisten dengan kombinasi foto produk dan graphic element minimalis.",
      points: [
        "12 desain feed + 6 story",
        "Template mudah di-edit di software desain",
        "Guideline singkat untuk gaya visual",
        "Optimasi layout agar brand terlihat premium"
      ]
    },
    motion: {
      title: "Intro YouTube Channel",
      description:
        "Intro berdurasi 6 detik dengan animasi logo, light streak, dan movement kamera yang smooth.",
      points: [
        "Durasi 5–8 detik Full HD",
        "Motion simple, tidak mengganggu konten utama",
        "Output .mp4 siap pakai",
        "Bisa request musik / sfx ringan"
      ]
    }
  };

  const openModalButtons = document.querySelectorAll("[data-open-modal]");
  openModalButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-open-modal");
      const data = projectDetails[key];
      if (!data || !modal || !modalBody) return;

      modalBody.innerHTML = `
        <h3>${data.title}</h3>
        <p>${data.description}</p>
        <ul>${data.points.map((p) => `<li>${p}</li>`).join("")}</ul>
      `;
      modal.classList.add("open");
    });
  });

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (
        e.target.matches("[data-close-modal]") ||
        e.target.closest(".modal-close")
      ) {
        modal.classList.remove("open");
      }
    });
  }

  const billingToggle = document.getElementById("billingToggle");
  const pricingGrid = document.getElementById("pricingGrid");
  if (billingToggle && pricingGrid) {
    const labels = document.querySelectorAll(".toggle-label");
    billingToggle.addEventListener("click", () => {
      const isBundle = billingToggle.classList.toggle("bundle");
      pricingGrid.querySelectorAll(".pricing-card").forEach((card) => {
        const plan = card.getAttribute("data-plan");
        if (plan === "bundle") {
          card.style.display = isBundle ? "" : "none";
        } else {
          card.style.display = isBundle ? "none" : "";
        }
      });
      labels.forEach((label) => {
        const billing = label.getAttribute("data-billing");
        label.classList.toggle("active", isBundle ? billing === "bundle" : billing === "single");
      });
    });
  }

  // -----------------------------
  // Cart & Pakasir (URL) checkout
  // -----------------------------

  const CART_KEY = "designap_cart_v1";
  const META_KEY = "designap_checkout_meta_v1";

  // Storage wrapper.
  // NOTE: Jika website dijalankan lewat file://, banyak browser menganggap tiap file
  // punya origin berbeda/opaque, sehingga localStorage/sessionStorage tidak konsisten
  // antar halaman (mis. packages.html -> cart.html jadi kosong).
  // Solusi: pakai window.name (persist di tab yang sama) ketika protocol file://.
  const storage = (() => {
    const testKey = "__designap_test__";
    const canUse = (s) => {
      try {
        s.setItem(testKey, "1");
        s.removeItem(testKey);
        return true;
      } catch {
        return false;
      }
    };

    const makeWindowNameStorage = () => {
      const prefix = "designap_store_v1:";
      let cache = {};
      try {
        if (window.name && window.name.startsWith(prefix)) {
          cache = JSON.parse(window.name.slice(prefix.length) || "{}") || {};
        }
      } catch {
        cache = {};
      }

      const persist = () => {
        try {
          window.name = prefix + JSON.stringify(cache);
        } catch {
          // ignore
        }
      };

      return {
        getItem: (k) => (Object.prototype.hasOwnProperty.call(cache, k) ? cache[k] : null),
        setItem: (k, v) => {
          cache[k] = String(v);
          persist();
        },
        removeItem: (k) => {
          delete cache[k];
          persist();
        },
      };
    };

    // Force window.name store for file:// so cart works across pages.
    try {
      if (window.location?.protocol === "file:") return makeWindowNameStorage();
    } catch {}

    // Prefer localStorage/sessionStorage for normal http/https hosting.
    const isFileOrigin = (() => {
      try {
        // window.location.origin bisa jadi "null" untuk file://
        return window.location.protocol === "file:" || window.location.origin === "null";
      } catch {
        return false;
      }
    })();

    // Untuk file://, paksa pakai window.name agar keranjang konsisten antar halaman.
    if (!isFileOrigin) {
      try {
        if (typeof localStorage !== "undefined" && canUse(localStorage)) return localStorage;
      } catch {}
      try {
        if (typeof sessionStorage !== "undefined" && canUse(sessionStorage)) return sessionStorage;
      } catch {}
    }

    // Last fallback
    return makeWindowNameStorage();
  })();

  const readCart = () => {
    try {
      return JSON.parse(storage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const writeCart = (cart) => {
    storage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
  };

  const rupiah = (n) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  const cartCount = (cart) => cart.reduce((sum, it) => sum + (it.qty || 0), 0);
  const cartTotal = (cart) => cart.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 0), 0);

  // Slug Pakasir diambil dari config.js (tanpa input di website).
  const getDefaultSlug = () => {
    const fromConfig = window.DESIGNAP_CONFIG?.pakasir?.slug;
    return (fromConfig || "").trim();
  };

  const updateCartBadge = () => {
    const badge = document.getElementById("cartCount");
    if (!badge) return;
    const count = cartCount(readCart());
    badge.textContent = String(count);
    badge.style.opacity = count > 0 ? "1" : "0.65";
  };

  const upsertItem = (item) => {
    const cart = readCart();
    const idx = cart.findIndex((x) => x.id === item.id);
    if (idx >= 0) {
      cart[idx].qty = (cart[idx].qty || 0) + 1;
    } else {
      cart.push({ ...item, qty: 1 });
    }
    writeCart(cart);
  };

  const makeOrderId = () => {
    const d = new Date();
    const pad = (v) => String(v).padStart(2, "0");
    const yyyymmdd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `INV${yyyymmdd}-${rand}`;
  };

  const goToPakasir = ({ slug, amount, orderId }) => {
    const base = `https://app.pakasir.com/pay/${encodeURIComponent(slug)}/${encodeURIComponent(String(amount))}`;
    // Pakasir via URL: order_id wajib, dan kita kunci hanya QRIS.
    const params = new URLSearchParams({ order_id: orderId, qris_only: "1" });

    // Opsi redirect (akan jadi tombol "Kembali ke halaman merchant" setelah sukses)
    // Hanya aman jika website dibuka via http/https (bukan file://)
    try {
      if (window.location.origin && window.location.origin.startsWith("http")) {
        const redirectUrl = `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, "")}payment-success.html`;
        params.set("redirect", redirectUrl);
      }
    } catch {
      // ignore
    }

    // Simpan metadata untuk ditampilkan di halaman sukses
    storage.setItem(META_KEY, JSON.stringify({ orderId, amount, slug, at: new Date().toISOString() }));

    window.location.href = `${base}?${params.toString()}`;
  };

  // Bind "Tambah ke Keranjang" buttons (packages.html)
  document.querySelectorAll("[data-add-to-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const name = btn.getAttribute("data-name");
      const price = Number(btn.getAttribute("data-price") || "0");
      if (!id || !name || !Number.isFinite(price) || price <= 0) return;
      upsertItem({ id, name, price });
      btn.textContent = "Ditambahkan ✓";
      setTimeout(() => (btn.textContent = "Tambah ke Keranjang"), 900);
    });
  });

  // Make the whole pricing card clickable (optional UX)
  document.querySelectorAll(".pricing-card").forEach((card) => {
    const btn = card.querySelector("[data-add-to-cart]");
    if (!btn) return;
    card.style.cursor = "pointer";
    card.addEventListener("click", (e) => {
      // Don't hijack clicks on interactive elements
      if (e.target.closest("button, a, input, textarea, label, select")) return;
      btn.click();
    });
  });


  // Render Cart page (cart.html)
  const cartTable = document.getElementById("cartTable");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartContent = document.getElementById("cartContent");
  const cartSummary = document.getElementById("cartSummary");
  const cartTotalEl = document.getElementById("cartTotal");
  const payNowBtn = document.getElementById("payNowBtn");
  const clearCartBtn = document.getElementById("clearCartBtn");

  const renderCart = () => {
    if (!cartTable) return;
    const cart = readCart();
    const isEmpty = cart.length === 0;
    if (cartEmpty) cartEmpty.style.display = isEmpty ? "" : "none";
    if (cartContent) cartContent.style.display = isEmpty ? "none" : "";
    if (cartSummary) cartSummary.style.display = isEmpty ? "none" : "";
    if (cartTotalEl) cartTotalEl.textContent = rupiah(cartTotal(cart));

    if (isEmpty) {
      cartTable.innerHTML = "";
      return;
    }

    cartTable.innerHTML = cart
      .map(
        (it) => `
        <div class="cart-row">
          <div class="title">
            <strong>${it.name}</strong>
            <small>${rupiah(it.price)} / item</small>
          </div>
          <div class="qty-control">
            <button class="qty-btn" type="button" data-qty-dec="${it.id}">-</button>
            <strong>${it.qty}</strong>
            <button class="qty-btn" type="button" data-qty-inc="${it.id}">+</button>
          </div>
          <div style="text-align:right;">
            <strong>${rupiah(it.price * it.qty)}</strong><br/>
            <button class="link-btn" type="button" data-remove="${it.id}">Hapus</button>
          </div>
        </div>
      `
      )
      .join("");

    cartTable.querySelectorAll("[data-qty-inc]").forEach((b) =>
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-qty-inc");
        const cart2 = readCart();
        const idx = cart2.findIndex((x) => x.id === id);
        if (idx >= 0) {
          cart2[idx].qty += 1;
          writeCart(cart2);
          renderCart();
        }
      })
    );

    cartTable.querySelectorAll("[data-qty-dec]").forEach((b) =>
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-qty-dec");
        const cart2 = readCart();
        const idx = cart2.findIndex((x) => x.id === id);
        if (idx >= 0) {
          cart2[idx].qty = Math.max(1, cart2[idx].qty - 1);
          writeCart(cart2);
          renderCart();
        }
      })
    );

    cartTable.querySelectorAll("[data-remove]").forEach((b) =>
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-remove");
        const cart2 = readCart().filter((x) => x.id !== id);
        writeCart(cart2);
        renderCart();
      })
    );
  };

  if (cartTable) {
    renderCart();
    updateCartBadge();

    if (clearCartBtn) {
      clearCartBtn.addEventListener("click", () => {
        writeCart([]);
        renderCart();
      });
    }

    if (payNowBtn) {
      payNowBtn.addEventListener("click", () => {
        const cart = readCart();
        if (cart.length === 0) return;
        // Checkout dulu, metode pembayaran dipilih di halaman checkout.
        window.location.href = "checkout.html";
      });
    }
  }

  // Render Checkout page (checkout.html)
  const checkoutItemsEl = document.getElementById("checkoutItems");
  const checkoutTotalEl = document.getElementById("checkoutTotal");
  const checkoutPayBtn = document.getElementById("checkoutPayBtn");

  if (checkoutItemsEl && checkoutTotalEl) {
    const cart = readCart();
    if (cart.length === 0) {
      checkoutItemsEl.innerHTML = `<p class="hint">Keranjang kosong. <a href="packages.html">Pilih paket</a> dulu ya.</p>`;
    } else {
      checkoutItemsEl.innerHTML = cart
        .map(
          (it) => `
            <div class="checkout-item">
              <span>${it.name} <small class="hint">×${it.qty}</small></span>
              <strong>${rupiah(it.price * it.qty)}</strong>
            </div>
          `
        )
        .join("");
    }
    checkoutTotalEl.textContent = rupiah(cartTotal(cart));

    if (checkoutPayBtn) {
      checkoutPayBtn.addEventListener("click", () => {
        if (cart.length === 0) return;
        const slug = getDefaultSlug();
        if (!slug || slug === "ISI_SLUG_PAKASIR_MU") {
          alert("Slug Pakasir belum diisi. Buka file config.js lalu isi slug proyek Pakasir kamu.");
          return;
        }

        // Data pemesan (wajib)
        const nameEl = document.getElementById("customerName");
        const phoneEl = document.getElementById("customerPhone");
        const noteEl = document.getElementById("customerNote");

        const name = (nameEl?.value || "").trim();
        const phoneRaw = (phoneEl?.value || "").trim();
        const note = (noteEl?.value || "").trim();

        // Validasi sederhana untuk WA Indonesia: boleh mulai 08 / +62 / 62, min 9 digit.
        const phoneDigits = phoneRaw.replace(/[^0-9+]/g, "");
        const phoneNormalized = (() => {
          const p = phoneDigits;
          if (!p) return "";
          if (p.startsWith("+62")) return "62" + p.slice(3);
          if (p.startsWith("62")) return p;
          if (p.startsWith("08")) return "62" + p.slice(1);
          return p.replace(/^\+/, "");
        })();

        if (!name) {
          alert("Nama wajib diisi.");
          nameEl?.focus?.();
          return;
        }
        if (!phoneRaw) {
          alert("No. WhatsApp wajib diisi.");
          phoneEl?.focus?.();
          return;
        }
        if (!/^\d{9,15}$/.test(phoneNormalized)) {
          alert("Format No. WhatsApp tidak valid. Contoh: 08xxxxxxxxxx atau 62xxxxxxxxxxx");
          phoneEl?.focus?.();
          return;
        }

        storage.setItem("designap_customer_v1", JSON.stringify({ name, phone: phoneNormalized, note }));

        // Simpan snapshot paket yang dipesan (agar pesan WA menampilkan paket yang benar)
        try {
          storage.setItem("designap_order_items_v1", JSON.stringify(cart));
        } catch {
          // ignore
        }

        const method = document.querySelector('input[name="paymentMethod"]:checked')?.value || "qris";
        if (method !== "qris") {
          alert("Metode pembayaran belum tersedia. Silakan pilih QRIS.");
          return;
        }

        const amount = cartTotal(cart);
        const orderId = makeOrderId();
        goToPakasir({ slug, amount, orderId });
      });
    }
  }

  // Render success page (payment-success.html)
  const successOrderIdEl = document.getElementById("successOrderId");
  const successAmountEl = document.getElementById("successAmount");
  if (successOrderIdEl && successAmountEl) {
    try {
            const meta = JSON.parse(storage.getItem(META_KEY) || "{}") || {};
      const customer = JSON.parse(storage.getItem("designap_customer_v1") || "{}") || {};

      successOrderIdEl.textContent = meta.orderId || "-";
      successAmountEl.textContent = meta.amount ? rupiah(meta.amount) : "-";

      const successNameEl = document.getElementById("successName");
      const successPhoneEl = document.getElementById("successPhone");
      if (successNameEl) successNameEl.textContent = customer.name || "-";
      if (successPhoneEl) successPhoneEl.textContent = customer.phone || "-";

      const waBtn = document.getElementById("waConfirmBtn");
      if (waBtn) {
        const phone = "62895422144701";
        const orderId = meta.orderId || "-";
        const amountText = meta.amount ? rupiah(meta.amount) : "-";
        const customerName = customer.name || "-";
        const customerPhone = customer.phone || "-";

        // Ambil paket yang dipesan (dari snapshot checkout, fallback ke keranjang saat ini)
        let orderItems = [];
        try {
          orderItems = JSON.parse(storage.getItem("designap_order_items_v1") || "[]") || [];
        } catch {
          orderItems = [];
        }
        if (!Array.isArray(orderItems) || orderItems.length === 0) {
          orderItems = readCart();
        }
        const itemsLines = Array.isArray(orderItems) && orderItems.length
          ? orderItems.map((it) => `- ${it.name} ×${it.qty || 1}`).join("\n")
          : "-";

        const rawMsg = `Halo Admin Desainap, saya sudah melakukan pembayaran via QRIS.
Nama: ${customerName}
No. WhatsApp: ${customerPhone}
Order ID: ${orderId}
Nominal: ${amountText}
Paket yang dipesan:
${itemsLines}
Mohon diproses. Terima kasih.`;
        waBtn.href = `https://wa.me/${phone}?text=${encodeURIComponent(rawMsg)}`;
        if (!meta.orderId || !meta.amount) {
          waBtn.classList.add("disabled");
        }
      }
    } catch {
      // ignore
    }
  }

  updateCartBadge();
});
