/* =========================================================
   Travelly — interactions + GSAP animations

   Rule followed throughout: the page must look complete
   WITHOUT JavaScript. Animations use gsap.from(), which
   starts from a hidden state and ends at the CSS state, so
   if GSAP never loads nothing stays invisible.
   ========================================================= */

const hasGSAP = typeof window.gsap !== "undefined";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

/* ---------- Footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Announcement bar ---------- */
document.getElementById("announceClose").addEventListener("click", () => {
  document.body.classList.add("no-announce");
  // Layout shifted up, so pinned sections must recalculate their positions
  if (hasGSAP) ScrollTrigger.refresh();
});

/* ---------- Navbar: solid background once you scroll ---------- */
const nav = document.getElementById("nav");
const updateNav = () => nav.classList.toggle("nav--scrolled", window.scrollY > 40);
updateNav();
window.addEventListener("scroll", updateNav, { passive: true });

/* ---------- Mobile menu ---------- */
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

function setMenu(open) {
  navMenu.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.style.overflow = open ? "hidden" : "";
  // backdrop-filter on the nav would trap the fixed overlay inside the nav bar
  nav.style.backdropFilter = open ? "none" : "";

  if (open && hasGSAP && !prefersReducedMotion) {
    gsap.from(navMenu.children, { y: 30, opacity: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" });
  }
}

navToggle.addEventListener("click", () => setMenu(!navMenu.classList.contains("is-open")));
navMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navMenu.classList.contains("is-open")) setMenu(false);
});

/* ---------- Reviews carousel ---------- */
(function carousel() {
  const track = document.getElementById("carouselTrack");
  const viewport = track.parentElement;
  const cards = Array.from(track.children);
  const dotsWrap = document.getElementById("carouselDots");
  let index = 0;
  let timer = null;

  const step = () => cards[1].offsetLeft - cards[0].offsetLeft; // card width + gap
  const perView = () => Math.max(1, Math.round(viewport.clientWidth / step()));
  const maxIndex = () => Math.max(0, cards.length - perView());

  function renderDots() {
    dotsWrap.innerHTML = "";
    for (let i = 0; i <= maxIndex(); i++) {
      const dot = document.createElement("span");
      if (i === index) dot.classList.add("is-active");
      dotsWrap.appendChild(dot);
    }
  }

  function goTo(i, instant = false) {
    const max = maxIndex();
    index = i > max ? 0 : i < 0 ? max : i; // wrap around at both ends
    const x = -index * step();

    if (hasGSAP && !prefersReducedMotion && !instant) {
      gsap.to(track, { x, duration: 0.7, ease: "power3.out" });
    } else if (hasGSAP) {
      gsap.set(track, { x });
    } else {
      track.style.transform = `translateX(${x}px)`;
    }
    Array.from(dotsWrap.children).forEach((d, n) => d.classList.toggle("is-active", n === index));
  }

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  document.getElementById("nextBtn").addEventListener("click", () => { next(); restart(); });
  document.getElementById("prevBtn").addEventListener("click", () => { prev(); restart(); });

  // Autoplay, paused while the user hovers or focuses inside the carousel
  function start() { if (!prefersReducedMotion) timer = setInterval(next, 5000); }
  function stop() { clearInterval(timer); }
  function restart() { stop(); start(); }

  const root = document.getElementById("carousel");
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", start);

  // Basic swipe support for touch screens
  let startX = null;
  viewport.style.touchAction = "pan-y";
  viewport.addEventListener("pointerdown", (e) => { startX = e.clientX; });
  viewport.addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); restart(); }
    startX = null;
  });

  // Cards change width at breakpoints, so re-measure on resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { renderDots(); goTo(Math.min(index, maxIndex()), true); }, 150);
  });

  renderDots();
  start();
})();

/* ---------- Contact form (front-end only demo) ---------- */
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = form.elements.name;
  const email = form.elements.email;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());

  name.classList.toggle("is-invalid", !name.value.trim());
  email.classList.toggle("is-invalid", !emailOk);

  if (!name.value.trim() || !emailOk) {
    statusEl.textContent = "Please add your name and a valid email address.";
    statusEl.className = "form__status is-error";
    return;
  }

  const firstName = name.value.trim().split(" ")[0];
  statusEl.textContent = `Thanks, ${firstName}! This is a demo form, so nothing was sent, but on a live site an advisor would reply within 24 hours.`;
  statusEl.className = "form__status is-success";
  form.reset();
});

