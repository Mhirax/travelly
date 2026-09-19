# Travelly ✈️

A travel agency landing page built as a project. It uses plain **HTML, CSS and JavaScript**, with **GSAP** for the animations.

> Travelly is a fictional brand. The reviews, prices and stats are placeholder content.

**Live demo:** https://mhirax.github.io/travelly/

## Sections

1. Announcement bar you can close + a navbar that turns solid when you scroll (full-screen menu on mobile)
2. Full-screen hero with a line-by-line headline reveal and a parallax background
3. "Why Travelly" feature cards
4. **Destinations**: on desktop the section pins in place and the cards scroll sideways as you scroll down; on mobile you swipe through them
5. Advisors section with a clip-path image reveal and counters that count up
6. Group trips band
7. Instalment payment plans
8. Reviews carousel (arrows, swipe, dots, autoplay that pauses on hover)
9. Contact form with client-side validation (front-end only; it doesn't send anything)
10. Footer with a newsletter form

## GSAP techniques used

| Technique | Where |
|---|---|
| `gsap.timeline()` intro sequence | Hero on page load |
| Masked line reveal (`overflow: hidden` + `yPercent`) | Hero headline |
| `ScrollTrigger` with `scrub` (parallax) | Hero image, CTA background |
| `ScrollTrigger` with `pin` + horizontal tween | Destinations |
| `containerAnimation` | Destination cards animating inside the horizontal scroll |
| `clipPath` tweens | Split-section images |
| Tweening a plain object for counters | Stats |
| `gsap.matchMedia()` | Desktop-only pinning and `prefers-reduced-motion` support |

## Accessibility & resilience

- All animations use `gsap.from()`, so if JavaScript or the CDN fails the page still shows all its content.
- Animations are turned off for users with **reduced motion** enabled in their OS.
- Semantic landmarks, alt text on every image, visible focus styles, and the mobile menu closes with Esc.

## Run locally

No build step. Open `index.html` in a browser, or use the VS Code **Live Server** extension.

## Credits

Photos from [Unsplash](https://unsplash.com) (free to use under the Unsplash License).
Fonts: Playfair Display & Poppins (Google Fonts). Animation: [GSAP](https://gsap.com).
