'use client';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { SendHorizontalIcon } from 'lucide-react';

export default function AnswerSurvey() {
  const [surveys, setSurveys] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [otherSpecifies, setOtherSpecifies] = useState({});

  useEffect(() => {
    fetch('/api/surveys')
      .then(res => res.json())
      .then(data => setSurveys(data));
  }, []);

  // useEffect(() => {
    // if (surveys.length != 0) {
    //   setSelectedSurvey(surveys[0]);
    // }
  // },[surveys])

  useEffect(() => {
    fetch('/api/server')
      .then(res => res.json())
      .then(data => setSelectedId(data[0].SelectedSurvey))
  })

  useEffect(() => {
    if (surveys.length != 0) {
      console.log(selectedId)
      surveys.forEach(element => {
        if (element._id === selectedId) {
          setSelectedSurvey(element);
          console.log(element)
        }
      });
    }
    console.log(surveys)
  }, [surveys])

  const handleSubmit = async () => {
    const answersWithOthers = { ...answers };
    for (const questionIndex in otherSpecifies) {
      answersWithOthers[questionIndex] = otherSpecifies[questionIndex];
    }

    await fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        surveyId: selectedSurvey._id,
        answers: answersWithOthers
      })
    });
    alert('Response submitted!');
    setAnswers({});
    setOtherSpecifies({});
  };

  return (
    <div>
      {!selectedSurvey ? (
        <div>
          <h1>Loading...</h1>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Label htmlFor="r1" className="text-2xl font-bold text-center mb-4">{selectedSurvey.title}</Label>
          
          {selectedSurvey.questions?.map((question, index) => (
            <Card key={question._id || index} className='mb-6'>
              <CardHeader>
                <CardTitle>{question.text}</CardTitle>
              </CardHeader>
              <CardContent>
                {question.type === 'multipleChoice' ? (
                  <RadioGroup 
                  value={answers[index] || ""}
                  onValueChange={(value) => setAnswers(prev => ({
                    ...prev,
                    [index]: value
                  }))} 
                  >
                    {question.options.map(option => (
                      <div className="flex items-center space-x-2 text-lg" key={option}>
                        <RadioGroupItem 
                          value={option} 
                          name={`question-${index}`}
                          className="w-6 h-6"
                          onChange={(e) => setAnswers(prev => ({
                            ...prev,
                            [index]: e.target.value
                          }))}
                        />
                        <Label htmlFor="r1" >{option}</Label>
                        {option === 'Others (Specify)' && (
                          <input
                            type="text"
                            className="border-b rounded p-1 w-50"
                            onChange={(e) => setOtherSpecifies(prev => ({
                              ...prev,
                              [index]: e.target.value
                            }))}
                            value={otherSpecifies[index] || ''}
                          />
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <Textarea 
                    placeholder="Type your answer here."
                    className='resize-none'
                    onChange={(e) => setAnswers(prev => ({
                      ...prev,
                      [index]: e.target.value
                    }))}
                  />
                )}
              </CardContent>
            </Card>
          ))}
          
          <div>
            <Button 
              type="submit" 
              disabled={Object.keys(answers).length !== selectedSurvey.questions.length}
              className="w-full mb-4"  
            >
              <SendHorizontalIcon />
              Submit Responses
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}