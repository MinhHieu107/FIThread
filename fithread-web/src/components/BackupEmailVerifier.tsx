"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";

interface Props {
  confirmLabel: string;
  onVerified: (email: string) => Promise<void> | void;
}

export default function BackupEmailVerifier({ confirmLabel, onVerified }: Props) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendCode() {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await apiFetch("/account/backup-email/start", { method: "POST", body: JSON.stringify({ email }) });
      setSent(true);
      setOtp("");
      setInfo(`Đã gửi mã xác thực tới ${email}. Mã có hiệu lực trong 15 phút.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch<{ email: string }>("/account/backup-email/confirm", {
        method: "POST",
        body: JSON.stringify({ otp }),
      });
      await onVerified(res.email);
      setSent(false);
      setEmail("");
      setOtp("");
      setInfo("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="email"
          className="input-field !mb-0"
          placeholder="Email cá nhân (không dùng email trường)"
          value={email}
          disabled={sent}
          onChange={(e) => setEmail(e.target.value)}
        />
        {!sent ? (
          <button type="button" onClick={sendCode} disabled={loading || !email} className="btn-primary shrink-0">
            Gửi mã
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setInfo("");
              setError("");
            }}
            className="btn-secondary shrink-0"
          >
            Đổi email
          </button>
        )}
      </div>

      {sent && (
        <div className="flex gap-2">
          <input
            className="input-field !mb-0"
            placeholder="Mã OTP 6 số"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button type="button" onClick={confirm} disabled={loading || otp.length < 6} className="btn-primary shrink-0">
            {confirmLabel}
          </button>
        </div>
      )}

      {sent && (
        <button type="button" onClick={sendCode} disabled={loading} className="link-brand text-xs">
          Gửi lại mã
        </button>
      )}

      {info && <p className="text-green-700 text-sm">{info}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}