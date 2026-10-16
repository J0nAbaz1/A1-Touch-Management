"use client";

import React, { useState } from "react";
import { Position, PreferredFoot, AvailabilityStatus } from "@/lib/types";
import { AVAILABLE_POSITIONS } from "@/lib/formations";
import { UserPlus, Shield, CheckCircle, AlertCircle, Sparkles, Send } from "lucide-react";

interface PlayerRegistrationFormProps {
  onSuccess: () => void;
}

export const PlayerRegistrationForm: React.FC<PlayerRegistrationFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    displayName: "",
    discordUsername: "",
    eaFcUsername: "",
    mainPosition: "" as Position | "",
    secondaryPosition: "" as Position | "",
    thirdPosition: "" as Position | "",
    preferredFoot: "Right" as PreferredFoot,
    playerNumber: 10,
    availability: "AVAILABLE" as AvailabilityStatus,
    availabilityReason: "",
    availableAfter: "",
    bio: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.displayName.trim()) {
      setErrorMessage("Please enter your player display name.");
      return;
    }
    if (!formData.discordUsername.trim()) {
      setErrorMessage("Please enter your Discord username.");
      return;
    }
    if (!formData.eaFcUsername.trim()) {
      setErrorMessage("Please enter your EA FC username.");
      return;
    }
    if (!formData.mainPosition) {
      setErrorMessage("Please select your Main Position.");
      return;
    }
    if (!formData.secondaryPosition) {
      setErrorMessage("Please select your Secondary Position.");
      return;
    }
    if (formData.mainPosition === formData.secondaryPosition) {
      setErrorMessage("Secondary position must be different from your Main position.");
      return;
    }
    if (formData.thirdPosition && formData.thirdPosition === formData.mainPosition) {
      setErrorMessage("Third position cannot be the same as your Main position.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccessMessage(
        `Welcome to A1 Touch FC, ${data.player.displayName}! Your player profile (#${data.player.playerNumber} - ${data.player.mainPosition}) has been registered into the squad database.`
      );

      // Reset form
      setFormData({
        displayName: "",
        discordUsername: "",
        eaFcUsername: "",
        mainPosition: "",
        secondaryPosition: "",
        thirdPosition: "",
        preferredFoot: "Right",
        playerNumber: Math.floor(Math.random() * 80) + 10,
        availability: "AVAILABLE",
        availabilityReason: "",
        availableAfter: "",
        bio: "",
        password: "",
      });

      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner shrink-0">
            <UserPlus className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                A1 TOUCH FC Player Registration
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/40 uppercase">
                Official Roster
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Create your official FC 27 club player profile. Managers will use your registered positions and availability for tactical lineups.
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white mb-0.5">Registration Confirmed!</div>
            <div>{successMessage}</div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white mb-0.5">Registration Incomplete</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
      >
        {/* Section 1: Player Identity */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-4 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            1. Player Identity & Handles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Display Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Messi, Apex, Shadow"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Discord Username <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. shadow#1337"
                value={formData.discordUsername}
                onChange={(e) => setFormData({ ...formData, discordUsername: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                EA FC Username <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. A1_Shadow10"
                value={formData.eaFcUsername}
                onChange={(e) => setFormData({ ...formData, eaFcUsername: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Positions & Football Attributes */}
        <div className="pt-4 border-t border-slate-800/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-4 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            2. Positions & Pitch Attributes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Main Position */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Main Position <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={formData.mainPosition}
                onChange={(e) => setFormData({ ...formData, mainPosition: e.target.value as Position })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors"
              >
                <option value="">Select Main Position</option>
                <optgroup label="Goalkeeper">
                  <option value="GK">GK (Goalkeeper)</option>
                </optgroup>
                <optgroup label="Defence">
                  <option value="LB">LB (Left Back)</option>
                  <option value="CB">CB (Centre Back)</option>
                  <option value="RB">RB (Right Back)</option>
                </optgroup>
                <optgroup label="Midfield">
                  <option value="CDM">CDM (Defensive Mid)</option>
                  <option value="CM">CM (Central Mid)</option>
                  <option value="CAM">CAM (Attacking Mid)</option>
                  <option value="LM">LM (Left Mid)</option>
                  <option value="RM">RM (Right Mid)</option>
                </optgroup>
                <optgroup label="Attack">
                  <option value="LW">LW (Left Winger)</option>
                  <option value="RW">RW (Right Winger)</option>
                  <option value="ST">ST (Striker)</option>
                </optgroup>
              </select>
            </div>

            {/* Secondary Position */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Secondary Position <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={formData.secondaryPosition}
                onChange={(e) => setFormData({ ...formData, secondaryPosition: e.target.value as Position })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors"
              >
                <option value="">Select Secondary Position</option>
                {AVAILABLE_POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Third Position */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Optional Third Position
              </label>
              <select
                value={formData.thirdPosition}
                onChange={(e) => setFormData({ ...formData, thirdPosition: e.target.value as Position })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors"
              >
                <option value="">None (Optional)</option>
                {AVAILABLE_POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Preferred Foot
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["Right", "Left", "Both"] as PreferredFoot[]).map((foot) => (
                  <button
                    key={foot}
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredFoot: foot })}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      formData.preferredFoot === foot
                        ? "bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-sm"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {foot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Desired Kit Number (1 - 99)
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={formData.playerNumber}
                onChange={(e) => setFormData({ ...formData, playerNumber: parseInt(e.target.value, 10) || 10 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Availability */}
        <div className="pt-4 border-t border-slate-800/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            3. Match Availability Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, availability: "AVAILABLE" })}
              className={`p-3 rounded-xl border text-left transition-all ${
                formData.availability === "AVAILABLE"
                  ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-200 ring-2 ring-emerald-500/20"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Available
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Ready for Starting XI & matches</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, availability: "MAYBE" })}
              className={`p-3 rounded-xl border text-left transition-all ${
                formData.availability === "MAYBE"
                  ? "bg-amber-950/60 border-amber-500/60 text-amber-200 ring-2 ring-amber-500/20"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Maybe
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Conditional availability / late</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, availability: "UNAVAILABLE" })}
              className={`p-3 rounded-xl border text-left transition-all ${
                formData.availability === "UNAVAILABLE"
                  ? "bg-rose-950/60 border-rose-500/60 text-rose-200 ring-2 ring-rose-500/20"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Unavailable
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Cannot play upcoming fixture</div>
            </button>
          </div>

          {formData.availability !== "AVAILABLE" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason (e.g. School, Work, Traveling)
                </label>
                <input
                  type="text"
                  placeholder="e.g. School exam, Work shift"
                  value={formData.availabilityReason}
                  onChange={(e) => setFormData({ ...formData, availabilityReason: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Available After (Time)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 21:00 or 20:30"
                  value={formData.availableAfter}
                  onChange={(e) => setFormData({ ...formData, availableAfter: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Bio & Account Password */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Player Bio / Playstyle (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Describe your strengths, playstyle, skill moves, or tournament experience..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Account Password (for Player Login)
              </label>
              <input
                type="password"
                placeholder="Default: a1touch2027 (or choose your own)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                You can log in anytime with your EA FC username and password to update your availability.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-teal-500/25 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-slate-950" />
            <span>{isSubmitting ? "Submitting Registration..." : "Register Player Profile"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
