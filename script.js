const portfolio = {
  name: "Shreyas Srikanth",
  role: "Engineering Student | Aspiring Software Developer",
  email: "shreyassrikanth0711@gmail.com",
  phone: "+91 9108750711"
};

const loader = document.querySelector("#loader");
const progress = document.querySelector("#scrollProgress");
const cursorCanvas = document.querySelector("#cursorCanvas");
const cursorDot = document.querySelector(".cursor-dot");
const ctx = cursorCanvas.getContext("2d");

let width = 0;
let height = 0;
let pointer = { x: innerWidth / 2, y: innerHeight / 2 };
let trail = Array.from({ length: 34 }, () => ({ ...pointer }));
let cursorHover = false;

function resizeCanvas() {
  width = cursorCanvas.width = innerWidth * devicePixelRatio;
  height = cursorCanvas.height = innerHeight * devicePixelRatio;
  cursorCanvas.style.width = `${innerWidth}px`;
  cursorCanvas.style.height = `${innerHeight}px`;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function drawCursorRibbon() {
  ctx.clearRect(0, 0, width, height);

  trail[0].x += (pointer.x - trail[0].x) * 0.22;
  trail[0].y += (pointer.y - trail[0].y) * 0.22;

  for (let i = 1; i < trail.length; i += 1) {
    trail[i].x += (trail[i - 1].x - trail[i].x) * 0.22;
    trail[i].y += (trail[i - 1].y - trail[i].y) * 0.22;
  }

  ctx.beginPath();
  ctx.moveTo(trail[0].x, trail[0].y);
  for (let i = 1; i < trail.length - 2; i += 1) {
    const xc = (trail[i].x + trail[i + 1].x) / 2;
    const yc = (trail[i].y + trail[i + 1].y) / 2;
    ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
  }

  const gradient = ctx.createLinearGradient(pointer.x - 120, pointer.y, pointer.x + 120, pointer.y);
  gradient.addColorStop(0, "rgba(235, 235, 235, 0)");
  gradient.addColorStop(0.45, cursorHover ? "rgba(204, 255, 0, 0.42)" : "rgba(235, 235, 235, 0.28)");
  gradient.addColorStop(1, "rgba(16, 185, 129, 0)");
  ctx.strokeStyle = gradient;
  ctx.lineWidth = cursorHover ? 22 : 14;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  if (cursorDot) {
    cursorDot.style.left = `${pointer.x}px`;
    cursorDot.style.top = `${pointer.y}px`;
  }

  requestAnimationFrame(drawCursorRibbon);
}

function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  const amount = scrollable > 0 ? (scrollY / scrollable) * 100 : 0;
  progress.style.width = `${amount}%`;
}

function observeReveals() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

function animateCounters() {
  const counters = document.querySelectorAll("[data-count]");
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = Number(entry.target.dataset.count);
      const start = performance.now();
      const duration = 1200;

      function tick(now) {
        const progressAmount = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progressAmount, 3);
        entry.target.textContent = Math.round(target * eased);
        if (progressAmount < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  counters.forEach((counter) => counterObserver.observe(counter));
}

function setupMagneticButtons() {
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
}

function setupTiltCards() {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1000px) rotateX(${y * -7}deg) rotateY(${x * 9}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

function setupCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const original = button.textContent;
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        button.textContent = "Copied";
      } catch {
        button.textContent = button.dataset.copy;
      }
      setTimeout(() => {
        button.textContent = original;
      }, 1400);
    });
  });
}

function setupContactForm() {
  const form = document.querySelector("#contactForm");
  const status = document.querySelector("#formStatus");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "Message packet staged. Opening email client...";
    const data = new FormData(form);
    const subject = encodeURIComponent(`Portfolio inquiry from ${data.get("name")}`);
    const body = encodeURIComponent(`${data.get("message")}\n\nFrom: ${data.get("name")} <${data.get("email")}>`);
    setTimeout(() => {
      location.href = `mailto:${portfolio.email}?subject=${subject}&body=${body}`;
      form.reset();
    }, 550);
  });
}

function setupCursorInteractions() {
  addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }, { passive: true });

  document.querySelectorAll("a, button, input, textarea, [data-tilt]").forEach((el) => {
    el.addEventListener("pointerenter", () => {
      cursorHover = true;
      cursorDot?.classList.add("hover");
    });
    el.addEventListener("pointerleave", () => {
      cursorHover = false;
      cursorDot?.classList.remove("hover");
    });
  });
}

addEventListener("load", () => {
  setTimeout(() => loader.classList.add("hidden"), 650);
});

addEventListener("resize", resizeCanvas);
addEventListener("scroll", updateScrollProgress, { passive: true });

document.addEventListener("DOMContentLoaded", () => {
  resizeCanvas();
  drawCursorRibbon();
  updateScrollProgress();
  observeReveals();
  animateCounters();
  setupMagneticButtons();
  setupTiltCards();
  setupCopyButtons();
  setupContactForm();
  setupCursorInteractions();
});
