import React, { useState } from 'react';
import { Search } from 'lucide-react';
import QuestionCard from '../components/QuestionCard';

const HomePage = ({ questions, onQuestionClick, searchQuery, onSearchChange }) => {
  const [sortBy, setSortBy] = useState('newest');
  const [filterTag, setFilterTag] = useState('');

  const allTags = [...new Set(questions.flatMap(q => q.tags))];

  const filteredQuestions = questions
    .filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            q.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !filterTag || q.tags.includes(filterTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'votes':
          return b.votes - a.votes;
        case 'answers':
          return b.answers - a.answers;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-[#1e1a2e] text-[#b3a8c9] px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#e5e1f2] mb-6">Explore Questions</h1>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-[#8b7da7]" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#2a253a] text-[#d6cde5] border border-[#5c4f6e] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-[#8b7da7]"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#2a253a] text-[#d6cde5] border border-[#5c4f6e] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="newest">Newest</option>
            <option value="votes">Most Votes</option>
            <option value="answers">Most Answers</option>
          </select>

          {/* Tag Filter */}
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="bg-[#2a253a] text-[#d6cde5] border border-[#5c4f6e] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-6">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#8b7da7] text-lg">No questions found.</p>
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onQuestionClick={onQuestionClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;
