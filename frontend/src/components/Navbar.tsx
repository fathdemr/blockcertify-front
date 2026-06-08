import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { label: 'Hakkımızda', href: '#about' },
  { label: 'Nasıl Çalışır', href: '#how' },
  { label: 'Doğrulama', href: '/dogrula' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const isDark = pathname === '/';
  const [open, setOpen] = useState(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 ${
        isDark
          ? 'glass-dark border-b border-white/10'
          : 'glass border-b border-outline-variant/30'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <ShieldCheck className="w-6 h-6 text-on-tertiary-container" />
          <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-on-surface'}`}>
            BlockCertify
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className={`text-sm font-medium transition-colors ${
                isDark
                  ? 'text-white/70 hover:text-white'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/giris"
            className={`hidden md:inline-flex px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              isDark
                ? 'bg-white text-primary hover:bg-white/90'
                : 'bg-primary text-on-primary hover:bg-primary/90'
            }`}
          >
            Giriş Yap
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isDark ? 'text-white hover:bg-white/10' : 'text-on-surface hover:bg-surface'
            }`}
            aria-label="Menüyü aç/kapat"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className={`md:hidden border-t ${
            isDark ? 'bg-primary-container border-white/10' : 'bg-white border-outline-variant/20'
          }`}
        >
          <div className="px-6 py-4 flex flex-col">
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className={`py-3 text-sm font-medium border-b last:border-0 ${
                  isDark
                    ? 'text-white/80 border-white/10'
                    : 'text-on-surface-variant border-outline-variant/20'
                }`}
              >
                {label}
              </a>
            ))}
            <Link
              to="/giris"
              onClick={() => setOpen(false)}
              className={`mt-4 py-3 rounded-lg text-sm font-semibold text-center ${
                isDark ? 'bg-white text-primary' : 'bg-primary text-on-primary'
              }`}
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
