'use client';
import { useEffect, useState } from 'react';

export default function AnswerSurvey() {
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetch('/api/surveys')
      .then(res => res.json())
      .then(data => setSurveys(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        surveyId: selectedSurvey._id,
        answers
      })
    });
    alert('Response submitted!');
    setSelectedSurvey(null);
  };

  return (
    <div>
      <h1>Available Surveys</h1>
      
      {!selectedSurvey ? (
        <div>
          {surveys.map(survey => (
            <div key={survey._id}>
              <h2>{survey.title}</h2>
              <p>{survey.description}</p>
              <button
                onClick={() => setSelectedSurvey(survey)}
              >
                Take Survey
              </button>
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2>{selectedSurvey.title}</h2>
          
          {selectedSurvey.questions?.map((question, index) => (
            <div key={index}>
              <label>
                {question.text}
              </label>
              {question.type === 'multipleChoice' ? (
                question.options.map(option => (
                  <div key={option}>
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      onChange={(e) => setAnswers(prev => ({
                        ...prev,
                        [index]: e.target.value
                      }))}
                    />
                    <label>{option}</label>
                  </div>
                ))
              ) : (
                <textarea
                  onChange={(e) => setAnswers(prev => ({
                    ...prev,
                    [index]: e.target.value
                  }))}
                />
              )}
            </div>
          ))}
          
          <div>
            <button
              type="button"
              onClick={() => setSelectedSurvey(null)}
            >
              Back
            </button>
            <button
              type="submit"
            >
              Submit Responses
            </button>
          </div>
        </form>
      )}
    </div>
  );
}