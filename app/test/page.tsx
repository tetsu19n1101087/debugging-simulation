'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PythonCodeViewer } from '@/components/python-code-viewer';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function TestPage() {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEnd = async () => {
    setIsSending(true);
    setErrorMsg(null);
    try {
      const logsRaw = localStorage.getItem('experimentClickLogs');
      const linesRaw = localStorage.getItem('experimentSelectedLines');
      const logs = logsRaw ? JSON.parse(logsRaw) : [];
      const selectedRows = linesRaw ? JSON.parse(linesRaw) : [];

      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs, selectedRows }),
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
      <div className='container mx-auto max-w-5xl px-6 py-8'>
        <div className='bg-amber-950/50 border border-amber-700/50 rounded-lg p-6 mb-6'>
          <div className='flex items-start gap-4'>
            <AlertCircle className='w-6 h-6 text-amber-500 shrink-0 mt-1' />
            <div className='flex-1'>
              <h2 className='text-xl font-semibold text-amber-400 mb-2'>
                デバッグタスク
              </h2>
              <p className='text-amber-100/90 leading-relaxed mb-3'>
                以下のPythonコードには、図書館管理システムに関するエラーが含まれています。
                コードを確認し、エラーの原因を特定してください。
              </p>
              <p className='text-amber-100/80 text-sm'>
                各ファイルのタブを切り替えたり、クラスやメソッドを展開して調査することができます。
              </p>
            </div>
          </div>
        </div>
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
