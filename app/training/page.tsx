'use client';

import Link from 'next/link';
import { TrainingCodeViewer } from '@/components/training-code-viewer';
import { Button } from '@/components/ui/button';

export default function TrainingPage() {
  return (
    <main className='min-h-screen bg-background'>
      <div className='container mx-auto max-w-5xl px-6 pt-8'>
        <h3 className='text-lg font-semibold text-slate-100 mb-3'>操作説明</h3>
        <ol className='list-decimal list-inside space-y-2 text-slate-200 mb-6'>
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
        <p>
          例として、fizzbuzz.py の fizzbuzz
          メソッドにはバグがあります。チェックボックスを使ってバグのある行を選択してください。
        </p>
      </div>
      <TrainingCodeViewer />
      <div className='container mx-auto max-w-5xl px-6'>
        <p className=' text-slate-200 mb-6'>
          操作方法が確認できたら、「トレーニングを終了する」ボタンを押してください。
        </p>
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
