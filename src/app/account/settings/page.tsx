"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Button from "@/components/Button";
import { useAvatarStore } from "@/lib/avatar-store";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { avatarUrl, setAvatarUrl, profileName, profileEmail, setProfileName, setProfileEmail } = useAvatarStore();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setAvatarPreview(avatarUrl);
    if (profileName) setName(profileName);
    if (profileEmail) setEmail(profileEmail);
  }, [avatarUrl, profileName, profileEmail]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setAvatarPreview(dataUrl);
        setAvatarUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleRemoveAvatar() {
    setAvatarPreview(null);
    setAvatarUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileName(name);
    setProfileEmail(email);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Failed to update password.");
      } else {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 4000);
      }
    } catch {
      setPasswordError("Something went wrong. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div>
      <h2 className="font-sans text-xl font-semibold text-[#1b1718] leading-[1.6] mb-2">Account Details</h2>
      <p className="font-sans text-base text-[#5f5d5d] leading-[1.6] tracking-[0.32px] mb-8">
        Update your profile and preferences.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div>
          <label className="block font-sans text-sm font-medium text-[#1b1718] mb-3">Profile image</label>
          <div className="flex items-center gap-5">
            <div className="relative size-[80px] border border-[#e0d6c9] bg-[#faf6f1] flex items-center justify-center overflow-hidden shrink-0">
              {avatarPreview ? (
                <Image src={avatarPreview} alt="Profile" fill className="object-cover" />
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bbb9ba" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-sans text-sm font-medium text-secondary-100 hover:opacity-80 transition-opacity text-left"
              >
                {avatarPreview ? "Change image" : "Upload image"}
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="font-sans text-sm text-[#5f5d5d] hover:text-[#1b1718] transition-colors text-left"
                >
                  Remove
                </button>
              )}
              <p className="font-sans text-xs text-[#9e9c9c]">JPG, PNG or WebP. Max 2MB.</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <div>
          <label htmlFor="name" className="block font-sans text-sm font-medium text-[#1b1718] mb-1">Full name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-[#e0d6c9] bg-[#faf6f1] px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-secondary-60"
          />
        </div>
        <div>
          <label htmlFor="email" className="block font-sans text-sm font-medium text-[#1b1718] mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#e0d6c9] bg-[#faf6f1] px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-secondary-60"
          />
        </div>
        <div className="flex items-center gap-4">
          <Button type="submit" variant="primary">
            Save changes
          </Button>
          {saved && (
            <span className="font-sans text-sm text-green-700">Changes saved successfully.</span>
          )}
        </div>
      </form>

      <div className="border-t border-[#e0d6c9] mt-12 pt-10">
        <h2 className="font-sans text-xl font-semibold text-[#1b1718] leading-[1.6] mb-2">Change Password</h2>
        <p className="font-sans text-base text-[#5f5d5d] leading-[1.6] tracking-[0.32px] mb-8">
          Update your password to keep your account secure.
        </p>
        <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-xl">
          <div>
            <label htmlFor="currentPassword" className="block font-sans text-sm font-medium text-[#1b1718] mb-1">Current password</label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(""); }}
                className="w-full border border-[#e0d6c9] bg-[#faf6f1] px-4 py-3 pr-12 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-secondary-60"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d8b8b] hover:text-[#1b1718] transition-colors"
              >
                {showCurrentPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="block font-sans text-sm font-medium text-[#1b1718] mb-1">New password</label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPasswordError(""); }}
                className="w-full border border-[#e0d6c9] bg-[#faf6f1] px-4 py-3 pr-12 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-secondary-60"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d8b8b] hover:text-[#1b1718] transition-colors"
              >
                {showNewPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
            <p className="font-sans text-xs text-[#9e9c9c] mt-1">Must be at least 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block font-sans text-sm font-medium text-[#1b1718] mb-1">Confirm new password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); }}
                className="w-full border border-[#e0d6c9] bg-[#faf6f1] px-4 py-3 pr-12 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-secondary-60"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d8b8b] hover:text-[#1b1718] transition-colors"
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>

          {passwordError && (
            <div className="bg-red-50 border border-red-200 px-4 py-3 font-sans text-sm text-red-700">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="bg-green-50 border border-green-200 px-4 py-3 font-sans text-sm text-green-700">
              Password updated successfully.
            </div>
          )}

          <Button type="submit" variant="primary" disabled={passwordLoading}>
            {passwordLoading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
