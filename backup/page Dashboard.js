'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    const res = await fetch('/api/responses');
    if (res.ok) {
      const data = await res.json();
      setResponses(Array.isArray(data) ? data : []);
    } else {
      setResponses([]);
    }
  };

  const deleteSurvey = async (id) => {
    await fetch('/api/responses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
  };

  return (
    <div className="container">
      <h1 className="text-xl font-bold mb-4">Survey Responses Dashboard</h1>
      
      <div className="grid">
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">Total Responses</h2>
          <p className="text-3xl">{responses.length}</p>
        </div>
        
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">Surveys Completed</h2>
          <p className="text-3xl">
            {new Set(responses.map(r => r.surveyId)).size}
          </p>
        </div>
      </div>

      <div className="card-container">
        {responses.map((response, index) => (
          <div key={index} className="card">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="form-title">
                  {response.title || 'Unknown Survey'}
                </h3>
                <p className="description">
                  {new Date(response.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="form-group">
              {Object.entries(response.answers).map(([questionIndex, answer]) => (
                <div key={questionIndex}>
                  <p className="form-label">
                    {response.survey?.[0]?.questions[questionIndex]?.text || 'Question'}
                  </p>
                  <p className="description">{answer}</p>
                </div>
              ))}
            </div>
            <button
                onClick={() => deleteSurvey(response._id)}
                className="danger-button"
              >
                Delete
              </button>
          </div>
        ))}
      </div>
    </div>
  );
}