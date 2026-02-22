import React, { useState } from 'react';

const EMOJI_CATEGORIES = {
  '😊': ['😊', '😂', '🥰', '😍', '🤩', '😘', '😎', '🥳', '🤗', '😇', '🙂', '😉', '😋', '🤭', '😜', '😝', '🤪', '😏', '😒', '😔', '😢', '😭', '😤', '😠', '🤬', '😱', '😨', '😰', '😥', '😓'],
  '❤️': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💔', '🫀', '💋', '💏', '💑', '👫', '👬', '👭'],
  '👋': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '✌️', '🤞', '🫰', '🤟', '🤘', '👍', '👎', '👏', '🙌', '🫶', '🤝', '🙏', '💪', '🫂', '👀', '💅', '🤳'],
  '🎉': ['🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🥂', '🍾', '🌹', '💐', '🌸', '🌺', '🌻', '🌼', '🌷', '✨', '⭐', '🌟', '💫', '🔥', '🎯', '🏆', '🥇', '🎶'],
  '🐶': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐔', '🐧', '🐦', '🦋', '🌈', '☀️', '🌙'],
};

export default function EmojiPicker({ onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState('😊');

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-72 p-3" onClick={e => e.stopPropagation()}>
      {/* Category tabs */}
      <div className="flex gap-1 mb-3 border-b pb-2">
        {Object.keys(EMOJI_CATEGORIES).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 py-1 text-base rounded-lg transition-colors ${activeCategory === cat ? 'bg-amber-100' : 'hover:bg-gray-100'}`}
          >
            {cat}
          </button>
        ))}
      </div>
      {/* Emojis */}
      <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
        {EMOJI_CATEGORIES[activeCategory].map((emoji, i) => (
          <button
            key={i}
            onClick={() => onSelect(emoji)}
            className="text-xl p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}