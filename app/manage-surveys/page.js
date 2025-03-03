'use client';
import { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { SelectGroup } from '@radix-ui/react-select';

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
    <div className=''>
      <Label htmlFor="r1" className="text-2xl font-bold text-center mb-4">Manage Surveys</Label>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <Label htmlFor="title" className='text-2xl'>Title</Label>
            <Input 
              type='text' 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
            <Label 
              htmlFor="description" 
              className='text-2xl'>
              Description
            </Label>
            <Textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </CardHeader>
        </Card>

        {formData.questions.map((question, qIndex) => (
          <div key={qIndex} className='mt-5'>
            <Card>
                <CardHeader>
                  <h3>Question {qIndex + 1}</h3>
                  <Button
                    type='button' 
                    variant={'destructive'}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      questions: prev.questions.filter((_, i) => i !== qIndex)
                    }))}
                  >
                  Remove
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      type="text"
                      placeholder="Question text"
                      value={question.text}
                      onChange={e => setFormData(prev => {
                        const newQuestions = [...prev.questions];
                        newQuestions[qIndex].text = e.target.value;
                        return { ...prev, questions: newQuestions };
                      })}
                    />

                    <Select value={question.type} onValueChange={value => setFormData(prev => {
                      const newQuestions = [...prev.questions];
                      newQuestions[qIndex].type = value;
                      if (value === 'multipleChoice') {
                        newQuestions[qIndex].options = [];
                      }
                        return { ...prev, questions: newQuestions };
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="text">Text Answer</SelectItem>
                          <SelectItem value="multipleChoice">Multiple Choice</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {question.type === 'multipleChoice' && (
                      <div>
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2 mb-2">
                            <Input
                              type="text"
                              value={option}
                              onChange={e => setFormData(prev => {
                                const newQuestions = [...prev.questions];
                                newQuestions[qIndex].options[oIndex] = e.target.value;
                                return { ...prev, questions: newQuestions };
                              })}
                              className='w-100'
                              placeholder="Option"
                            />
                            <Button
                              type='button'
                              onClick={() => setFormData(prev => {
                                const newQuestions = [...prev.questions];
                                newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
                                return { ...prev, questions: newQuestions };
                              })}
                              variant={'destructive'}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                            type='button'
                            onClick={() => setFormData(prev => {
                              const newQuestions = [...prev.questions];
                              newQuestions[qIndex].options.push('');
                              return { ...prev, questions: newQuestions };
                            })}
                            variant={'secondary'}
                          >
                            Add Option
                          </Button>
                          <Button
                              type='button'
                              onClick={() => setFormData(prev => {
                                const newQuestions = [...prev.questions];
                                newQuestions[qIndex].options.push('Others (Specify)');
                                return { ...prev, questions: newQuestions };
                              })}
                              variant={'secondary'}
                            >
                              Add &apos;Others&apos; Option
                            </Button>
                    </div>
                  )}
                </CardContent>
            </Card>
          </div>
        ))}

        <div className="flex items-center gap-2 mb-2 mt-2 mb-5">
          <Button
            type="button"
            onClick={addQuestion}
            variant={'outline'}
          >
            Add Question
          </Button>
          <Button
            type="submit"
            variant={'default'}
          >
            {editingSurvey ? 'Update Survey' : 'Create Survey'}
          </Button>
        </div>
      </form>

      <div>
        {surveys.map(survey => (
          <div key={survey._id}>
            <Card>
              <CardHeader>{survey.title}</CardHeader>
              <CardDescription className='ml-5'>{survey.description}</CardDescription>
              <CardContent className="flex items-center gap-2 mb-2 mt-5">
                <Button
                  onClick={() => {
                    setEditingSurvey(survey);
                    setFormData({
                      title: survey.title,
                      description: survey.description,
                      questions: survey.questions
                    });
                  }}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => deleteSurvey(survey._id)}
                  variant={'destructive'}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}