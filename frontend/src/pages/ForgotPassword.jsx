import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import PasswordInput from "../components/PasswordInput";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Reset Password, 4: Success
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const maskedEmail = (emailStr) => {
    if (!emailStr || !emailStr.includes("@")) return emailStr;
    const [name, domain] = emailStr.split("@");
    const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
    return `${maskedName}@${domain}`;
  };

  const fullOtp = otpDigits.join("");

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setLoading(true);

    try {
      const response = await api.post("auth/send-otp/", { email });
      setInfoMessage(response.data.message || "Verification code sent.");
      setStep(2);
    } catch (err) {
      console.error(err);
      setError("Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // OTP digit handling
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpDigits];
    if (value.length > 1) {
      // User pasted full OTP
      const pasted = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || "";
      }
      setOtpDigits(newOtp);
      inputRefs[5].current?.focus();
      return;
    }

    newOtp[index] = value;
    setOtpDigits(newOtp);

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (fullOtp.length !== 6) {
      setError("Please enter complete 6-digit OTP code.");
      return;
    }

    setError("");
    setInfoMessage("");
    setLoading(true);

    try {
      await api.post("auth/verify-otp/", { email, otp: fullOtp });
      setStep(3);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Invalid or expired OTP code.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Please fill out both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.post("auth/reset-password/", {
        email,
        otp: fullOtp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setStep(4);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.06),transparent_50%)] flex flex-col justify-center items-center px-4 font-sans text-slate-800 py-10">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-teal-500/20 mx-auto mb-3">
            R
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {step === 1 && "Reset your password"}
            {step === 2 && "Verify your email"}
            {step === 3 && "Create a new password"}
            {step === 4 && "Password Reset Complete"}
          </h1>
          <p className="text-xs text-slate-500">
            {step === 1 && "Enter your registered email address to receive an OTP code"}
            {step === 2 && `We sent a verification code to ${maskedEmail(email)}`}
            {step === 3 && "Enter and confirm your new account password"}
            {step === 4 && "Your password has been reset successfully."}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {infoMessage && step !== 4 && (
          <div className="p-3 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl text-xs font-semibold text-center">
            {infoMessage}
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="saas-button-primary w-full py-3 text-sm font-semibold"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="flex justify-between items-center gap-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-10 h-12 text-center font-mono text-base font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white text-slate-900"
                  required
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || fullOtp.length !== 6}
              className="saas-button-primary w-full py-3 text-sm font-semibold"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Create New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">New Password</label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Confirm Password</label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="saas-button-primary w-full py-3 text-sm font-semibold"
            >
              {loading ? "Updating Password..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* STEP 4: Success */}
        {step === 4 && (
          <div className="space-y-5 text-center">
            <div className="p-3 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl text-xs font-semibold">
              Your password has been reset successfully.
            </div>

            <Link
              to="/login"
              className="saas-button-primary w-full py-3 text-sm font-semibold inline-flex justify-center items-center"
            >
              Sign In
            </Link>
          </div>
        )}

        <div className="text-center pt-3 border-t border-slate-100">
          <Link to="/login" className="text-xs text-slate-500 hover:text-slate-800 font-semibold">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
