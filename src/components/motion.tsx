"use client";

import { useEffect } from "react";

/**
 * Global motion layer: scroll reveals, pointer tilt, parallax, counters,
 * scroll progress. Mounted once per app; it listens to DOM changes so it
 * keeps working after client-side navigation in both the Next build and
 * the single-file offline build.
 */
export function MotionLayer() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      document.documentElement.dataset.motion = "reduced";
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) => {
        node.classList.add("is-in");
      });
      return;
    }

    const revealed = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const node = entry.target as HTMLElement;
          node.classList.add("is-in");
          revealed.add(node);
          io.unobserve(node);
          if (node.dataset.count) countUp(node);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const observeReveals = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach((node) => {
        if (revealed.has(node)) return;
        io.observe(node);
      });
    };

    function countUp(node: HTMLElement) {
      const target = Number(node.dataset.count ?? "0");
      const suffix = node.dataset.countSuffix ?? "";
      const duration = 900;
      const start = performance.now();
      const from = 0;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        node.textContent = `${Math.round(from + (target - from) * eased)}${suffix}`;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    // Pointer tilt: elements marked data-tilt rotate toward the cursor.
    let tiltFrame = 0;
    let tiltNode: HTMLElement | null = null;
    let tiltX = 0;
    let tiltY = 0;

    function applyTilt() {
      tiltFrame = 0;
      if (!tiltNode) return;
      tiltNode.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
      tiltNode.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
      tiltNode.style.setProperty("--tilt-px", `${((tiltX / 12) * 50 + 50).toFixed(1)}%`);
      tiltNode.style.setProperty("--tilt-py", `${((-tiltY / 12) * 50 + 50).toFixed(1)}%`);
    }

    function onPointerMove(event: PointerEvent) {
      const target = (event.target as Element | null)?.closest<HTMLElement>("[data-tilt]");
      if (!target) {
        if (tiltNode) {
          tiltNode.style.setProperty("--tilt-x", "0deg");
          tiltNode.style.setProperty("--tilt-y", "0deg");
          tiltNode = null;
        }
        return;
      }
      const rect = target.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      tiltX = (py - 0.5) * -11;
      tiltY = (px - 0.5) * 13;
      target.style.setProperty("--pointer-x", `${(px * 100).toFixed(1)}%`);
      target.style.setProperty("--pointer-y", `${(py * 100).toFixed(1)}%`);
      tiltNode = target;

      // Hero parallax children.
      const stage = (event.target as Element | null)?.closest<HTMLElement>("[data-stage]");
      if (stage) {
        stage.style.setProperty("--stage-x", `${(px - 0.5).toFixed(3)}`);
        stage.style.setProperty("--stage-y", `${(py - 0.5).toFixed(3)}`);
      }

      if (!tiltFrame) tiltFrame = requestAnimationFrame(applyTilt);
    }

    function onPointerLeave(event: PointerEvent) {
      const target = (event.target as Element | null)?.closest<HTMLElement>("[data-tilt]");
      if (!target) return;
      target.style.setProperty("--tilt-x", "0deg");
      target.style.setProperty("--tilt-y", "0deg");
    }

    // Scroll progress + header state.
    let scrollFrame = 0;
    function onScroll() {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? window.scrollY / max : 0;
        document.documentElement.style.setProperty("--scroll", progress.toFixed(4));
        document.documentElement.dataset.scrolled = window.scrollY > 24 ? "true" : "false";
      });
    }

    observeReveals();
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerout", onPointerLeave, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const mo = new MutationObserver(() => observeReveals());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      if (tiltFrame) cancelAnimationFrame(tiltFrame);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
    };
  }, []);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
