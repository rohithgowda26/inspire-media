import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
      <p className="text-[13px] font-semibold text-electric">Error 404</p>
      <h1 className="text-silver text-5xl font-semibold tracking-[-0.035em] sm:text-7xl">Page not found</h1>
      <p className="text-mist">The link may be broken, or the page may have moved.</p>
      <Link
        href="/"
        className="btn btn-white mt-2"
      >
        Back to home
      </Link>
    </main>
  );
}
