import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function QuizView({ quiz, module, onBack, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [quizComplete, setQuizComplete] = useState(false)

  const question = quiz.questions[currentQuestion]
  const totalQuestions = quiz.questions.length

  const handleAnswer = (index) => {
    if (selectedAnswer !== null) return
    
    setSelectedAnswer(index)
    setShowExplanation(true)
    
    const isCorrect = index === question.correct
    if (isCorrect) setScore(score + 1)
    
    setAnswers([...answers, {
      question: currentQuestion,
      selected: index,
      correct: question.correct,
      isCorrect
    }])
  }

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setQuizComplete(true)
      if (score >= totalQuestions * 0.7) {
        onComplete()
      }
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore(0)
    setAnswers([])
    setQuizComplete(false)
  }

  if (quizComplete) {
    const passed = score >= totalQuestions * 0.7
    return (
      <div className="quiz-view">
        <div className="quiz-complete">
          <h2>Quiz Complete!</h2>
          <div className={`score-display ${passed ? 'passed' : 'failed'}`}>
            <div className="score-number">{score}/{totalQuestions}</div>
            <div className="score-percent">{Math.round((score / totalQuestions) * 100)}%</div>
            <div className="score-status">{passed ? '✓ Passed!' : '✗ Keep Practicing'}</div>
          </div>
          
          <div className="answers-review">
            <h3>Review:</h3>
            {answers.map((ans, idx) => (
              <div key={idx} className={`review-item ${ans.isCorrect ? 'correct' : 'incorrect'}`}>
                <span className="review-icon">{ans.isCorrect ? '✓' : '✗'}</span>
                <span>Question {idx + 1}</span>
              </div>
            ))}
          </div>

          <div className="quiz-actions">
            <button className="retry-btn" onClick={resetQuiz}>Retry Quiz</button>
            <button className="back-btn" onClick={onBack}>Back to Course</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-view">
      <div className="quiz-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>{quiz.title}</h2>
        <div className="quiz-progress">
          Question {currentQuestion + 1} of {totalQuestions}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="quiz-question">
        <h3>{question.question}</h3>
        
        {question.code && (
          <div className="question-code">
            <div className="code-block">
              <pre><code>{question.code}</code></pre>
            </div>
          </div>
        )}

        <div className="options">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              className={`option-btn ${
                selectedAnswer === idx
                  ? idx === question.correct
                    ? 'correct'
                    : 'incorrect'
                  : idx === question.correct && showExplanation
                    ? 'correct'
                    : ''
              }`}
              onClick={() => handleAnswer(idx)}
              disabled={selectedAnswer !== null}
            >
              <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>

        {showExplanation && (
          <div className="explanation">
            <ReactMarkdown>{question.explanation}</ReactMarkdown>
          </div>
        )}

        {selectedAnswer !== null && (
          <button className="next-btn" onClick={nextQuestion}>
            {currentQuestion < totalQuestions - 1 ? 'Next Question' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  )
}
