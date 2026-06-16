export function Footer() {
  return (
    <footer className="border-t border-hairline py-12 px-6 lg:px-12">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-ink tracking-tight">BulkMail</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <a href="#features" className="text-xs text-muted hover:text-ink transition-colors">Features</a>
          <a href="#how-it-works" className="text-xs text-muted hover:text-ink transition-colors">How it Works</a>
          <a href="#providers" className="text-xs text-muted hover:text-ink transition-colors">Providers</a>
        </div>

        {/* Copyright */}
        <p className="text-xs text-muted-soft">
          © {new Date().getFullYear()} BulkMail. Open-source.
        </p>
      </div>
    </footer>
  );
}
