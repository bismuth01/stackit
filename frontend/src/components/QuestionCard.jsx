import React from 'react';
import {
  ChevronUp,
  MessageCircle,
  Eye,
  Check
} from 'lucide-react';

const QuestionCard = ({ question, onQuestionClick }) => {
  return (
    <div
      onClick={() => onQuestionClick(question)}
      className="bg-[#1e1a2e] p-6 rounded-2xl shadow-md border border-[#5c4f6e] hover:shadow-xl hover:border-purple-500 transition-all cursor-pointer overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 overflow-x-hidden">
          <h3 className="text-lg font-semibold text-[#b3a8c9] mb-2 hover:text-purple-400 transition-colors">
            {question.title}
          </h3>

          <div
            className="text-[#c3b9d9] mb-4 line-clamp-3 overflow-hidden prose max-w-none"
            dangerouslySetInnerHTML={{ __html: question.description }}
          />

          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded-full text-sm max-w-xs"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-[#a69bbd]">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <ChevronUp className="w-4 h-4 mr-1" />
                {question.votes}
              </span>
              <span className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                {question.answers}
              </span>
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {question.views}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {question.accepted && (
                <span className="text-green-400 flex items-center ml-1">
                  <Check className="w-4 h-4" />
                </span>
              )}
              <span>by {question.author}</span>
              <span>{new Date(question.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
