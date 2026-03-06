import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="bg-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                PARIVESH 3.0
              </h1>
              <p className="mt-1 text-primary-200 text-sm">
                Unified Environmental Clearance Portal
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/auth/login"
                className="px-5 py-2 bg-white text-primary-700 font-semibold rounded-md hover:bg-primary-50 transition"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-5 py-2 border border-white text-white font-semibold rounded-md hover:bg-primary-600 transition"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-3xl mx-auto text-center px-4 py-20">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-primary-900 leading-tight">
            Streamlined Environmental
            <br />
            Clearance Management
          </h2>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            A single-window platform for project proponents, scrutiny teams, and
            decision-makers to manage EC applications from submission to final
            publication of Meeting Minutes.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow hover:bg-primary-700 transition"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features Overview ───────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Portal Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Application Submission",
                desc: "Multi-step wizard for EC applications with document uploads and fee payment.",
                icon: "📋",
              },
              {
                title: "Scrutiny & Review",
                desc: "Dedicated portal for scrutiny teams to review, query, and approve applications.",
                icon: "🔍",
              },
              {
                title: "MoM Generation",
                desc: "Auto-generate and publish Minutes of the Meeting with built-in editing tools.",
                icon: "📝",
              },
              {
                title: "Dashboard & Analytics",
                desc: "Real-time statistics, status tracking, and sector-wise reports.",
                icon: "📊",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="card text-center hover:shadow-md transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="font-semibold text-lg text-gray-900">
                  {feature.title}
                </h4>
                <p className="mt-2 text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-primary-900 text-primary-200 py-6 text-center text-sm">
        © {new Date().getFullYear()} PARIVESH 3.0 — Ministry of Environment,
        Forest and Climate Change. All rights reserved.
      </footer>
    </main>
  );
}
