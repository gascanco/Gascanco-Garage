import React, { useState } from 'react';
import { GascancoLogo } from '../common/GascancoLogo';
import { SlammedTruckIcon } from '../common/SlammedTruckIcon';
import { ActiveView, Owner, isHardAdmin } from '../../types/garage';
import { Plus, ShoppingBag, User, Wrench, Menu, X, Sparkles, ChevronDown, ShieldCheck, Tag } from 'lucide-react';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  currentUser: Owner;
  onOpenAddVehicle: () => void;
  cartCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  currentUser,
  onOpenAddVehicle,
  cartCount = 2,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutInitiated, setCheckoutInitiated] = useState(false);

  const isActivityActive = activeView.type === 'activity-feed';
  const isGarageActive = activeView.type === 'community-builds' || activeView.type === 'discover' || activeView.type === 'vehicle-detail';
  const isMarketplaceActive = activeView.type === 'marketplace' || activeView.type === 'marketplace-detail';
  const isMyGarageActive = activeView.type === 'my-garage';
  const isAdmin = isHardAdmin(currentUser);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#202020] border-b border-[#383838]">
      {/* 1. CLEAN TOP ANNOUNCEMENT BAR (Gascanco Storefront Native) */}
      <div className="bg-[#181818] border-b border-[#2d2d2d] px-4 py-1.5 text-[11px] font-['Oswald'] uppercase tracking-wider text-[#b0b0b0] flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[#C8102E] font-bold">AUTO MOTO GEAR</span>
          <span className="text-[#444444]">/</span>
          <span>EST. ENTHUSIAST REGISTRY</span>
        </div>

        <div className="mx-auto sm:mx-0 text-center text-white text-xs">
          <span>FREE U.S. SHIPPING OVER $75</span>
          <span className="text-[#555555] mx-2">·</span>
          <span className="text-[#C8102E] font-bold">THE [GARAGE] ONLINE</span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[#999999] text-[11px]">
          <span>USD $</span>
          <span className="text-[#444444]">|</span>
          <span className="font-mono">#{currentUser.shopifyCustomerId}</span>
        </div>
      </div>

      {/* 2. DECLUTTERED MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Left: GASCANCO Legacy Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveView({ type: 'discover' })}
            className="focus:outline-none flex items-center text-white hover:opacity-90 transition-opacity cursor-pointer"
            title="Gascanco Garage Home"
          >
            <GascancoLogo variant="with-garage" size="md" />
          </button>
        </div>

        {/* Center: Clean Storefront Navigation Menu (Decluttered) */}
        <nav className="hidden md:flex items-center gap-8 font-['Oswald'] text-base uppercase tracking-wider">
          <button
            onClick={() => setActiveView({ type: 'activity-feed' })}
            className={`py-1 transition-colors relative flex items-center gap-1.5 ${
              isActivityActive
                ? 'text-white font-bold border-b-2 border-[#C8102E]'
                : 'text-[#bbbbbb] hover:text-white'
            }`}
          >
            <span>Live Activity Feed</span>
          </button>

          <button
            onClick={() => setActiveView({ type: 'community-builds' })}
            className={`py-1 transition-colors relative flex items-center gap-1.5 ${
              isGarageActive && !isActivityActive
                ? 'text-white font-bold border-b-2 border-[#C8102E]'
                : 'text-[#bbbbbb] hover:text-white'
            }`}
          >
            <SlammedTruckIcon className="w-4 h-4" />
            <span>Community Builds</span>
          </button>

          <button
            onClick={() => setActiveView({ type: 'marketplace' })}
            className={`py-1 transition-colors relative flex items-center gap-1.5 ${
              isMarketplaceActive
                ? 'text-white font-bold border-b-2 border-[#C8102E]'
                : 'text-[#bbbbbb] hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4 text-[#C8102E]" />
            <span>Parts Bin</span>
          </button>

          <button
            onClick={() => setActiveView({ type: 'my-garage' })}
            className={`py-1 transition-colors relative ${
              isMyGarageActive
                ? 'text-white font-bold border-b-2 border-[#C8102E]'
                : 'text-[#bbbbbb] hover:text-white'
            }`}
          >
            <span>My Garage</span>
          </button>
        </nav>

        {/* Right Zone: Primary CTA, Shopify Account, and Store Cart */}
        <div className="flex items-center gap-3">
          {/* Add Vehicle Button in Gascanco Red */}
          <button
            onClick={onOpenAddVehicle}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#C8102E] hover:bg-[#e01334] text-white font-['Oswald'] font-bold text-sm uppercase tracking-wider transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Vehicle</span>
          </button>

          {/* Customer Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded bg-[#282828] hover:bg-[#333333] border border-[#404040] text-xs transition-colors cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-[#C8102E]"
              />
              <span className="hidden lg:inline font-['Oswald'] text-sm uppercase text-[#e0e0e0] flex items-center gap-1.5">
                {currentUser.name}
                {isAdmin && (
                  <span className="px-1.5 py-0.2 bg-[#C8102E] text-white font-['Oswald'] font-black text-[9px] tracking-wider uppercase inline-flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" /> ADMIN
                  </span>
                )}
              </span>
            </button>

            {accountDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded bg-[#242424] border border-[#3d3d3d] shadow-2xl py-2 z-50 text-xs"
                onClick={() => setAccountDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-[#333333]">
                  <div className="flex items-center justify-between">
                    <p className="font-['Oswald'] font-bold text-white uppercase text-base">{currentUser.name}</p>
                    {isAdmin && (
                      <span className="px-1.5 py-0.5 bg-[#C8102E] text-white font-['Oswald'] font-bold text-[9px] tracking-wider uppercase inline-flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> HARD ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-[#999999] font-mono text-[11px]">{currentUser.location}</p>
                  {isAdmin && (
                    <p className="text-[11px] text-[#ff4d4d] font-mono font-bold mt-1">
                      Linked: Gascanco@gmail.com
                    </p>
                  )}
                  <p className="text-[10px] text-[#C8102E] font-mono mt-0.5">Shopify ID: {currentUser.shopifyCustomerId}</p>
                </div>

                <button
                  onClick={() => setActiveView({ type: 'my-garage' })}
                  className="w-full text-left px-4 py-2 hover:bg-[#2d2d2d] text-[#d5d5d5] flex items-center justify-between"
                >
                  <span>My Garage</span>
                  <Wrench className="w-3.5 h-3.5 text-[#888888]" />
                </button>
              </div>
            )}
          </div>

          {/* Cart Icon with Live Count */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="flex items-center gap-1.5 p-2 rounded bg-[#282828] hover:bg-[#333333] border border-[#404040] text-[#e0e0e0] hover:text-white transition-colors cursor-pointer"
            title="View Store Cart"
          >
            <ShoppingBag className="w-4 h-4 text-[#C8102E]" />
            <span className="font-['Oswald'] text-xs font-bold">[{cartCount}]</span>
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#cccccc] hover:text-white rounded focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#383838] bg-[#222222] px-4 py-4 space-y-2">
          <button
            onClick={() => {
              setActiveView({ type: 'discover' });
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded font-['Oswald'] text-lg font-bold uppercase text-white hover:bg-[#2d2d2d] flex items-center gap-2.5"
          >
            <SlammedTruckIcon className="w-5 h-5 text-[#C8102E] shrink-0" />
            <span>The [Garage] Builds</span>
          </button>
          <button
            onClick={() => {
              setActiveView({ type: 'marketplace' });
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded font-['Oswald'] text-lg font-bold uppercase text-white hover:bg-[#2d2d2d] flex items-center gap-2.5"
          >
            <Tag className="w-5 h-5 text-[#C8102E] shrink-0" />
            <span>Parts Bin (Marketplace)</span>
          </button>
          <button
            onClick={() => {
              setActiveView({ type: 'my-garage' });
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 font-['Oswald'] text-lg font-bold uppercase text-white hover:bg-[#2d2d2d]"
          >
            My Garage Registry
          </button>
          <button
            onClick={() => {
              setActiveView({ type: 'user-profile', ownerId: currentUser.id });
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 font-['Oswald'] text-lg font-bold uppercase text-gray-300 hover:bg-[#2d2d2d]"
          >
            Member Profile
          </button>
        </div>
      )}

      {/* Slide-out Cart Drawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#252525] border-l border-[#3d3d3d] h-full flex flex-col justify-between p-6 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#383838]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#C8102E]" />
                  <h3 className="font-['Oswald'] text-2xl font-bold uppercase text-white">
                    Gascanco Cart (2)
                  </h3>
                </div>
                <button
                  onClick={() => setCartDrawerOpen(false)}
                  className="p-1 rounded text-[#999999] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="divide-y divide-[#333333] mt-4 space-y-4">
                <div className="flex gap-4 pt-4">
                  <img
                    src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80"
                    alt="Crewneck"
                    className="w-16 h-16 rounded object-cover border border-[#3d3d3d]"
                  />
                  <div className="flex-1 text-xs font-mono">
                    <h5 className="font-bold text-white text-sm font-['Oswald'] uppercase">
                      Gascanco Heavyweight Garage Crewneck
                    </h5>
                    <p className="text-[#aaaaaa]">Size: L · Asphalt Gray</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[#C8102E] font-bold text-sm">$78.00</span>
                      <span className="text-[#888888]">Qty: 1</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <img
                    src="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=400&q=80"
                    alt="Cap"
                    className="w-16 h-16 rounded object-cover border border-[#3d3d3d]"
                  />
                  <div className="flex-1 text-xs font-mono">
                    <h5 className="font-bold text-white text-sm font-['Oswald'] uppercase">
                      Legacy Snapback Cap
                    </h5>
                    <p className="text-[#aaaaaa]">Color: Black / Crimson Stitched</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[#C8102E] font-bold text-sm">$34.00</span>
                      <span className="text-[#888888]">Qty: 1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#383838] pt-4 space-y-3">
              <div className="flex justify-between text-xs font-mono text-[#bbbbbb]">
                <span>Shipping</span>
                <span className="text-[#10b981] font-bold">FREE (OVER $75)</span>
              </div>
              <div className="flex justify-between font-['Oswald'] text-lg font-bold text-white">
                <span>SUBTOTAL</span>
                <span>$112.00 USD</span>
              </div>
              <button
                onClick={() => {
                  setCheckoutInitiated(true);
                  setTimeout(() => setCheckoutInitiated(false), 3000);
                }}
                className="w-full py-3 rounded bg-[#C8102E] hover:bg-[#e01334] text-white font-['Oswald'] font-bold text-base uppercase tracking-wider transition-colors shadow-md cursor-pointer"
              >
                {checkoutInitiated ? "Redirecting to Shopify Checkout..." : "Proceed to Checkout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
