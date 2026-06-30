const navbar = document.getElementById("navbar");
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const menuIconOpen = document.getElementById("menu-icon-open");
const menuIconClose = document.getElementById("menu-icon-close");
const feedbackForm = document.getElementById("feedback-form");
const feedbackList = document.getElementById("feedback-list");
const feedbackEmpty = document.getElementById("feedback-empty");
const submitBtn = document.getElementById("submit-btn");
const starButtons = document.querySelectorAll(".star-btn");
const ratingInput = document.getElementById("rating");
const ratingLabel = document.getElementById("rating-label");
const toast = document.getElementById("toast");

let selectedRating = 0;
let toastTimer = null;

const ratingLabels = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Excellent",
};

function handleScroll() {
  if (window.scrollY > 40) {
    navbar.classList.add("border-white/10", "bg-ink-950/90", "backdrop-blur-md", "shadow-lg");
  } else {
    navbar.classList.remove("border-white/10", "bg-ink-950/90", "backdrop-blur-md", "shadow-lg");
  }
}

window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll();

function closeMobileMenu() {
  mobileMenu.classList.add("hidden");
  menuIconOpen.classList.remove("hidden");
  menuIconClose.classList.add("hidden");
  menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("hidden") === false;
  menuIconOpen.classList.toggle("hidden", isOpen);
  menuIconClose.classList.toggle("hidden", !isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".mobile-nav-link").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

function setRating(value) {
  selectedRating = value;
  ratingInput.value = String(value);
  ratingLabel.textContent = ratingLabels[value] || "Click to rate";

  starButtons.forEach((btn) => {
    const starValue = Number(btn.dataset.value);
    btn.classList.toggle("active", starValue <= value);
  });
}

starButtons.forEach((btn) => {
  btn.addEventListener("click", () => setRating(Number(btn.dataset.value)));

  btn.addEventListener("mouseenter", () => {
    const hoverValue = Number(btn.dataset.value);
    starButtons.forEach((b) => {
      b.classList.toggle("active", Number(b.dataset.value) <= hoverValue);
    });
  });

  btn.addEventListener("mouseleave", () => {
    starButtons.forEach((b) => {
      b.classList.toggle("active", Number(b.dataset.value) <= selectedRating);
    });
  });
});

function showToast(message, type = "success") {
  if (toastTimer) clearTimeout(toastTimer);

  toast.textContent = message;
  toast.className =
    "pointer-events-none fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border px-5 py-4 shadow-2xl toast-enter " +
    (type === "success"
      ? "border-emerald-500/30 bg-emerald-950/90 text-emerald-200"
      : "border-red-500/30 bg-red-950/90 text-red-200");

  toastTimer = setTimeout(() => {
    toast.classList.replace("toast-enter", "toast-exit");
    setTimeout(() => {
      toast.classList.add("hidden");
      toast.classList.remove("toast-exit");
    }, 350);
  }, 4000);
}

function renderStars(count) {
  return "★".repeat(count) + "☆".repeat(5 - count);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function createFeedbackCard(entry) {
  const card = document.createElement("article");
  card.className = "glass-card p-6 animate-fade-up";
  card.innerHTML = `
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="font-semibold text-white">${escapeHtml(entry.name)}</p>
        <p class="mt-1 text-xs tracking-wide text-amber-400">${renderStars(entry.rating)}</p>
      </div>
      <time class="shrink-0 text-xs text-gray-500">${formatDate(entry.createdAt)}</time>
    </div>
    <p class="mt-3 text-sm leading-relaxed text-gray-400">${escapeHtml(entry.message)}</p>
  `;
  return card;
}

async function loadFeedback() {
  try {
    const res = await fetch("/api/feedback");
    const data = await res.json();
    const entries = data.feedback || [];

    feedbackList.querySelectorAll("article").forEach((el) => el.remove());

    if (entries.length === 0) {
      feedbackEmpty.classList.remove("hidden");
      return;
    }

    feedbackEmpty.classList.add("hidden");
    entries.forEach((entry) => {
      feedbackList.appendChild(createFeedbackCard(entry));
    });
  } catch {
    /* form still works if fetch fails */
  }
}

feedbackForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!selectedRating) {
    showToast("Please select a star rating.", "error");
    return;
  }

  const formData = {
    name: document.getElementById("feedback-name").value,
    email: document.getElementById("feedback-email").value,
    rating: selectedRating,
    message: document.getElementById("feedback-message").value,
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "Something went wrong.", "error");
      return;
    }

    showToast(data.message || "Feedback submitted!", "success");
    feedbackForm.reset();
    setRating(0);
    ratingLabel.textContent = "Click to rate";

    if (data.feedback) {
      feedbackEmpty.classList.add("hidden");
      feedbackList.prepend(createFeedbackCard(data.feedback));
    }
  } catch {
    showToast("Could not connect to server. Is it running?", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Feedback";
  }
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const targetId = anchor.getAttribute("href");
    if (targetId === "#") return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    closeMobileMenu();
  });
});

const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const contactName = document.getElementById("name").value.trim();
    const contactEmail = document.getElementById("email").value.trim();
    const contactMessage = document.getElementById("message").value.trim();
    if (!contactName || !contactEmail || !contactMessage) {
      showToast("Please fill in all fields.", "error");
      return;
    }
    showToast("Thank you! Your message has been sent.", "success");
    contactForm.reset();
  });
}

loadFeedback();
