"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle, LogIn, Menu, PhoneCall, X } from "lucide-react";
import { useEffect, useState } from "react";

import { clearSession, getSession } from "@/lib/auth/session";

const navItems = [
  { href: "#beranda", label: "Beranda" },
  { href: "/lapor", label: "Lapor" },
  { href: "#layanan", label: "Layanan" },
  { href: "#peta", label: "Peta Rawan" },
  { href: "#kontak", label: "Kontak" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const hideNavbar = pathname?.startsWith("/dashboard");
  const session = getSession();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(
    pathname === "/lapor" ? "/lapor" : navItems[0].href,
  );

  const resolveHref = (href: string) => {
    if (!href.startsWith("#")) {
      return href;
    }
    return pathname === "/" ? href : `/${href}`;
  };

  useEffect(() => {
    const updateNavbarState = () => {
      setScrolled(window.scrollY > 12);

      if (pathname !== "/") {
        setActiveSection(pathname === "/lapor" ? "/lapor" : navItems[0].href);
        return;
      }

      const sectionNavItems = navItems.filter((item) => item.href.startsWith("#"));

      const currentSection = sectionNavItems.reduce((active, item) => {
        const sectionId = item.href.replace("#", "");
        const section = document.getElementById(sectionId);

        if (section && window.scrollY + 150 >= section.offsetTop) {
          return item.href;
        }

        return active;
      }, navItems[0].href);

      setActiveSection(currentSection);
    };

    const closeOnDesktop = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("scroll", updateNavbarState, { passive: true });
    window.addEventListener("resize", closeOnDesktop);

    return () => {
      window.removeEventListener("scroll", updateNavbarState);
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navItemClass = (href: string) =>
    activeSection === href
      ? "bg-primary text-white shadow-[0_8px_20px_rgba(175,16,26,0.32)]"
      : "text-slate-700 hover:bg-slate-100";

  const dashboardHref =
    session?.user.role === "officer" ? "/dashboard/officer" : "/dashboard";

  const handleLogout = () => {
    clearSession();
    setMobileOpen(false);
    router.push("/");
  };

  if (hideNavbar) {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-500 ${
        scrolled
          ? "border-white/60 bg-white/90 shadow-[0_12px_35px_rgba(15,23,42,0.12)] backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5">
        <Link
          href={resolveHref("#beranda")}
          className="group flex items-center gap-3"
          onClick={() => setActiveSection("#beranda")}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/35 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
              Emergency Network
            </p>
            <p className="text-lg font-extrabold tracking-tight text-slate-900">
              ResponCepat
            </p>
          </div>
        </Link>

        <ul className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-white/75 p-1.5 backdrop-blur md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={resolveHref(item.href)}
                onClick={() => setActiveSection(item.href)}
                className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${navItemClass(item.href)}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <>
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary transition hover:-translate-y-0.5 hover:bg-secondary/15"
              >
                <LogIn className="h-4 w-4" />
                Buka Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-100"
              >
                Keluar
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary transition hover:-translate-y-0.5 hover:bg-secondary/15"
            >
              <LogIn className="h-4 w-4" />
              Login Petugas
            </Link>
          )}
          <Link
            href="tel:112"
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary-container shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:opacity-95"
          >
            <PhoneCall className="h-4 w-4" />
            Hubungi 112
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((previous) => !previous)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-900 transition hover:bg-slate-50 md:hidden"
          aria-expanded={mobileOpen}
          aria-label="Buka menu navigasi"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-500 md:hidden ${
          mobileOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="nav-slide mx-5 mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={resolveHref(item.href)}
                  onClick={() => {
                    setActiveSection(item.href);
                    setMobileOpen(false);
                  }}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${navItemClass(item.href)}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {session ? (
            <>
              <Link
                href={dashboardHref}
                onClick={() => setMobileOpen(false)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm font-semibold text-secondary transition hover:bg-secondary/15"
              >
                <LogIn className="h-4 w-4" />
                Buka Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                Keluar
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm font-semibold text-secondary transition hover:bg-secondary/15"
            >
              <LogIn className="h-4 w-4" />
              Login Petugas
            </Link>
          )}
          <Link
            href="tel:112"
            onClick={() => setMobileOpen(false)}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container px-4 py-3 text-sm font-semibold text-on-primary-container"
          >
            <PhoneCall className="h-4 w-4" />
            Hubungi Darurat
          </Link>
        </div>
      </div>
    </header>
  );
}