document.getElementById("newsletter").addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button");
  btn.textContent = "Subscribed ✓";
  e.target.reset();
  setTimeout(() => { btn.textContent = "Subscribe"; }, 3000);
});

/* =========================================================
   GSAP ANIMATIONS
   gsap.matchMedia() runs each block only when its media
   query matches, and automatically reverts it when it
   stops matching (e.g. resizing desktop -> mobile).
   ========================================================= */
if (hasGSAP) {
  const mm = gsap.matchMedia();

  /* ----- Everything except the pinned scroll: all screen sizes ----- */
  mm.add("(prefers-reduced-motion: no-preference)", () => {

    // 1. Intro timeline — plays once on page load
    const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
    intro
      .from(".hero__img", { scale: 1.25, duration: 2.2, ease: "power2.out" })
      .from(".nav", { yPercent: -100, opacity: 0, duration: 1 }, 0.2)
      .from(".hero__eyebrow", { y: 20, opacity: 0, duration: 0.8 }, 0.4)
      .from(".hero__title .line__inner", { yPercent: 110, duration: 1.2, stagger: 0.12 }, 0.5)
      .from(".hero__text", { y: 30, opacity: 0, duration: 1 }, 0.9)
      .from(".hero__actions .btn", { y: 30, opacity: 0, duration: 0.8, stagger: 0.1 }, 1.05)
      .from(".hero__scroll", { opacity: 0, duration: 1 }, 1.4);

    // 2. Hero parallax — image drifts slower than the page, content fades away
    gsap.to(".hero__img", {
      yPercent: 12,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(".hero__content", {
      y: -80,
      opacity: 0,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "70% top", scrub: true },
    });

    // 3. Generic reveal — any element with .reveal fades up when it enters
    gsap.utils.toArray(".reveal").forEach((el) => {
      gsap.from(el, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    // 4. Feature cards — staggered rise
    gsap.from(".feature", {
      y: 70,
      opacity: 0,
      duration: 1,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: { trigger: ".features__grid", start: "top 82%" },
    });

    // 5. Image "curtain" reveal on split sections
    gsap.utils.toArray(".clip-reveal").forEach((wrap) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: "top 80%" } });
      tl.fromTo(wrap,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power4.inOut" })
        .from(wrap.querySelector("img"), { scale: 1.3, duration: 1.6, ease: "power3.out" }, 0);
    });

    // 6. Stat counters — count up from 0
    gsap.utils.toArray("[data-count]").forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const suffix = el.dataset.suffix || "";
      const counter = { value: 0 };

      gsap.to(counter, {
        value: target,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
        onUpdate: () => {
          el.textContent = counter.value.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }) + suffix;
        },
      });
    });

    // 7. Instalment plans pop in
    gsap.from(".plan", {
      y: 30,
      opacity: 0,
      scale: 0.9,
      duration: 0.7,
      stagger: 0.1,
      ease: "back.out(1.7)",
      scrollTrigger: { trigger: ".plans", start: "top 88%" },
    });

    // 8. Review cards slide in
    gsap.from(".review", {
      x: 60,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: { trigger: ".carousel", start: "top 85%" },
    });

    // 9. CTA background parallax
    gsap.fromTo(".cta__img",
      { yPercent: -10 },
      { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true } });

    gsap.from(".form", {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".cta", start: "top 70%" },
    });

    // 10. Footer columns
    gsap.from(".footer__cols > div, .footer__brand", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: { trigger: ".footer", start: "top 85%" },
    });
  });

  /* ----- Desktop only: pinned horizontal scroll for destinations ----- */
  mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
    const track = document.getElementById("destTrack");
    const distance = () => track.scrollWidth - window.innerWidth;

    // The section sticks to the screen while vertical scrolling moves the track sideways
    const slide = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: ".destinations",
        start: "top top",
        end: () => "+=" + distance(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true, // recompute distance() on resize
      },
    });

    // Each card gently lifts as it travels across the screen
    gsap.utils.toArray(".dest").forEach((card) => {
      gsap.from(card, {
        y: 80,
        rotate: 3,
        opacity: 0.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          containerAnimation: slide, // position is measured along the horizontal tween
          start: "left 95%",
          end: "left 60%",
          scrub: true,
        },
      });
    });
  });

  // Fonts and lazy images change element heights, so re-measure once everything has loaded
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
