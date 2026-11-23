"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page not-found-page">
      <div className="not-found-mark">!</div>
      <div className="not-found-copy">
        <p className="eyebrow">Ошибка загрузки</p>
        <h1>Страница не открылась</h1>
        <p className="lede">
          Попробуйте обновить. Если ошибка повторяется, вернитесь на главную
          и откройте раздел заново.
        </p>
        {error.digest && <p className="account-email">код: {error.digest}</p>}
        <div className="not-found-actions">
          <button type="button" onClick={reset} className="btn btn-primary">
            Попробовать снова
          </button>
          <Link href="/" className="btn btn-secondary">
            На главную <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
