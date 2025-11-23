'use client';

import Link from 'next/link';
import { TrainingCodeViewer } from '@/components/training-code-viewer';
import { Button } from '@/components/ui/button';
// import { AlertCircle } from 'lucide-react';

export default function TrainingPage() {
  // const taskMap: Record<string, { title: string; lead: string; note: string }> =
  //   {
  //     library: {
  //       title: 'トレーニング — 図書館管理',
  //       lead: 'このトレーニングでは図書館管理システムに関するコードを読み、問題箇所を見つける練習をします。',
  //       note: '操作は自由ですが、ログや選択は保存されません。表示や確認に集中してください。',
  //     },
  //     database: {
  //       title: 'トレーニング — データベース',
  //       lead: 'データベース周りのコードを読む練習です。接続やクエリの流れを追ってください。',
  //       note: 'このページでは操作は記録されません。安心して試してください。',
  //     },
  //     ui: {
  //       title: 'トレーニング — UI 表示',
  //       lead: '表示ロジックや出力に着目する練習用のページです。',
  //       note: '選択や操作は一時的にのみ有効で、保存されません。',
  //     },
  //     default: {
  //       title: 'トレーニング',
  //       lead: 'このトレーニングではコードを読み、挙動を理解する練習をします。',
  //       note: '操作は保存されないため、表示の確認に集中できます。',
  //     },
  //   };

  // const { title, lead, note } = taskMap.default;

  return (
    <main className='min-h-screen bg-background'>
      <div className='container mx-auto max-w-5xl px-6 pt-8'>
        <h3 className='text-lg font-semibold text-slate-100 mb-3'>操作説明</h3>
        <ol className='list-decimal list-inside space-y-2 text-sm text-slate-200 mb-6'>
          <li>
            ファイル名のタブをクリックすることで、表示するソースコードを切り替えられます。
          </li>
          <li>
            ソースコードのうち、メソッドの中身などは非表示になっています。メソッド名をクリックすることで、中身が表示されます。
          </li>
          <li>
            ソースコードの各行の左にはチェックボックスが表示されています。その行にバグが含まれると思う場合は、チェックしてください。
          </li>
        </ol>
      </div>

      <TrainingCodeViewer />

      <div className='container mx-auto max-w-5xl px-6'>
        <p className='text-sm text-slate-200 mb-6'>操作方法が確認できたら、「トレーニングを終了する」ボタンを押してください。</p>
      </div>

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
