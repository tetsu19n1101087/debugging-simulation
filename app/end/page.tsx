'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function EndPage() {
  type ClickLog = {
    type: string;
    location: string;
    timestamp: number;
    sessionId?: string;
  };
  const [clickLogs, setClickLogs] = useState<ClickLog[]>([]);
  const [selectedLines, setSelectedLines] = useState<string[]>([]);

  useEffect(() => {
    const logs = localStorage.getItem('experimentClickLogs');
    if (logs) {
      try {
        const parsed: ClickLog[] = JSON.parse(logs);
        if (Array.isArray(parsed)) setClickLogs(parsed);
      } catch {
        // ignore parse error
      }
    }

    const linesData = localStorage.getItem('experimentSelectedLines');
    if (linesData) {
      setSelectedLines(JSON.parse(linesData));
    }
  }, []);

  const getSectionName = (id: string) => {
    const parts = id.split('-');
    if (parts.length >= 3) {
      const fileName = parts[0];
      const type = parts[1];
      const name = parts.slice(2).join('-');
      return `${fileName}.py - ${
        type === 'method' ? 'メソッド' : type === 'function' ? '関数' : 'クラス'
      }: ${name}`;
    }
    return id;
  };

  const parseLineId = (lineId: string) => {
    const parts = lineId.split('-line-');
    if (parts.length === 2) {
      const sectionId = parts[0];
      const lineNumber = Number.parseInt(parts[1]) + 1; // Convert to 1-based
      return `${getSectionName(sectionId)} - 行 ${lineNumber}`;
    }
    return lineId;
  };

  const handleReturnToTop = () => {
    localStorage.removeItem('experimentClickLogs');
    localStorage.removeItem('experimentSelectedLines');
    localStorage.removeItem('experimentSessionId');
  };

  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSendAndReturn = async () => {
    setIsSending(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: clickLogs, selectedRows: selectedLines }),
      });
      const json = await res.json();
      if (json.success) {
        // clear local storage and session
        handleReturnToTop();
        router.push('/');
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
    <main className='min-h-screen bg-background flex items-center justify-center p-8'>
      <div className='text-center space-y-6 max-w-3xl w-full'>
        <h1 className='text-4xl font-bold text-foreground'>実験終了</h1>
        <p className='text-lg text-muted-foreground'>
          ご協力ありがとうございました。
        </p>

        {selectedLines.length > 0 && (
          <Card className='p-6 text-left'>
            <h2 className='text-2xl font-semibold mb-4'>
              選択された行（バグ報告）
            </h2>
            <div className='space-y-2'>
              {selectedLines.map((lineId) => (
                <div
                  key={lineId}
                  className='py-2 px-3 border-l-4 border-primary bg-primary/5'
                >
                  <span className='text-sm text-foreground font-mono'>
                    {parseLineId(lineId)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {clickLogs.length > 0 && (
          <Card className='p-6 text-left'>
            <h2 className='text-2xl font-semibold mb-4'>操作ログ</h2>
            <div className='space-y-2'>
              {clickLogs
                .slice()
                .reverse()
                .map((entry, idx) => (
                  <div
                    key={`${entry.type}-${entry.location}-${entry.timestamp}-${idx}`}
                    className='py-2 px-3 border-l-4 border-primary bg-primary/5'
                  >
                    <div className='flex justify-between items-center'>
                      <div>
                        <div className='text-sm text-muted-foreground font-mono'>
                          種類: {entry.type}
                        </div>
                        <div className='text-sm text-foreground font-mono'>
                          場所: {entry.location}
                        </div>
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}

        <div className='flex items-center justify-center gap-4'>
          <Button
            size='lg'
            className='text-lg px-8 py-6'
            onClick={handleSendAndReturn}
            disabled={isSending || clickLogs.length === 0}
          >
            {isSending ? '送信中...' : '結果を送信してトップへ'}
          </Button>
          <Link href='/'>
            <Button
              size='lg'
              variant='ghost'
              className='text-lg px-8 py-6'
              onClick={handleReturnToTop}
            >
              送信せずに戻る
            </Button>
          </Link>
        </div>
        {errorMsg && <div className='text-red-500 mt-3'>{errorMsg}</div>}
      </div>
    </main>
  );
}
