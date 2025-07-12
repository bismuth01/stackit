import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Check } from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';

const QuestionDetailPage = ({
  question,
  answers,
  onBackToHome,
  onAnswerSubmit,
  onVote,
  onAcceptAnswer,
  user
}) => {
  const [newAnswer, setNewAnswer] = useState('');
  const [showAnswerForm, setShowAnswerForm] = useState(false);

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    const plainText = newAnswer.replace(/<(.|\n)*?>/g, '').trim();
    if (plainText) {
      onAnswerSubmit({
        questionId: question.id,
        content: newAnswer.trim(),
      });
      setNewAnswer('');
      setShowAnswerForm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[#b3a8c9]">
      <button
        onClick={onBackToHome}
        className="mb-6 text-[#b3a8c9] hover:text-[#ffffff] flex items-center"
      >
        ← Back to Questions
      </button>

      {/* Question */}
      <div className="bg-[#1e1a2e] p-6 rounded-lg shadow-sm border border-[#5c4f6e] mb-8">
        <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
        <div className="prose max-w-none text-[#b3a8c9] mb-6">
          <div dangerouslySetInnerHTML={{ __html: question.description }} />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {question.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-[#5c4f6e] text-white px-2 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onVote(question.id, 'up', 'question')}
                className="p-1 hover:bg-[#5c4f6e] rounded"
              >
                <ChevronUp className="w-5 h-5 text-[#b3a8c9]" />
              </button>
              <span className="font-semibold">{question.votes}</span>
              <button
                onClick={() => onVote(question.id, 'down', 'question')}
                className="p-1 hover:bg-[#5c4f6e] rounded"
              >
                <ChevronDown className="w-5 h-5 text-[#b3a8c9]" />
              </button>
            </div>
            <span>{question.views} views</span>
          </div>
          <span>
            Asked by {question.author} on{' '}
            {new Date(question.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Answers */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-6">
          {answers.length} Answer{answers.length !== 1 ? 's' : ''}
        </h2>

        {answers.map((answer) => (
          <div
            key={answer.id}
            className="bg-[#1e1a2e] p-6 rounded-lg shadow-sm border border-[#5c4f6e] mb-4"
          >
            {answer.accepted && (
              <div className="flex items-center text-green-400 mb-4">
                <Check className="w-5 h-5 mr-2" />
                <span className="font-semibold">Accepted Answer</span>
              </div>
            )}

            <div className="prose max-w-none text-[#b3a8c9] mb-4">
              <div dangerouslySetInnerHTML={{ __html: answer.content }} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onVote(answer.id, 'up', 'answer')}
                    className="p-1 hover:bg-[#5c4f6e] rounded"
                  >
                    <ChevronUp className="w-5 h-5 text-[#b3a8c9]" />
                  </button>
                  <span className="font-semibold">{answer.votes}</span>
                  <button
                    onClick={() => onVote(answer.id, 'down', 'answer')}
                    className="p-1 hover:bg-[#5c4f6e] rounded"
                  >
                    <ChevronDown className="w-5 h-5 text-[#b3a8c9]" />
                  </button>
                </div>

                {user && user.username === question.author && !answer.accepted && (
                  <button
                    onClick={() => onAcceptAnswer(answer.id)}
                    className="text-green-400 hover:text-green-500 flex items-center"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept Answer
                  </button>
                )}
              </div>

              <span>
                Answered by {answer.author} on{' '}
                {new Date(answer.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Answer Form */}
      {user && (
        <div className="bg-[#1e1a2e] p-6 rounded-lg shadow-sm border border-[#5c4f6e]">
          <h3 className="text-lg font-semibold mb-4">Your Answer</h3>

          {!showAnswerForm ? (
            <button
              onClick={() => setShowAnswerForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Write an Answer
            </button>
          ) : (
            <form onSubmit={handleAnswerSubmit}>
              <div className="mb-4">
                <RichTextEditor
                  value={newAnswer}
                  onChange={setNewAnswer}
                  placeholder="Write your answer here..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Post Answer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAnswerForm(false);
                    setNewAnswer('');
                  }}
                  className="bg-[#5c4f6e] text-white px-6 py-2 rounded-lg hover:bg-[#6f5e86]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionDetailPage;
