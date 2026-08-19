"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Shield, Zap, LayoutDashboard, LogOut } from "lucide-react";
import { getStoredUser, roleBadgeColor, roleLabel, type AuthUser } from "@/lib/auth";

const navLinks = [
  { name: "Home",         path: "/#home"         },
  { name: "How It Works", path: "/#how-it-works" },
  { name: "Features",     path: "/#features"     },
  { name: "Architecture", path: "/#architecture" },
];

function handleAnchorClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  path: string,
  onClose?: () => void
) {
  const hash = path.split("#")[1];
  if (!hash) return;
  const target = document.getElementById(hash);
  if (target) {
    e.preventDefault();
    onClose?.();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    // update URL without hard navigation
    window.history.pushState(null, "", `#${hash}`);
  }
}

export default function Navbar() {
  const [scrolled, setScrolled]           = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggedInUser, setLoggedInUser]   = useState<AuthUser | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router   = useRouter();

  // Detect logged-in state
  useEffect(() => {
    const sync = () => {
      const token = localStorage.getItem("token");
      setLoggedInUser(token ? getStoredUser() : null);
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const updateHash = () => setActiveHash(window.location.hash || "#home");
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const isActive = (path: string) => {
    const hash = path.split("#")[1];
    return hash ? activeHash === `#${hash}` : pathname === path;
  };

  return (
    <div className="fixed top-[5px] left-0 w-full z-50 transition-all duration-300">
      {/* Navbar Container */}
      <div
        className={`mx-auto rounded-xl flex items-center justify-between transition-all duration-500 ease-in-out ${
          scrolled
            ? "bg-white/70 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_32px_rgba(11,31,51,0.12)] border border-white/40 w-11/12 px-6 mt-3"
            : "bg-transparent w-11/12"
        }`}
        style={{
          paddingTop: scrolled ? "10px" : "0px",
          paddingBottom: scrolled ? "10px" : "0px",
          minHeight: scrolled ? "72px" : "64px",
        }}
      >
        {/* Left: Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <div className="lg:hidden relative" ref={mobileMenuRef}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" style={{ color: "#0B1F33" }} />
              ) : (
                <Menu className="w-6 h-6" style={{ color: "#0B1F33" }} />
              )}
            </button>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
              <div className="absolute left-0 mt-3 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.path}
                    onClick={(e) => handleAnchorClick(e, link.path, () => setMobileMenuOpen(false))}
                    className={`block px-4 py-2.5 text-sm transition-colors ${
                      isActive(link.path)
                        ? "text-[#19C3B1] font-semibold bg-[#19C3B1]/5"
                        : "text-gray-600 hover:text-[#0B1F33] hover:bg-gray-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="border-t border-gray-100 mt-2 pt-2">
                  {loggedInUser ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[#19C3B1] font-semibold hover:bg-gray-50"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          localStorage.removeItem("token");
                          localStorage.removeItem("user");
                          setLoggedInUser(null);
                          setMobileMenuOpen(false);
                          router.push("/login");
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-500 font-semibold hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[#19C3B1] font-semibold hover:bg-gray-50"
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[#19C3B1] font-semibold hover:bg-gray-50"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="flex items-center justify-center rounded-lg transition-all duration-500 ease-in-out"
              style={{
                backgroundColor: "#0B1F33",
                width: scrolled ? "42px" : "40px",
                height: scrolled ? "42px" : "40px",
              }}
            >
              <div className="relative">
                <Shield
                  className="text-white transition-all duration-500 ease-in-out"
                  strokeWidth={2}
                  style={{
                    width: scrolled ? "23px" : "22px",
                    height: scrolled ? "23px" : "22px",
                  }}
                />
                <Zap
                  className="absolute -bottom-0.5 -right-0.5 transition-all duration-500 ease-in-out"
                  style={{
                    color: "#19C3B1",
                    width: scrolled ? "11.5px" : "11px",
                    height: scrolled ? "11.5px" : "11px",
                  }}
                  strokeWidth={2.5}
                />
              </div>
            </div>
            <span
              className="font-bold tracking-tight transition-all duration-500 ease-in-out"
              style={{
                color: "#0B1F33",
                fontSize: "22px",
              }}
            >
              resq<span style={{ color: "#19C3B1" }}>Buddy</span>
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation - 14px links */}
        <div className="hidden lg:flex flex-1 justify-center">
          <div className="flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={(e) => handleAnchorClick(e, link.path)}
                className={`relative py-1 transition-colors duration-200 ${
                  isActive(link.path)
                    ? "text-[#0B1F33] font-bold after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-[#19C3B1]"
                    : "text-gray-500 hover:text-[#0B1F33]"
                }`}
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                }}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Auth Buttons / User state */}
        <div className="hidden lg:flex items-center gap-3">
          {loggedInUser ? (
            <>
              {/* Role badge */}
              {(() => {
                const badge = roleBadgeColor[loggedInUser.role];
                return (
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold"
                    style={{ backgroundColor: badge.bg, color: badge.text }}
                  >
                    {roleLabel[loggedInUser.role]}
                  </span>
                );
              })()}

              {/* Dashboard button */}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 rounded-xl font-semibold text-white transition-all duration-300 hover:bg-[#14A89A]"
                style={{ backgroundColor: "#19C3B1", paddingTop: "8px", paddingBottom: "8px", fontSize: "15px" }}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              {/* Logout */}
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  setLoggedInUser(null);
                  router.push("/login");
                }}
                className="inline-flex items-center gap-2 px-4 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-100"
                style={{ color: "#6B7280", paddingTop: "8px", paddingBottom: "8px", fontSize: "15px", border: "1px solid rgba(11,31,51,0.12)" }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Sign Up Button */}
              <Link
                href="/signup"
                className={`px-5 rounded-xl font-semibold transition-all duration-300 ${
                  scrolled
                    ? "bg-[#19C3B1] text-white hover:bg-[#14A89A]"
                    : "bg-white text-[#19C3B1] hover:bg-gray-50"
                }`}
                style={{ paddingTop: "8px", paddingBottom: "8px", fontSize: "15px", border: "2px solid #19C3B1" }}
              >
                Sign Up
              </Link>

              {/* Login Button */}
              <Link
                href="/login"
                className="px-5 rounded-xl font-semibold text-white transition-all duration-300 hover:bg-[#1A3550]"
                style={{ backgroundColor: "#0B1F33", paddingTop: "8px", paddingBottom: "8px", fontSize: "15px" }}
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}