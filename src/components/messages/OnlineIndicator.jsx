import React from 'react';

export default function OnlineIndicator({ isOnline, lastSeen, size = 'sm' }) {
  const dotSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5';
  const borderSize = size === 'sm' ? 'border-[1.5px]' : 'border-2';

  if (isOnline) {
    return (
      <span className={`block ${dotSize} rounded-full bg-green-500 ${borderSize} border-white`} />
    );
  }

  return (
    <span className={`block ${dotSize} rounded-full bg-gray-300 ${borderSize} border-white`} title={lastSeen ? `Vu le ${lastSeen}` : 'Hors ligne'} />
  );
}