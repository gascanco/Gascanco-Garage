import React, { useState } from 'react';
import { Vehicle, SpotlightConfig } from '../../types/garage';
import { Star, X, Check, Search, Sparkles } from 'lucide-react';

interface SpotlightManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allVehicles: Vehicle[];
  currentConfig: SpotlightConfig;
  onSaveConfig: (updatedConfig: SpotlightConfig) => void;
}

const PRESET_BADGES = [
  'COMMUNITY SPOTLIGHT',
  'BUILD OF THE MONTH',
  'TRACK WEAPON OF THE WEEK',
  'EDITOR\'S PICK',
  'RETRO ICON',
  'SHOP SHOWCASE'
];

export const SpotlightManagerModal: React.FC<SpotlightManagerModalProps> = ({
  isOpen,
  onClose,
  allVehicles,
  currentConfig,
  onSaveConfig,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState(currentConfig.vehicleId);
  const [badge, setBadge] = useState(currentConfig.badge || 'COMMUNITY SPOTLIGHT');
  const [headline, setHeadline] = useState(currentConfig.headline || '');
  const [reason, setReason] = useState(currentConfig.reason || '');
  const [isActive, setIsActive] = useState(currentConfig.active !== false);
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const filteredVehicles = allVehicles.filter(v => {
    const q = searchFilter.toLowerCase();
    return (
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.year.toString().includes(q) ||
      v.owner.name.toLowerCase().includes(q) ||
      (v.engine && v.engine.toLowerCase().includes(q))
    );
  });

  const selectedVehicle = allVehicles.find(v => v.id === selectedVehicleId) || allVehicles[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      vehicleId: selectedVehicleId,
      badge: badge.trim() || 'COMMUNITY SPOTLIGHT',
      headline: headline.trim() || `${selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}` : 'Featured Build'}`,
      reason: reason.trim(),
      active: isActive,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-[#1c1c1f] border border-[#38383a] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#232326] border-b border-[#333336] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#C8102E]/20 border border-[#C8102E]/40 flex items-center justify-center text-[#C8102E]">
              <Star className="w-4 h-4 fill-[#C8102E]" />
            </div>
            <div>
              <h3 className="font-['Oswald'] text-lg font-bold uppercase tracking-wider text-white">
                Admin: Community Spotlight Control
              </h3>
              <p className="text-[11px] font-mono text-[#888888]">
                Select and configure the featured build shown across the Live Feed and Discover pages
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#888888] hover:text-white hover:bg-[#2d2d30] rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Active Status Toggle */}
          <div className="p-3 bg-[#242427] border border-[#38383a] flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block">
                Spotlight Visibility
              </span>
              <span className="text-[11px] font-mono text-[#888888]">
                When disabled, the spotlight widget is hidden from the sidebar.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                isActive 
                  ? 'bg-[#C8102E] text-white border-[#C8102E]' 
                  : 'bg-[#18181a] text-[#888888] border-[#38383a]'
              }`}
            >
              {isActive ? 'Active (Visible)' : 'Paused (Hidden)'}
            </button>
          </div>

          {/* Preset Badges & Custom Badge */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa]">
              Spotlight Badge / Tagline
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_BADGES.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBadge(b)}
                  className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                    badge === b 
                      ? 'bg-[#C8102E] text-white border-[#C8102E] font-bold' 
                      : 'bg-[#222225] text-[#888888] border-[#333336] hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. COMMUNITY SPOTLIGHT"
              className="w-full px-3 py-2 bg-[#171719] border border-[#38383a] text-white text-xs font-mono focus:outline-none focus:border-[#C8102E]"
              required
            />
          </div>

          {/* Editorial Headline */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa]">
              Featured Headline (Optional)
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Track Dedicated V-Spec BNR34"
              className="w-full px-3 py-2 bg-[#171719] border border-[#38383a] text-white text-xs font-mono focus:outline-none focus:border-[#C8102E]"
            />
          </div>

          {/* Admin Feature Reason / Commentary */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa]">
              Admin Feature Note / Commentary
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Why this vehicle was selected for the spotlight (e.g. Custom fabrication, engine swap, dyno numbers)..."
              className="w-full px-3 py-2 bg-[#171719] border border-[#38383a] text-white text-xs font-mono focus:outline-none focus:border-[#C8102E] resize-none"
            />
          </div>

          {/* Vehicle Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-[#aaaaaa]">
                Select Vehicle ({allVehicles.length} available)
              </label>
              {selectedVehicle && (
                <span className="text-[11px] font-mono text-[#C8102E] font-bold">
                  Selected: {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                </span>
              )}
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search by make, model, year, or owner..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#171719] border border-[#38383a] text-white text-xs font-mono focus:outline-none focus:border-[#C8102E]"
              />
            </div>

            {/* Vehicle List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredVehicles.map(v => {
                const isSelected = v.id === selectedVehicleId;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`p-2.5 flex items-center gap-3 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#291b1e] border-[#C8102E]'
                        : 'bg-[#18181a] border-[#2e2e30] hover:border-[#444446]'
                    }`}
                  >
                    <img
                      src={v.primaryImage}
                      alt={v.model}
                      className="w-14 h-11 object-cover shrink-0 border border-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="font-['Oswald'] text-xs font-bold text-white uppercase truncate">
                          {v.year} {v.make} {v.model}
                        </h5>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#C8102E] shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-[#888888] truncate">
                        By {v.owner.name}
                      </div>
                      <div className="text-[9px] font-mono text-[#aaaaaa] truncate">
                        {v.engine}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[#333336] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono uppercase text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#C8102E] hover:bg-[#e01334] text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Spotlight</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
