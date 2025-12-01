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
});
