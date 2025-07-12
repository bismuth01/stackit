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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBackToHome}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
      >
        ← Back to Questions
      </button>

      {/* Question */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
        <div className="prose max-w-none text-gray-700 mb-6">
          <div dangerouslySetInnerHTML={{ __html: question.description }} />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {question.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onVote(question.id, 'up', 'question')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronUp className="w-5 h-5 text-gray-600" />
              </button>
              <span className="font-semibold">{question.votes}</span>
              <button
                onClick={() => onVote(question.id, 'down', 'question')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronDown className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <span className="text-sm text-gray-500">{question.views} views</span>
          </div>
          <div className="text-sm text-gray-500">
            Asked by {question.author} on {new Date(question.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {answers.length} Answer{answers.length !== 1 ? 's' : ''}
        </h2>

        {answers.map((answer) => (
          <div key={answer.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4">
            {answer.accepted && (
              <div className="flex items-center text-green-600 mb-4">
                <Check className="w-5 h-5 mr-2" />
                <span className="font-semibold">Accepted Answer</span>
              </div>
            )}

            <div className="prose max-w-none text-gray-700 mb-4">
              <div dangerouslySetInnerHTML={{ __html: answer.content }} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onVote(answer.id, 'up', 'answer')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="font-semibold">{answer.votes}</span>
                  <button
                    onClick={() => onVote(answer.id, 'down', 'answer')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {user && user.username === question.author && !answer.accepted && (
                  <button
                    onClick={() => onAcceptAnswer(answer.id)}
                    className="text-green-600 hover:text-green-800 flex items-center"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept Answer
                  </button>
                )}
              </div>

              <div className="text-sm text-gray-500">
                Answered by {answer.author} on {new Date(answer.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Answer Form */}
      {user && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>

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
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
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
