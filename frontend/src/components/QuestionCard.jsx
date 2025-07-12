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
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
            {question.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-3">
            {question.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <ChevronUp className="w-4 h-4 mr-1" />
                {question.votes} votes
              </span>
              <span className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                {question.answers} answers
              </span>
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {question.views} views
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {question.accepted && (
                <span className="text-green-600 flex items-center">
                  <Check className="w-4 h-4 mr-1" />
                  Accepted
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
