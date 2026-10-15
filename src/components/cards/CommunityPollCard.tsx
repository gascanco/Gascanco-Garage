import React from 'react';
import { CommunityPoll, Owner, isHardAdmin } from '../../types/garage';
import { BarChart3, Check, Trash2, ShieldCheck, Lock, Unlock, Vote } from 'lucide-react';

interface CommunityPollCardProps {
  poll: CommunityPoll;
  currentUser?: Owner | null;
  onVote: (pollId: string, optionId: string) => void;
  onToggleStatus?: (pollId: string) => void;
  onDeletePoll?: (pollId: string) => void;
  isSidebarWidget?: boolean;
}

export const CommunityPollCard: React.FC<CommunityPollCardProps> = ({
  poll,
  currentUser,
  onVote,
  onToggleStatus,
  onDeletePoll,
  isSidebarWidget = false,
}) => {
  const currentUserId = currentUser?.id;
  const isAdmin = isHardAdmin(currentUser);
  const isClosed = poll.status === 'closed';

  // Check if current user voted for an option
  const userVotedOptionId = poll.userVotedOptionId || poll.options.find(opt => 
    currentUserId && opt.voterUserIds?.includes(currentUserId)
  )?.id;

  const hasVoted = Boolean(userVotedOptionId);
  const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

  return (
    <article 
      className={`group relative bg-[#1c1c1f] border border-[#333336] hover:border-[#C8102E]/70 transition-all duration-200 overflow-hidden shadow-sm ${
        isSidebarWidget ? 'p-3.5 sm:p-4' : 'p-4 sm:p-6'
      }`}
    >
      {/* Top Bar: Category / Status / Admin Controls */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 bg-[#C8102E]/15 border border-[#C8102E]/40 text-[#ff4d6a] font-['Oswald'] font-bold text-[9px] sm:text-[10px] tracking-wider uppercase inline-flex items-center gap-1">
            <BarChart3 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {poll.category || 'COMMUNITY POLL'}
          </span>
          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border ${
            isClosed 
              ? 'bg-[#222225] text-[#888888] border-[#333336]' 
              : 'bg-[#182618] text-[#4ade80] border-[#225022]'
          }`}>
            {isClosed ? 'Closed' : 'Active Poll'}
          </span>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            {onToggleStatus && (
              <button
                type="button"
                onClick={() => onToggleStatus(poll.id)}
                className="px-2 py-0.5 bg-[#26262a] hover:bg-[#333338] text-[#cccccc] hover:text-white text-[10px] font-mono border border-white/10 transition-colors cursor-pointer flex items-center gap-1"
                title={isClosed ? "Reopen poll" : "Close poll to new votes"}
              >
                {isClosed ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                <span>{isClosed ? 'Reopen' : 'Close'}</span>
              </button>
            )}
            {onDeletePoll && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Delete this community poll?')) {
                    onDeletePoll(poll.id);
                  }
                }}
                className="px-2 py-0.5 bg-[#26262a] hover:bg-[#C8102E] text-[#aaaaaa] hover:text-white text-[10px] font-mono border border-white/10 transition-colors cursor-pointer flex items-center gap-1"
                title="Admin: Delete Poll"
              >
                <Trash2 className="w-2.5 h-2.5 text-[#ff4d4d]" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Author and Date (Compact) */}
      <div className="flex items-center gap-2 mb-2 text-[11px] font-mono text-[#888888]">
        <img
          src={poll.author.avatar}
          alt={poll.author.name}
          className="w-5 h-5 rounded-full object-cover border border-[#C8102E]"
        />
        <span className="text-white font-bold">{poll.author.name}</span>
        {isHardAdmin(poll.author) && (
          <span className="px-1 py-0.2 bg-[#C8102E] text-white font-['Oswald'] text-[8px] uppercase tracking-wider inline-flex items-center gap-0.5">
            <ShieldCheck className="w-2 h-2" /> ADMIN
          </span>
        )}
        <span>•</span>
        <span>{poll.createdAt}</span>
      </div>

      {/* Poll Question */}
      <h3 className={`font-['Oswald'] font-bold uppercase text-white tracking-wide leading-snug ${
        isSidebarWidget ? 'text-base sm:text-lg mb-1.5' : 'text-lg sm:text-2xl mb-2'
      }`}>
        {poll.question}
      </h3>

      {/* Poll Description */}
      {poll.description && (
        <p className={`text-xs text-[#aaaaaa] leading-relaxed mb-3.5 ${isSidebarWidget ? 'line-clamp-2' : ''}`}>
          {poll.description}
        </p>
      )}

      {/* Poll Options */}
      <div className="space-y-2 my-3">
        {poll.options.map((option) => {
          const isSelected = userVotedOptionId === option.id;
          const voteCount = option.votes || 0;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

          if (hasVoted || isClosed) {
            // Results Mode (Voted or Closed)
            return (
              <div
                key={option.id}
                onClick={() => !isClosed && onVote(poll.id, option.id)}
                className={`relative overflow-hidden border p-3 transition-all ${
                  isSelected 
                    ? 'border-[#C8102E] bg-[#22181a]' 
                    : 'border-[#2d2d30] bg-[#161618] hover:border-[#444448]'
                } ${!isClosed ? 'cursor-pointer' : ''}`}
                title={!isClosed ? "Click to change your vote" : undefined}
              >
                {/* Visual percentage progress bar fill */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ${
                    isSelected ? 'bg-[#C8102E]/25' : 'bg-[#29292e]'
                  }`}
                  style={{ width: `${percentage}%` }}
                />

                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-[#C8102E] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <span className={`font-['Oswald'] uppercase text-xs sm:text-sm tracking-wide truncate ${
                      isSelected ? 'text-white font-bold' : 'text-[#dddddd]'
                    }`}>
                      {option.text}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-mono uppercase text-[#ff4d6a] tracking-wider shrink-0 font-bold">
                        (Your Vote)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                    <span className="text-[#888888] text-[11px] hidden xs:inline">
                      {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                    </span>
                    <span className={`font-bold ${isSelected ? 'text-white' : 'text-[#aaaaaa]'}`}>
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          // Voting Mode (Not yet voted)
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onVote(poll.id, option.id)}
              className="w-full text-left p-3 bg-[#18181b] hover:bg-[#22181a] border border-[#2e2e32] hover:border-[#C8102E] transition-all flex items-center justify-between gap-3 group/opt cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-4 h-4 rounded-full border-2 border-[#555558] group-hover/opt:border-[#C8102E] flex items-center justify-center shrink-0 transition-colors" />
                <span className="font-['Oswald'] text-xs sm:text-sm uppercase tracking-wide text-[#eeeeee] group-hover/opt:text-white transition-colors truncate">
                  {option.text}
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase text-[#777777] group-hover/opt:text-[#C8102E] shrink-0 transition-colors">
                Vote →
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Footer: Stats and Guidance */}
      <div className="pt-2.5 border-t border-[#2a2a2d] flex items-center justify-between text-xs font-mono text-[#888888]">
        <div className="flex items-center gap-1.5">
          <Vote className="w-3.5 h-3.5 text-[#C8102E]" />
          <span>{totalVotes} Total {totalVotes === 1 ? 'Vote' : 'Votes'} Cast</span>
        </div>

        {hasVoted && !isClosed && (
          <span className="text-[10px] text-[#aaaaaa] hover:text-white transition-colors">
            Click another option to change vote
          </span>
        )}

        {!hasVoted && !isClosed && (
          <span className="text-[10px] text-[#C8102E] uppercase font-bold tracking-wider">
            Select an option to vote
          </span>
        )}
      </div>
    </article>
  );
};
