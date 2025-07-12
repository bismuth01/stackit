import React, { useState } from 'react';
import RichTextEditor from '../components/RichTextEditor';
import TagInput from '../components/TagInput';

const AskQuestionPage = ({ onQuestionSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    const plainText = description.replace(/<(.|\n)*?>/g, '').trim();
    if (!plainText) newErrors.description = 'Description is required';
    if (tags.length === 0) newErrors.tags = 'At least one tag is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onQuestionSubmit({
        title: title.trim(),
        description: description.trim(),
        tags
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[#b3a8c9]">
      <h1 className="text-3xl font-bold text-[#b3a8c9] mb-8">Ask a Question</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title for your question"
            className={`w-full px-4 py-2 rounded-lg bg-[#1e1a2e] text-[#b3a8c9] focus:outline-none focus:ring-2 focus:ring-[#5c4f6e] ${
              errors.title ? 'border border-red-500' : 'border border-[#5c4f6e]'
            }`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description *
          </label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Provide details about your question. Include what you've tried and what you're looking for."
          />
          {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-2">
            Tags *
          </label>
          <TagInput
            tags={tags}
            onChange={setTags}
            placeholder="Add tags (press Enter or comma)"
          />
          {errors.tags && <p className="mt-1 text-sm text-red-400">{errors.tags}</p>}
          <p className="mt-1 text-sm text-gray-400">
            Add up to 5 tags to describe what your question is about
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-[#5c4f6e] text-white px-6 py-2 rounded-lg hover:bg-[#6e5c8f] focus:outline-none focus:ring-2 focus:ring-[#5c4f6e]"
          >
            Post Question
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-700 text-gray-200 px-6 py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AskQuestionPage;
