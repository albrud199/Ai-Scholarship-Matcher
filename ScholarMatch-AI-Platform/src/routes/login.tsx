import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { student } from "@/lib/scholarship-data";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in to ScholarMatch AI" },
      {
        name: "description",
        content:
          "Sign in to ScholarMatch AI to see your personalised scholarship matches, readiness scores and application deadlines.",
      },
      { property: "og:title", content: "Log in | ScholarMatch AI" },
      {
        property: "og:description",
        content: "AI-powered scholarship matching for international students.",
      },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(student.email);
  const [password, setPassword] = useState("demo-password");
  const [show, setShow] = useState(false);

  return (
    <main className="aurora relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-8">
      <div className="blob absolute -top-24 -right-24 size-80 rounded-full bg-leaf-300/50" />
      <div
        className="blob absolute -bottom-24 -left-24 size-80 rounded-full bg-brand-200/70"
        style={{ animationDelay: "-4s" }}
      />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border border-brand-200 bg-brand-50 shadow-elevated md:grid-cols-2">
        <section className="flex min-h-[560px] flex-col justify-between bg-brand-200/70 p-7 sm:p-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-leaf-500 text-leaf-900 shadow-soft">
                <Sparkles className="size-5" />
              </span>
              <div>
                <p className="text-lg font-extrabold text-brand-900">
                  ScholarMatch <span className="text-brand-700">AI</span>
                </p>
                <p className="text-xs text-brand-600">Your study-abroad co-pilot</p>
              </div>
            </div>

            <div className="mt-16 max-w-sm sm:mt-24">
              <p className="inline-flex rounded-full bg-leaf-100 px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-leaf-900">
                BUILT FOR AMBITIOUS STUDENTS
              </p>
              <h1 className="mt-5 text-4xl leading-[1.08] font-extrabold text-brand-950">
                Find the funding that fits your future.
              </h1>
              <p className="mt-4 text-base leading-7 text-brand-600">
                Discover fully funded graduate opportunities, know what to prepare, and meet every
                important deadline with clarity.
              </p>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-3 rounded-xl border border-brand-300/80 bg-brand-50/75 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-900">
              <ShieldCheck className="size-5" />
            </span>
            <p className="text-sm leading-5 text-brand-600">
              Transparent AI guidance, built to support your decisions.
            </p>
          </div>
        </section>

        <section className="flex items-center bg-brand-50 p-7 sm:p-10">
          <div className="w-full max-w-md">
            <p className="text-sm font-bold tracking-[0.12em] text-leaf-800">WELCOME BACK</p>
            <h2 className="mt-2 text-3xl font-extrabold text-brand-950">
              Continue your application plan
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand-500">
              Use your demo account to explore your scholarship workspace.
            </p>

            <form
              className="mt-8 flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/" });
              }}
            >
              <label className="block text-sm font-semibold text-brand-800">
                Email address
                <span className="relative mt-2 block">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brand-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-h-11 w-full rounded-lg border border-brand-300 bg-brand-50 py-2.5 pr-4 pl-10 text-sm text-brand-900 outline-none transition focus:border-leaf-600 focus:ring-4 focus:ring-leaf-300/30"
                  />
                </span>
              </label>

              <label className="block text-sm font-semibold text-brand-800">
                <span className="flex items-center justify-between">
                  Password
                  <button
                    type="button"
                    className="text-xs font-semibold text-leaf-800 hover:text-leaf-900"
                  >
                    Forgot password?
                  </button>
                </span>
                <span className="relative mt-2 block">
                  <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brand-400" />
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="min-h-11 w-full rounded-lg border border-brand-300 bg-brand-50 py-2.5 pr-11 pl-10 text-sm text-brand-900 outline-none transition focus:border-leaf-600 focus:ring-4 focus:ring-leaf-300/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-brand-400 hover:bg-brand-200/60 hover:text-brand-700"
                  >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </span>
              </label>

              <button
                type="submit"
                className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft transition hover:bg-leaf-600 focus:ring-4 focus:ring-leaf-300/40 focus:outline-none active:scale-[0.99]"
              >
                Log in to ScholarMatch
                <ArrowRight className="size-4" />
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-brand-300" />
              <span className="text-[11px] font-bold tracking-[0.1em] text-brand-400">
                NEW TO SCHOLARMATCH?
              </span>
              <div className="h-px flex-1 bg-brand-300" />
            </div>
            <Link
              to="/signup"
              className="flex min-h-11 w-full items-center justify-center rounded-lg border border-brand-300 bg-brand-50 px-5 py-3 text-sm font-semibold text-brand-800 transition hover:border-brand-500 hover:bg-brand-100"
            >
              Create your profile
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
