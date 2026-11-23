"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard может быть недоступен */
    }
  }

  return (
    <div className="group relative my-5 overflow-hidden border border-[#2a2f3a] bg-[#0f1115]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="font-mono text-[0.65rem] uppercase tracking-wider text-white/35">
          {lang}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded px-1.5 py-1 text-[0.65rem] text-white/40 transition-colors hover:text-white/80"
          aria-label="Скопировать код"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          {copied ? "Скопировано" : "Копировать"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[0.82rem] leading-relaxed text-[#d7dae3]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
