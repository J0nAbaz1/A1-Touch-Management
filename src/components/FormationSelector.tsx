"use client";

import React from "react";
import { FORMATIONS } from "@/lib/formations";
import { LayoutGrid, Save, RefreshCw, Wand2, Check } from "lucide-react";

interface FormationSelectorProps {
  currentFormation: string;
  onSelectFormation: (formationCode: string) => void;
  onSaveLineup: () => void;
  onClearFormation: () => void;
  onAutoRecommend: () => void;
  isSaving: boolean;
  canManage: boolean;
}

export const FormationSelector: React.FC<FormationSelectorProps> = ({
  currentFormation,
  onSelectFormation,
  onSaveLineup,
  onClearFormation,
  onAutoRecommend,
  isSaving,
  canManage,
}) => {
  const formationKeys = Object.keys(FORMATIONS);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Formation Picker */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <LayoutGrid className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Club Formation
            </span>
            <span className="text-[10px] text-teal-400 font-semibold px-2 py-0.5 rounded-full bg-teal-950/70 border border-teal-500/30">
              {FORMATIONS[currentFormation]?.name || currentFormation}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {formationKeys.map((code) => {
              const active = currentFormation === code;
              return (
                <button
                  key={code}
                  onClick={() => onSelectFormation(code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30 ring-2 ring-teal-400/40"
                      : "bg-slate-800/90 hover:bg-slate-800 text-slate-300 border border-slate-700/60"
                  }`}
                >
                  <span>{code}</span>
                  {active && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 italic">
            {FORMATIONS[currentFormation]?.description}
          </p>
        </div>

        {/* Management Controls */}
        {canManage && (
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
            {/* Auto recommend best squad */}
            <button
              onClick={onAutoRecommend}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all shadow-sm"
              title="Automatically fit best available players into formation based on scores"
            >
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Auto-Fill Best XI</span>
            </button>

            {/* Clear formation */}
            <button
              onClick={onClearFormation}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
              title="Clear all players from pitch"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear XI</span>
            </button>

            {/* Save lineup */}
            <button
              onClick={onSaveLineup}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold shadow-md shadow-teal-500/25 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span>{isSaving ? "Saving..." : "Save Starting XI"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
