'use client';
import React, { useEffect, useState, JSX } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

interface QuestionChartProps {
  questionText: string;
  answerCounts: { [key: string]: number };
  questionType: string;
}

// Component to render the chart for each question
const QuestionChart = ({ questionText, answerCounts, questionType }: QuestionChartProps): JSX.Element => {
  const chartData = Object.entries(answerCounts).map(([answer, count]) => ({
    name: answer,
    value: count,
  }));

  const chartConfig = {
    answer: {
      label: "Answer",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
            width={500}
            height={300}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="value" fill="var(--color-answer)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

// Function to fetch responses
const useResponses = () => {
  const [responses, setResponses] = useState<any[]>([]);

  useEffect(() => {
    const fetchResponses = async () => {
      const res = await fetch('/api/responses');
      if (res.ok) {
        const data = await res.json();
        setResponses(Array.isArray(data) ? data : []);
      } else {
        setResponses([]);
      }
    };

    fetchResponses();
  }, []);

  return responses;
};

// Function to fetch surveys
const useSurveys = () => {
  const [surveys, setSurveys] = useState<any[]>([]);

  useEffect(() => {
    const fetchSurveys = async () => {
      const res = await fetch('/api/surveys');
      if (res.ok) {
        const data = await res.json();
        setSurveys(Array.isArray(data) ? data : []);
      } else {
        setSurveys([]);
      }
    };

    fetchSurveys();
  }, []);

  return surveys;
};

export default function Dashboard(): React.ReactNode {
  const responses = useResponses();
  const surveys = useSurveys();
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setRefresh(false);
  }, [responses, surveys]);

  // Helper function to group responses by question
  const groupResponsesByQuestion = () => {
    if (!surveys.length || !responses.length) return [];

    const survey = surveys[0]; // Assuming only one survey for now
    const groupedResponses: { questionText: string; answerCounts: { [x: string]: number; }; questionType: string; options: any[]; }[] = [];

    survey.questions.forEach((question: any, questionIndex: number) => {
      const answerCounts: { [key: string]: number } = {};
      if (question.type === 'multipleChoice') {
        question.options.forEach((option: any) => {
          answerCounts[option] = 0; // Initialize all options to 0
        });
        responses.forEach(response => {
          const answer = response.answers[questionIndex];
          answerCounts[answer] = (answerCounts[answer] || 0) + 1;
        });
      } else if (question.type === 'text') {
        responses.forEach(response => {
          const answer = response.answers[questionIndex];
          answerCounts[answer] = (answerCounts[answer] || 0) + 1;
        });
      }

      groupedResponses.push({
        questionText: question.text,
        answerCounts,
        questionType: question.type,
        options: question.options
      });
    });

    return groupedResponses;
  };

  const groupedResponses = groupResponsesByQuestion();

  const deleteSurvey = async (id: string) => {
    await fetch('/api/responses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    alert('Deleted Successfully!\nPlease refresh the page to see the changes.');
  };

  return (
    <div className='p-10'>
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>

      <div className="flex p-4 gap-2">
        <Card>
          <CardTitle className='ml-2'>Total Responses</CardTitle>
          <CardHeader className='text-2xl'>{responses.length}/50</CardHeader>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4">
        {groupedResponses.map((group, index) => (
          <Card key={index} className="w-full max-w-[500px]">
            <CardHeader>
              <CardTitle>{group.questionText}</CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionChart
                questionText={group.questionText}
                answerCounts={group.answerCounts}
                questionType={group.questionType}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='mt-10'>
      <h1 className="text-xl font-bold mb-4">Survey Responses</h1>
        {responses.map((response, index) => (
          <div key={index} className='mb-5'>
            <Card>
              <CardTitle className='ml-5 mb-2 mt-3'>{response.title || 'Unknown Survey'}</CardTitle>
              <CardDescription className='ml-5 mb-5'>{new Date(response.timestamp).toLocaleString()}</CardDescription>
              <CardContent>
                <div className="form-group">
                  {Object.entries(response.answers).map(([questionIndex, answer]) => (
                    <div key={questionIndex} className='mb-5'>
                      <p>{surveys[0]?.questions[questionIndex]?.text ? surveys[0]?.questions[questionIndex]?.text+": " : 'Question text not available'}</p>
                      <Label>{answer as React.ReactNode}</Label>
                    </div>
                  ))}
                </div>
                <Button
                    onClick={() => deleteSurvey(response._id)}
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