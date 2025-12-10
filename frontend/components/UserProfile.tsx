'use client';

import { MiniAppUser } from '@/hooks/useMiniAppContext';

interface UserProfileProps {
  user?: MiniAppUser;
}

/**
 * UserProfile component displays Farcaster user information
 * Shows username, avatar, and handles guest mode when user is not authenticated
 */
export function UserProfile({ user }: UserProfileProps) {
  if (!user) {
    // Guest mode - user not authenticated
    return (
      <div className="flex items-center gap-2 text-matrix-green font-mono text-sm">
        <div className="w-8 h-8 rounded-full bg-matrix-green/20 flex items-center justify-center">
          <span className="text-xs">👤</span>
        </div>
        <span className="opacity-70">Guest</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-matrix-green font-mono text-sm">
      {/* Avatar */}
      {user.pfpUrl ? (
        <img
          src={user.pfpUrl}
          alt={user.displayName || user.username || 'User'}
          className="w-8 h-8 rounded-full border border-matrix-green"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-matrix-green/20 flex items-center justify-center border border-matrix-green">
          <span className="text-xs">👤</span>
        </div>
      )}

      {/* User info */}
      <div className="flex flex-col">
        {user.displayName && (
          <span className="font-semibold">{user.displayName}</span>
        )}
        {user.username && (
          <span className="text-xs opacity-70">@{user.username}</span>
        )}
        {!user.displayName && !user.username && (
          <span className="opacity-70">FID: {user.fid}</span>
        )}
      </div>
    </div>
  );
}
