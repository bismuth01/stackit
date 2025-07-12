import React, { useState } from 'react';
import { X } from 'lucide-react';

const TagInput = ({ tags, onChange, placeholder = "Add tags..." }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length) {
      e.preventDefault();
      const updatedTags = [...tags];
      updatedTags.pop();
      onChange(updatedTags);
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="border border-[#5c4f6e] bg-[#1e1a2e] text-[#b3a8c9] rounded-lg p-3 focus-within:ring-2 focus-within:ring-purple-500 transition">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="bg-[#5c4f6e] text-[#e4dff2] px-2 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-[#7e6c9c]"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-purple-300 hover:text-purple-400 transition"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm placeholder-[#8c82a4] focus:outline-none"
      />
    </div>
  );
};

export default TagInput;
