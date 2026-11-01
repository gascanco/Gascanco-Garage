import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageSquare, ExternalLink } from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gascanco.com/garage';
  const shareTitle = 'GASCANCO Garage — Add your vehicles to the Garage!';
  const shareText = 'Add your vehicles to the Garage! Check out my Garage on GASCANCO:';

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(appUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = appUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: appUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const encodedUrl = encodeURIComponent(appUrl);
  const encodedText = encodeURIComponent(`${shareText} ${appUrl}`);

  const socialLinks = [
    {
      name: 'X / Twitter',
      color: 'bg-black hover:bg-[#1a1a1a] border-[#444]',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodedUrl}`,
    },
    {
      name: 'Facebook',
      color: 'bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border-[#1877F2]/50 text-[#1877F2]',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'Messenger',
      color: 'bg-[#0084FF]/20 hover:bg-[#0084FF]/30 border-[#0084FF]/50 text-[#0084FF]',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.093.303 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.056-3.26-5.963 3.26 6.559-6.963 3.13 3.26 5.889-3.26-6.559 6.963z" />
        </svg>
      ),
      href: `https://m.me/?text=${encodeURIComponent('Add your vehicles to the Garage! ' + appUrl)}`,
    },
    {
      name: 'Messages / SMS',
      color: 'bg-[#34C759]/20 hover:bg-[#34C759]/30 border-[#34C759]/50 text-[#34C759]',
      icon: <MessageSquare className="w-4 h-4 text-[#34C759]" />,
      href: `sms:?&body=${encodedText}`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#181818] border border-[#383838] shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#2d2d2d] mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-[#C8102E]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C8102E]">
                Invite Community
              </span>
            </div>
            <h3 className="text-xl font-['Oswald'] font-bold uppercase tracking-wider text-white">
              Share Gascanco Garage
            </h3>
            <p className="text-xs text-[#999999] font-['Inter'] mt-1">
              Invite fellow enthusiasts, club members, and builders to explore and post builds.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#888888] hover:text-white p-1 hover:bg-[#282828] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Copy Link Input Bar */}
        <div className="mb-5">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#aaaaaa] mb-2">
            Garage Web Link
          </label>
          <div className="flex items-stretch bg-[#111111] border border-[#333333]">
            <input
              type="text"
              readOnly
              value={appUrl}
              className="flex-1 bg-transparent px-3 py-2.5 text-xs text-white font-mono focus:outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className="px-4 bg-[#C8102E] hover:bg-[#e01334] text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Device Native Share Trigger */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <div className="mb-5">
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 bg-[#262626] hover:bg-[#333333] border border-[#444444] text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-[#C8102E]" />
              <span>Share via Device Menu</span>
            </button>
          </div>
        )}

        {/* Social Platforms Grid */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#aaaaaa] mb-2">
            Share Directly
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {socialLinks.map(s => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2.5 px-3 py-2.5 border text-xs font-['Inter'] font-medium transition-all ${s.color}`}
              >
                {s.icon}
                <span className="text-white text-xs">{s.name}</span>
                <ExternalLink className="w-3 h-3 text-[#666666] ml-auto" />
              </a>
            ))}
          </div>
        </div>

        {/* Brand Signoff */}
        <div className="mt-6 pt-4 border-t border-[#252525] flex items-center justify-between text-[11px] font-mono text-[#666666]">
          <span>GASCANCO GARAGE ENTHUSIAST REGISTRY</span>
          <span className="text-[#C8102E]">GCC-2024</span>
        </div>
      </div>
    </div>
  );
};
