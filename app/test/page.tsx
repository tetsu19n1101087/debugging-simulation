'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { PythonCodeViewer } from '@/components/python-code-viewer';
import { Button } from '@/components/ui/button';
import TaskHeaderClient from './TaskHeaderClient';

export default function TestPage() {
  const router = useRouter();
  const [task, setTask] = useState<string>('default');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEnd = async () => {
    setIsSending(true);
    setErrorMsg(null);
    try {
      const logsRaw = localStorage.getItem('experimentClickLogs');
      const linesRaw = localStorage.getItem('experimentSelectedLines');
      const sessionId = localStorage.getItem('experimentSessionId');
      const logs = logsRaw ? JSON.parse(logsRaw) : [];
      const selectedRows = linesRaw ? JSON.parse(linesRaw) : [];

      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs, selectedRows, task, sessionId }),
      });
      const json = await res.json();
      if (json.success) {
        // clear local session/logs
        localStorage.removeItem('experimentClickLogs');
        localStorage.removeItem('experimentSelectedLines');
        localStorage.removeItem('experimentSessionId');
        router.push('/end');
      } else {
        setErrorMsg(json.error ?? '送信に失敗しました');
      }
    } catch (err: any) {
      setErrorMsg(String(err));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className='min-h-screen bg-background'>
      <div className='container mx-auto max-w-5xl px-6 mt-8'>
        <p className='text-base mb-2'>
          以下のソースコードは、図書館における蔵書と利用者を管理し、本の貸出・返却を取り扱うための処理を記述したものです。
        </p>
        <p className='text-base'>
          エラーの説明を読んで、原因となるソースコード内のバグを見つけてください。
        </p>
      </div>
      <Suspense
        fallback={
          <div className='container mx-auto max-w-5xl px-6 py-8'>
            <div className='bg-amber-950/50 border border-amber-700/50 rounded-lg p-6'>
              <div className='flex items-start gap-4'>
                <div className='w-6 h-6 mt-1 rounded-full bg-amber-500/60' />
                <div className='flex-1'>
                  <div className='h-6 w-3/5 bg-amber-400/30 rounded mb-2' />
                  <div className='h-4 w-4/5 bg-amber-100/10 rounded mb-2' />
                  <div className='h-3 w-1/2 bg-amber-100/8 rounded' />
                </div>
              </div>
            </div>
          </div>
        }
      >
        <TaskHeaderClient onTaskParamAction={setTask} />
      </Suspense>
      <div className='container mx-auto max-w-5xl px-6 py-4'>
        <p className='text-base mb-2'>
          バグがあると思う行を全て選択したら、下の「実験を終了する」ボタンを押してください。
        </p>
      </div>
      <PythonCodeViewer />
      <div className='container mx-auto max-w-5xl px-6 pb-12'>
        <div className='flex flex-col items-center gap-4'>
          <div className='flex justify-center'>
            <Button
              size='lg'
              className='text-lg px-8 py-6'
              onClick={handleEnd}
              disabled={isSending}
            >
              {isSending ? '送信中…' : '実験を終了する'}
            </Button>
          </div>
          {errorMsg && <div className='text-sm text-red-500'>{errorMsg}</div>}
        </div>
      </div>
    </main>
  );
}
