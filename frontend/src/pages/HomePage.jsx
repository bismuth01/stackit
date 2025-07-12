import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import QuestionCard from "../components/QuestionCard";
import dataManager from "../services/dataManager.js";

const HomePage = ({
  questions,
  onQuestionClick,
  searchQuery,
  onSearchChange,
}) => {
  const [sortBy, setSortBy] = useState("newest");
  const [filterTag, setFilterTag] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [displayQuestions, setDisplayQuestions] = useState(questions);
  const [isSearching, setIsSearching] = useState(false);

  // Load tags from API
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tagsData = await dataManager.getTags();
        setAllTags(tagsData.map((tag) => tag.name) || []);
      } catch (error) {
        console.error("Failed to load tags:", error);
        // Fallback to extracting tags from questions
        setAllTags([...new Set(questions.flatMap((q) => q.tags))]);
      }
    };
    loadTags();
  }, [questions]);

  // Handle search with API integration
  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const searchResults = await dataManager.searchQuestions(searchQuery);
          setDisplayQuestions(searchResults || []);
        } catch (error) {
          console.error("Search failed:", error);
          // Fallback to local search
          const localResults = questions.filter(
            (q) =>
              q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              q.description.toLowerCase().includes(searchQuery.toLowerCase()),
          );
          setDisplayQuestions(localResults);
        } finally {
          setIsSearching(false);
        }
      } else {
        setDisplayQuestions(questions);
      }
    };

    const timeoutId = setTimeout(handleSearch, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchQuery, questions]);

  const filteredQuestions = displayQuestions
    .filter((q) => {
      const matchesTag = !filterTag || q.tags.includes(filterTag);
      return matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "votes":
          return b.votes - a.votes;
        case "answers":
          return b.answers - a.answers;
        default:
          return 0;
      }
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Questions</h1>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="votes">Most Votes</option>
            <option value="answers">Most Answers</option>
          </select>

          {/* Tag Filter */}
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {isSearching
                ? "Searching..."
                : `Found ${filteredQuestions.length} result${filteredQuestions.length !== 1 ? "s" : ""} for "${searchQuery}"`}
            </p>
          </div>
        )}
      </div>

      {/* Question List */}
      <div className="space-y-6">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery
                ? `No questions found for "${searchQuery}".`
                : "No questions found."}
            </p>
            {searchQuery && (
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search terms or browse all questions.
              </p>
            )}
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
