import React, { useState, useRef } from 'react';
import { 
  MessageSquare, 
  CornerDownRight, 
  Pencil, 
  Trash2, 
  Camera, 
  X, 
  Check, 
  Image as ImageIcon,
  Send,
  ThumbsDown
} from 'lucide-react';
import { PostComment, Owner } from '../../types/garage';
import { LoveYouGesture } from './LoveYouGesture';

interface ThreadedCommentsProps {
  postId: string;
  postTitle?: string;
  postType?: string;
  comments: PostComment[];
  currentUser: Owner;
  onAddComment: (comment: Omit<PostComment, 'id' | 'createdAt'>) => void;
  onUpdateComment: (commentId: string, content: string, photoUrl?: string) => void;
  onDeleteComment: (commentId: string) => void;
  onOpenLightbox?: (photoUrl: string) => void;
  compact?: boolean;
}

export const ThreadedComments: React.FC<ThreadedCommentsProps> = ({
  postId,
  postTitle,
  postType = 'post',
  comments,
  currentUser,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onOpenLightbox,
  compact = false,
}) => {
  // Composer state for root comment
  const [rootContent, setRootContent] = useState('');
  const [rootPhoto, setRootPhoto] = useState<string | null>(null);
  const rootFileInputRef = useRef<HTMLInputElement>(null);

  // Replying state (reply to a specific comment id)
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyPhoto, setReplyPhoto] = useState<string | null>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);

  // Edit modal state
  const [editingComment, setEditingComment] = useState<PostComment | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editPhoto, setEditPhoto] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Local like & dislike state for comments
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());
  const [dislikedCommentIds, setDislikedCommentIds] = useState<Set<string>>(new Set());

  // Handle Root Photo File Upload (1 photo only)
  const handleRootPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setRootPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  // Handle Reply Photo File Upload (1 photo only)
  const handleReplyPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setReplyPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  // Handle Edit Photo File Upload (1 photo only)
  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  // Submit Root Comment
  const handleSubmitRoot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootContent.trim() && !rootPhoto) return;

    onAddComment({
      postId,
      author: currentUser,
      content: rootContent.trim(),
      photoUrl: rootPhoto || undefined,
      parentId: null,
    });

    setRootContent('');
    setRootPhoto(null);
  };

  // Start Replying - Clean toggle without @ handle prefill
  const handleStartReply = (targetComment: PostComment) => {
    if (replyingToId === targetComment.id) {
      setReplyingToId(null);
      setReplyContent('');
      setReplyPhoto(null);
      return;
    }
    setReplyingToId(targetComment.id);
    setReplyContent('');
    setReplyPhoto(null);
  };

  // Cancel Replying
  const handleCancelReply = () => {
    setReplyingToId(null);
    setReplyContent('');
    setReplyPhoto(null);
  };

  // Submit Reply
  const handleSubmitReply = (parentId: string, replyToHandle?: string) => {
    if (!replyContent.trim()) return;

    onAddComment({
      postId,
      parentId,
      replyToHandle,
      author: currentUser,
      content: replyContent.trim(),
    });

    setReplyingToId(null);
    setReplyContent('');
    setReplyPhoto(null);
  };

  // Open Edit Modal
  const handleOpenEdit = (comment: PostComment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
    setEditPhoto(comment.photoUrl || null);
  };

  // Save Edit Comment
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComment) return;
    if (!editContent.trim() && !editPhoto) return;

    onUpdateComment(editingComment.id, editContent.trim(), editPhoto || undefined);
    setEditingComment(null);
  };

  // Delete from Edit Modal
  const handleDeleteFromEditModal = () => {
    if (!editingComment) return;
    onDeleteComment(editingComment.id);
    setEditingComment(null);
  };

  // Toggle Like on comment
  const handleToggleCommentLike = (commentId: string) => {
    setLikedCommentIds(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
        // Clear dislike if liked
        setDislikedCommentIds(prevDis => {
          const nextDis = new Set(prevDis);
          nextDis.delete(commentId);
          return nextDis;
        });
      }
      return next;
    });
  };

  // Toggle Dislike on comment
  const handleToggleCommentDislike = (commentId: string) => {
    setDislikedCommentIds(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
        // Clear like if disliked
        setLikedCommentIds(prevLikes => {
          const nextLikes = new Set(prevLikes);
          nextLikes.delete(commentId);
          return nextLikes;
        });
      }
      return next;
    });
  };

  // Filter and group comments into threads
  const rootComments = comments.filter(c => !c.parentId);
  const repliesByParentId = comments.reduce<Record<string, PostComment[]>>((acc, c) => {
    if (c.parentId) {
      if (!acc[c.parentId]) acc[c.parentId] = [];
      acc[c.parentId].push(c);
    }
    return acc;
  }, {});

  const totalCount = comments.length;

  return (
    <div className="w-full bg-[#181818] border-t border-[#333333] p-3 sm:p-5 space-y-4">
      {/* Thread Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2d2d2d]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#C8102E]" />
          <h4 className="font-['Oswald'] text-sm sm:text-base font-bold uppercase tracking-wider text-white">
            Discussion & Build Notes
          </h4>
          <span className="px-2 py-0.5 bg-[#252525] border border-[#3d3d3d] text-[#aaaaaa] font-mono text-[11px]">
            {totalCount} {totalCount === 1 ? 'comment' : 'comments'}
          </span>
        </div>
      </div>

      {/* Root Composer (Add Top-Level Comment) */}
      <form onSubmit={handleSubmitRoot} className="space-y-2 bg-[#202020] border border-[#383838] p-3 sm:p-3.5">
        <div className="flex items-start gap-2.5">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 object-cover border border-[#444444] shrink-0"
          />
          <div className="flex-1 min-w-0 space-y-2">
            <textarea
              rows={2}
              value={rootContent}
              onChange={(e) => setRootContent(e.target.value)}
              placeholder="Comment..."
              className="w-full bg-[#161616] border border-[#3a3a3a] focus:border-[#C8102E] p-2 text-xs sm:text-sm text-white placeholder-[#777777] focus:outline-none resize-none leading-relaxed"
            />

            {/* Staged Photo */}
            {rootPhoto && (
              <div className="relative inline-block border border-[#C8102E]/60 bg-black p-1">
                <img
                  src={rootPhoto}
                  alt="Staged comment upload"
                  className="w-24 h-16 sm:w-28 sm:h-20 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setRootPhoto(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#C8102E] hover:bg-black text-white border border-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Remove photo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Composer Controls */}
        <div className="flex items-center justify-between pt-1 border-t border-[#2d2d2d]">
          <div className="flex items-center gap-2">
            <input
              ref={rootFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleRootPhotoUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={!!rootPhoto}
              onClick={() => rootFileInputRef.current?.click()}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono border transition-colors cursor-pointer ${
                rootPhoto
                  ? 'border-[#444444] text-[#666666] cursor-not-allowed bg-[#181818]'
                  : 'border-[#444444] hover:border-white text-[#aaaaaa] hover:text-white bg-[#1a1a1a]'
              }`}
              title={rootPhoto ? 'Photo added' : 'Add photo'}
            >
              <Camera className="w-3.5 h-3.5 text-[#C8102E]" />
              <span className="hidden sm:inline">{rootPhoto ? 'Photo Added' : 'Photo'}</span>
              <span className="sm:hidden">{rootPhoto ? 'Added' : 'Photo'}</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!rootContent.trim() && !rootPhoto}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#C8102E] hover:bg-[#e01334] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
          >
            <span>Post</span>
            <Send className="w-3 h-3 shrink-0" />
          </button>
        </div>
      </form>

      {/* Comment Threads List */}
      <div className="space-y-4 pt-1">
        {rootComments.length === 0 ? (
          <div className="border border-[#333333] bg-[#1d1d1d] p-6 text-center text-xs font-mono text-[#888888]">
            No comments yet. Be the first to start the discussion!
          </div>
        ) : (
          rootComments.map((rootComment) => {
            const replies = repliesByParentId[rootComment.id] || [];
            const isAuthor = rootComment.author.id === currentUser.id;
            const isLiked = likedCommentIds.has(rootComment.id);
            const isDisliked = dislikedCommentIds.has(rootComment.id);
            const displayLikes = (rootComment.likesCount || 0) + (isLiked ? 1 : 0);
            const displayDislikes = (rootComment.dislikesCount || 0) + (isDisliked ? 1 : 0);
            const isReplying = replyingToId === rootComment.id;

            return (
              <div
                key={rootComment.id}
                className="border border-[#303030] bg-[#1e1e1e] p-3 sm:p-4 space-y-3"
              >
                {/* Root Comment Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rootComment.author.avatar}
                      alt={rootComment.author.name}
                      className="w-8 h-8 object-cover border border-[#444444]"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-['Oswald'] text-xs sm:text-sm font-bold uppercase text-white tracking-wide">
                          {rootComment.author.name.replace(/^@/, '')}
                        </span>
                        {isAuthor && (
                          <span className="px-1.5 py-0.2 bg-[#C8102E]/20 text-[#C8102E] border border-[#C8102E]/40 text-[9px] font-mono uppercase">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-[#666666]">
                        {rootComment.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Actions for comment author */}
                  {isAuthor && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(rootComment)}
                        className="p-1 text-[#888888] hover:text-white border border-transparent hover:border-[#444444] transition-colors cursor-pointer"
                        title="Edit Comment"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteComment(rootComment.id)}
                        className="p-1 text-[#888888] hover:text-[#ef4444] border border-transparent hover:border-[#ef4444]/40 transition-colors cursor-pointer"
                        title="Delete Comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Comment Content */}
                <p className="text-xs sm:text-sm text-[#e0e0e0] leading-relaxed whitespace-pre-line pl-0.5">
                  {rootComment.content}
                </p>

                {/* Attached Photo - Full width of comment card, clickable thumbnail */}
                {rootComment.photoUrl && (
                  <div className="pt-1">
                    <div
                      onClick={() => onOpenLightbox?.(rootComment.photoUrl!)}
                      className="-mx-3 sm:-mx-4 overflow-hidden bg-black cursor-pointer group relative border-y border-[#303030]"
                      title="Click to view full resolution"
                    >
                      <img
                        src={rootComment.photoUrl}
                        alt="Comment attachment"
                        className="w-full max-h-80 sm:max-h-96 object-cover group-hover:scale-102 transition-transform duration-200"
                      />
                    </div>
                  </div>
                )}

                {/* Bottom Bar: Like, Dislike & Reply Trigger */}
                <div className="flex items-center gap-2 sm:gap-3 pt-2 border-t border-[#282828] text-xs font-mono">
                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleCommentLike(rootComment.id)}
                    className={`flex items-center gap-1.5 px-2 py-1 border transition-colors cursor-pointer ${
                      isLiked
                        ? 'border-[#C8102E] text-[#C8102E] bg-[#C8102E]/10 font-bold'
                        : 'border-[#383838] text-[#888888] hover:text-white hover:border-[#555555]'
                    }`}
                    title="Love this comment (🤟)"
                  >
                    <LoveYouGesture className="w-3 h-3" filled={isLiked} />
                    <span>{displayLikes}</span>
                  </button>

                  {/* Dislike Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleCommentDislike(rootComment.id)}
                    className={`flex items-center gap-1.5 px-2 py-1 border transition-colors cursor-pointer ${
                      isDisliked
                        ? 'border-[#888888] text-white bg-[#444444] font-bold'
                        : 'border-[#383838] text-[#666666] hover:text-[#aaaaaa] hover:border-[#555555]'
                    }`}
                    title="Dislike this comment (👎)"
                  >
                    <ThumbsDown className={`w-3 h-3 ${isDisliked ? 'fill-current' : ''}`} />
                    <span>{displayDislikes}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartReply(rootComment)}
                    className={`flex items-center gap-1.5 px-2 py-1 border transition-colors cursor-pointer ${
                      isReplying
                        ? 'border-[#C8102E] text-white bg-[#C8102E]'
                        : 'border-[#383838] text-[#aaaaaa] hover:text-white hover:border-[#555555]'
                    }`}
                  >
                    <CornerDownRight className="w-3 h-3 text-[#C8102E]" />
                    <span>Reply</span>
                    {replies.length > 0 && <span>({replies.length})</span>}
                  </button>
                </div>

                {/* Inline Reply Composer */}
                {isReplying && (
                  <div className="mt-3 pl-3 sm:pl-4 border-l-2 border-[#C8102E] space-y-2 bg-[#181818] p-2.5 sm:p-3 animate-fade-in">
                    <div className="flex items-center justify-between text-xs font-mono text-[#aaaaaa]">
                      <span>Replying to {rootComment.author.name.replace(/^@/, '')}</span>
                      <button
                        type="button"
                        onClick={handleCancelReply}
                        className="text-[#777777] hover:text-white transition-colors p-0.5 cursor-pointer"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Comment..."
                      className="w-full bg-[#121212] border border-[#3a3a3a] focus:border-[#C8102E] p-2 text-xs text-white placeholder-[#777777] focus:outline-none resize-none leading-relaxed"
                    />

                    <div className="flex items-center justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleSubmitReply(rootComment.id, rootComment.author.name)}
                        disabled={!replyContent.trim()}
                        className="px-4 py-1.5 bg-[#C8102E] hover:bg-[#e01334] disabled:opacity-40 text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                )}

                {/* Nested Threaded Replies */}
                {replies.length > 0 && (
                  <div className="mt-3 pl-3 sm:pl-5 border-l-2 border-[#C8102E]/60 space-y-3 pt-2">
                    {replies.map((reply) => {
                      const isReplyAuthor = reply.author.id === currentUser.id;
                      const isReplyLiked = likedCommentIds.has(reply.id);
                      const isReplyDisliked = dislikedCommentIds.has(reply.id);
                      const displayReplyLikes = (reply.likesCount || 0) + (isReplyLiked ? 1 : 0);
                      const displayReplyDislikes = (reply.dislikesCount || 0) + (isReplyDisliked ? 1 : 0);

                      return (
                        <div
                          key={reply.id}
                          className="bg-[#181818] border border-[#2d2d2d] p-3 space-y-2 relative"
                        >
                          {/* Thread connector indicator */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <img
                                src={reply.author.avatar}
                                alt={reply.author.name}
                                className="w-6 h-6 object-cover border border-[#444444]"
                              />
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-['Oswald'] text-xs font-bold uppercase text-white tracking-wide">
                                    {reply.author.name.replace(/^@/, '')}
                                  </span>
                                  {isReplyAuthor && (
                                    <span className="px-1 py-0.1 bg-[#C8102E]/20 text-[#C8102E] border border-[#C8102E]/40 text-[8px] font-mono uppercase">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] font-mono text-[#666666]">
                                  {reply.createdAt}
                                </span>
                              </div>
                            </div>

                            {/* Author Actions */}
                            {isReplyAuthor && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(reply)}
                                  className="p-1 text-[#888888] hover:text-white border border-transparent hover:border-[#444444] transition-colors cursor-pointer"
                                  title="Edit Reply"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteComment(reply.id)}
                                  className="p-1 text-[#888888] hover:text-[#ef4444] border border-transparent hover:border-[#ef4444]/40 transition-colors cursor-pointer"
                                  title="Delete Reply"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Reply Content */}
                          <p className="text-xs text-[#d8d8d8] leading-relaxed whitespace-pre-line pl-0.5">
                            {reply.content}
                          </p>

                          {/* Reply Attached Photo - Full width of sub-comment card, clickable thumbnail */}
                          {reply.photoUrl && (
                            <div className="pt-0.5">
                              <div
                                onClick={() => onOpenLightbox?.(reply.photoUrl!)}
                                className="-mx-3 overflow-hidden bg-black cursor-pointer group relative border-y border-[#2d2d2d]"
                                title="Click to view full resolution"
                              >
                                <img
                                  src={reply.photoUrl}
                                  alt="Reply attachment"
                                  className="w-full h-40 sm:h-52 object-cover group-hover:scale-102 transition-transform duration-200"
                                />
                              </div>
                            </div>
                          )}

                          {/* Reply Bottom Actions: Like, Dislike & Reply */}
                          <div className="flex items-center gap-2 pt-1 border-t border-[#222222] text-[11px] font-mono">
                            <button
                              type="button"
                              onClick={() => handleToggleCommentLike(reply.id)}
                              className={`flex items-center gap-1 px-1.5 py-0.5 border transition-colors cursor-pointer ${
                                isReplyLiked
                                  ? 'border-[#C8102E] text-[#C8102E] bg-[#C8102E]/10 font-bold'
                                  : 'border-[#333333] text-[#888888] hover:text-white'
                              }`}
                              title="Love this reply (🤟)"
                            >
                              <LoveYouGesture className="w-2.5 h-2.5" filled={isReplyLiked} />
                              <span>{displayReplyLikes}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleCommentDislike(reply.id)}
                              className={`flex items-center gap-1 px-1.5 py-0.5 border transition-colors cursor-pointer ${
                                isReplyDisliked
                                  ? 'border-[#888888] text-white bg-[#444444] font-bold'
                                  : 'border-[#333333] text-[#666666] hover:text-[#aaaaaa]'
                              }`}
                              title="Dislike this reply (👎)"
                            >
                              <ThumbsDown className={`w-2.5 h-2.5 ${isReplyDisliked ? 'fill-current' : ''}`} />
                              <span>{displayReplyDislikes}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStartReply(reply)}
                              className="flex items-center gap-1 px-1.5 py-0.5 border border-[#333333] hover:border-[#555555] text-[#888888] hover:text-white transition-colors cursor-pointer"
                            >
                              <CornerDownRight className="w-2.5 h-2.5 text-[#C8102E]" />
                              <span>Reply</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================
          EDIT COMMENT MODAL
          Strict Rule: No redundant buttons in the modal!
          Header has 'X' close button.
          Footer has strictly Delete (optional) & Save Changes.
         ======================================================== */}
      {editingComment && (
        <div
          onClick={() => setEditingComment(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[85vh] flex flex-col bg-[#202020] border border-[#444444] shadow-2xl overflow-hidden"
          >
            {/* Modal Header: Title + single top-right 'X' close button */}
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-[#181818] border-b border-[#333333] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#C8102E]" />
                <h3 className="font-['Oswald'] text-base font-bold uppercase tracking-wider text-white">
                  Edit Comment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingComment(null)}
                className="text-[#888888] hover:text-white p-1 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#aaaaaa] mb-1.5">
                    Comment Content
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Edit..."
                    className="w-full bg-[#161616] border border-[#444444] focus:border-[#C8102E] p-3 text-xs sm:text-sm text-white focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Photo Attachment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#aaaaaa] flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#C8102E]" />
                      <span>Attached Photo</span>
                    </label>
                    {editPhoto && (
                      <span className="text-[10px] font-mono text-[#4ade80]">
                        Photo attached
                      </span>
                    )}
                  </div>

                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditPhotoUpload}
                    className="hidden"
                  />

                  {editPhoto ? (
                    <div className="relative border border-[#444444] bg-black p-2 flex items-center justify-between gap-3">
                      <img
                        src={editPhoto}
                        alt="Current attachment"
                        className="w-24 h-16 object-cover border border-[#333333]"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => editFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 text-xs font-mono border border-[#555555] hover:border-white text-white bg-[#252525] transition-colors cursor-pointer"
                        >
                          Replace Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditPhoto(null)}
                          className="p-1.5 text-[#ef4444] hover:bg-[#ef4444] hover:text-white border border-[#ef4444]/40 transition-colors cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => editFileInputRef.current?.click()}
                      className="border border-dashed border-[#444444] hover:border-[#888888] bg-[#1a1a1a] p-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4 text-[#C8102E]" />
                      <span className="text-xs font-['Oswald'] font-bold uppercase tracking-wider text-white">
                        Upload Photo
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Actions:
                  Single horizontal row, NO redundant cancel button!
                  (Delete Comment on Left, Save Changes on Right) */}
              <div className="p-3 sm:px-5 sm:py-3.5 border-t border-[#333333] bg-[#181818] shrink-0">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
                  <button
                    type="button"
                    onClick={handleDeleteFromEditModal}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono text-[#ef4444] hover:text-white bg-[#ef4444]/10 hover:bg-[#ef4444] border border-[#ef4444]/40 transition-colors cursor-pointer text-center"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Delete Comment</span>
                  </button>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#C8102E] hover:bg-[#e01334] text-white text-xs font-['Oswald'] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadedComments;
