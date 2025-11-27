'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TaskSelectPage() {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState('');

  const tasks = [
    {
      id: 'duplicate',
      title: 'エラー1：本の重複',
    },
    {
      id: 'exceed',
      title: 'エラー2：貸出上限超過',
    },
    {
      id: 'return',
      title: 'エラー3：返却の誤処理',
    },
  ];

  const handleTaskChange = (taskId: string) => {
    setSelectedTask(taskId);
  };

  const handleStart = () => {
    if (selectedTask) {
      router.push(`/test?task=${encodeURIComponent(selectedTask)}`);
    }
  };

  return (
    <main className='min-h-screen bg-background'>
      <div className='container mx-auto max-w-5xl px-6 py-8'>
        <div className='bg-card border-border rounded-lg p-6 mb-6'>
          <h1 className='text-2xl font-semibold mb-4'>タスク選択</h1>
          <p className='text-sm text-muted-foreground mb-6'>
            参加者は実験者の指示に従って、タスクを選択してください。
          </p>

          <div className='max-w-md'>
            <label
              htmlFor='task-select'
              className='block text-sm font-medium mb-2'
            >
              タスクを選択:
            </label>
            <select
              id='task-select'
              value={selectedTask}
              onChange={(e) => handleTaskChange(e.target.value)}
              className='w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
            >
              <option value=''>-- タスクを選んでください --</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>

            <Button
              onClick={handleStart}
              disabled={!selectedTask}
              className='w-full mt-4'
              size='lg'
            >
              開始する
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
