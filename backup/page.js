'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ManageSurveys() {
  const [surveys, setSurveys] = useState([]);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: []
  });

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    const res = await fetch('/api/surveys');
    if (res.ok) {
      const data = await res.json();
      setSurveys(Array.isArray(data) ? data : []);
    } else {
      setSurveys([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingSurvey ? 'PUT' : 'POST';
    const url = editingSurvey ? `/api/surveys` : `/api/surveys`;
    console.log("Url: "+url);
    console.log("Editing Survey: "+editingSurvey);
    
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSurvey ? { id: editingSurvey._id, ...formData } : formData)
      });
      console.log(JSON.stringify(editingSurvey ? { id: editingSurvey._id, ...formData } : formData))
      console.log("Successfully submitted");
    } catch (err) {
      console.log(err);
    }
    
    setFormData({ title: '', description: '', questions: [] });
    setEditingSurvey(null);
    await fetchSurveys();
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', type: 'text', options: [] }]
    }));
  };

  const deleteSurvey = async (id) => {
    await fetch('/api/surveys', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    await fetchSurveys();
  };

  return (
    <div className="container">
      <h1 className="text-xl font-bold mb-4">Manage Surveys</h1>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="text-input"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="text-input"
          />
        </div>

        {formData.questions.map((question, qIndex) => (
          <div key={qIndex} className="card">
            <div className="flex justify-between">
              <h3 className="form-title">Question {qIndex + 1}</h3>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  questions: prev.questions.filter((_, i) => i !== qIndex)
                }))}
                className="danger-button"
              >
                Remove
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Question text"
              value={question.text}
              onChange={e => setFormData(prev => {
                const newQuestions = [...prev.questions];
                newQuestions[qIndex].text = e.target.value;
                return { ...prev, questions: newQuestions };
              })}
              className="text-input"
              required
            />
            
            <select
              value={question.type}
              onChange={e => setFormData(prev => {
                const newQuestions = [...prev.questions];
                newQuestions[qIndex].type = e.target.value;
                if (e.target.value === 'multipleChoice') {
                  newQuestions[qIndex].options = [];
                }
                return { ...prev, questions: newQuestions };
              })}
              className="text-input"
            >
              <option value="text">Text Answer</option>
              <option value="multipleChoice">Multiple Choice</option>
            </select>

            {question.type === 'multipleChoice' && (
              <div className="form-group">
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={e => setFormData(prev => {
                        const newQuestions = [...prev.questions];
                        newQuestions[qIndex].options[oIndex] = e.target.value;
                        return { ...prev, questions: newQuestions };
                      })}
                      className="text-input"
                      placeholder="Option"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => {
                        const newQuestions = [...prev.questions];
                        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
                        return { ...prev, questions: newQuestions };
                      })}
                      className="danger-button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData(prev => {
                    const newQuestions = [...prev.questions];
                    newQuestions[qIndex].options.push('');
                    return { ...prev, questions: newQuestions };
                  })}
                  className="secondary-button"
                >
                  Add Option
                </button>
              </div>
            )}
          </div>
        ))}

        <div className="button-group">
          <button
            type="button"
            onClick={addQuestion}
            className="secondary-button"
          >
            Add Question
          </button>
          <button
            type="submit"
            className="primary-button"
          >
            {editingSurvey ? 'Update Survey' : 'Create Survey'}
          </button>
        </div>
      </form>

      <div className="card-container">
        {surveys.map(survey => (
          <div key={survey._id} className="card">
            <h3 className="text-xl font-semibold">{survey.title}</h3>
            <p className="description">{survey.description}</p>
            <div className="button-group">
              <button
                onClick={() => {
                  setEditingSurvey(survey);
                  setFormData({
                    title: survey.title,
                    description: survey.description,
                    questions: survey.questions
                  });
                }}
                className="secondary-button"
              >
                Edit
              </button>
              <button
                onClick={() => deleteSurvey(survey._id)}
                className="danger-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}