# HabitTracker — Case Study

**A cross-platform habit-tracking app built end-to-end with an AI-assisted workflow — from first screen to an accessible, tested, production-ready build.**

Role: Product design, UX, and technical direction
Stack: React Native (Expo SDK 56), TypeScript, Zustand, React Navigation, react-native-svg, react-native-reanimated
Platforms: iOS & Android (single codebase)

---

## Overview

HabitTracker is a personal habit-tracking app: create habits, mark them done daily, watch streaks and completion rates build over time, and get reminded before you forget. It was built as a self-directed project to practice a real freelance workflow end to end — scoping, building, iterating on design feedback, and shipping something polished enough to hand to a client — rather than stopping at a rough prototype.

The project intentionally covered the parts of app development that are easy to skip in a portfolio piece: state persistence that survives app restarts, notification scheduling that doesn't leak duplicates after dozens of edits, screen-reader accessibility, and a full visual identity — not just a working demo, but something that could pass a real design and QA review.

## The problem

Most personal "todo" or "streak" apps either look generic (a default component-library aesthetic) or cut corners on the boring-but-critical stuff: what happens when someone renames a habit to something 40 characters long, restores an old backup, or turns notifications on and off ten times in a row? The goal was to build something that felt considered in both directions — a distinct visual identity, and an implementation that holds up under real, slightly messy usage.

## Process

**1. Core product, built screen by screen.**
Today view, habit list, add/edit flow, calendar heatmap, stats, and settings were built first as a complete, working loop: add a habit, mark it done, see a streak and a monthly heatmap update. Every screen was planned before being handed off for implementation, so each stage of work had a clear, testable definition of "done" rather than an open-ended build.

**2. Engagement layer.**
Local notification reminders (with correct per-weekday scheduling, not just a daily default), streak and achievement tracking ("7 Day Streak," "30 Day Streak," "Early Bird"), and a JSON export/import so a user's data isn't trapped on one device.

**3. Visual identity redesign — "Strata."**
Partway through, the app's original warm, generic "flame" palette was fully retired in favor of a custom identity called **Strata**, built around the app's own progress-ring motif reinterpreted as layered mineral rings — a visual idea grounded in the product itself rather than a trend-chasing palette swap. That included:
- A new dark-first color system (cool ink background, sage-teal primary, warm gold/rust accent pair) applied consistently across all 11 screens, light and dark mode both.
- A custom logomark (4 concepts explored, one selected and refined) and a new type pairing (Zilla Slab for display, IBM Plex Sans for body text).
- A redesigned launch/splash screen and app icon, including hand-generated, supersampled icon assets for both Android's adaptive-icon format and iOS.
- A design system audit that caught and fixed a real regression along the way: a progress ring left over from the old palette that would have visually contradicted the new identity if it had shipped.

**4. Accessibility pass.**
Every interactive element that relied purely on color or an icon — completion toggles, emoji/color pickers, calendar day cells, icon-only buttons — got proper screen-reader roles, labels, and state. Decorative icons next to already-labeled text were explicitly hidden from screen readers instead of adding noise.

**5. QA and edge-case hardening.**
A dedicated pass through boundary conditions: long habit names truncate instead of breaking layouts, lists that could theoretically render hundreds of habits are virtualized instead of rendered all at once, and reminder scheduling was proven — via targeted regression tests, not just manual spot checks — to never leak duplicate scheduled notifications no matter how many times a habit's time or weekday selection is edited.

## Design decisions worth calling out

**The identity came from the product, not a mood board.** Rather than picking a currently-fashionable palette, the Strata concept was built by asking what the app's own core visual — the completion ring — could mean if taken further: sediment, growth, layers building up over time. That's the same idea the habit-tracking mechanic itself is built on.

**Distinct colors were treated as a constraint, not a preference.** During the palette redesign, a specific rule was enforced: the primary accent and the two "flame" gradient colors had to stay visibly distinct from each other. This wasn't arbitrary — an earlier version of the app had let two of those colors converge, which made a "today" indicator on the calendar physically disappear against a fully-lit cell. The new palette was built so that failure mode couldn't recur.

**Native builds were treated as part of the design process, not an afterthought.** Two visual bugs only showed up after code was "done" — a stale native splash screen and a missing native module — both traced to how Expo's custom dev-client model handles native config versus JS changes, and both fixed with the right rebuild step rather than a workaround.

## Outcome

The result is a fully working, installable app with:
- A cohesive, original visual identity (not a template or starter-kit look)
- Offline-first local state that survives restarts, backups, and restores
- Screen-reader accessibility across every interactive surface
- Automated regression coverage for the one area (notification scheduling) most likely to silently break under real-world editing
- A build process that's been verified against a real device at every stage, not just reviewed as a diff

This project was built specifically to demonstrate a freelance-ready working style: scoping work into clear stages, catching and fixing real regressions before they ship, and treating accessibility and edge cases as part of the job rather than nice-to-haves.

---

*Built by Danil. Get in touch: dkolesnik569@gmail.com*
