import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("auth/login/", { email, password });
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.06),transparent_40%)] flex justify-center items-center font-sans text-slate-800 px-4">
      <div className="w-full max-w-5xl min-h-[560px] grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-2xl">
        
        {/* Left Side: Brand & Feature Highlights */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-between relative bg-gradient-to-br from-teal-50/80 via-white to-blue-50/80 border-r border-slate-100 overflow-hidden">
          {/* Decorative background blur shape */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-teal-500/20">
              R
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">
              Resume<span className="text-teal-600">Tracker</span>
            </span>
          </div>

          <div className="my-auto py-8 space-y-6 relative z-10">
            <div className="space-y-2">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-teal-100 text-teal-700 rounded-md">
                Workspace Login
              </span>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 leading-snug">
                Accelerate your career with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">AI precision</span>.
              </h2>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-[10px]">✓</div>
                <span>Real-time ATS resume optimization & scoring</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-[10px]">✓</div>
                <span>Smart job application tracking pipeline</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-[10px]">✓</div>
                <span>AI cover letter & interview prep generator</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono relative z-10">
            © 2026 ResumeTracker Workspace • Secure Access
          </div>
        </div>

        {/* Right Side: Clean Light Login Form */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center max-w-md w-full mx-auto bg-white">
          <div className="space-y-1 mb-6">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h3>
            <p className="text-xs text-slate-500">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Email address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs transition-colors cursor-pointer"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>

              {/* Forgot password link placed correctly right under the password input */}
              <div className="flex justify-end mt-1.5">
                <Link to="/forgot-password" className="text-xs text-teal-600 hover:text-teal-700 transition-colors font-medium">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 font-semibold text-sm justify-center flex items-center bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl transition-all hover:opacity-95 shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="text-center pt-6 mt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-teal-600 font-semibold hover:underline">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}