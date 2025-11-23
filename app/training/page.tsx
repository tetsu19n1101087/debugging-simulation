'use client';

import Link from 'next/link';
import { TrainingCodeViewer } from '@/components/training-code-viewer';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function TrainingPage() {
  const taskMap: Record<string, { title: string; lead: string; note: string }> =
    {
      // library: {
      //   title: 'トレーニング — 図書館管理',
      //   lead: 'このトレーニングでは図書館管理システムに関するコードを読み、問題箇所を見つける練習をします。',
      //   note: '操作は自由ですが、ログや選択は保存されません。表示や確認に集中してください。',
      // },
      // database: {
      //   title: 'トレーニング — データベース',
      //   lead: 'データベース周りのコードを読む練習です。接続やクエリの流れを追ってください。',
      //   note: 'このページでは操作は記録されません。安心して試してください。',
      // },
      // ui: {
      //   title: 'トレーニング — UI 表示',
      //   lead: '表示ロジックや出力に着目する練習用のページです。',
      //   note: '選択や操作は一時的にのみ有効で、保存されません。',
      // },
      default: {
        title: 'トレーニング',
        lead: 'このトレーニングではコードを読み、挙動を理解する練習をします。',
        note: '操作は保存されないため、表示の確認に集中できます。',
      },
    };

  const { title, lead, note } = taskMap.default;

  return (
    <main className='min-h-screen bg-background'>
      <div className='container mx-auto max-w-5xl px-6 py-8'>
        <div className='bg-amber-950/50 border border-amber-700/50 rounded-lg p-6 mb-6'>
          <div className='flex items-start gap-4'>
            <AlertCircle className='w-6 h-6 text-amber-500 shrink-0 mt-1' />
            <div className='flex-1'>
              <h2 className='text-xl font-semibold text-amber-400 mb-2'>
                {title}
              </h2>
              <p className='text-amber-100/90 leading-relaxed mb-3'>{lead}</p>
              <p className='text-amber-100/80 text-sm'>{note}</p>
            </div>
          </div>
        </div>
      </div>
      <TrainingCodeViewer />
      <div className='container mx-auto max-w-5xl px-6 pb-12'>
        <div className='flex flex-col items-center gap-4'>
          <div className='flex justify-center'>
            <Button asChild size='lg' className='text-lg px-8 py-6'>
              <Link href='/task-select'>トレーニングを終了する</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
