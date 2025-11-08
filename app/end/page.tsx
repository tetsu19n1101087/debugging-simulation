'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EndPage() {
  return (
    <main className='min-h-screen bg-background flex items-center justify-center p-8'>
      <div className='text-center space-y-6 max-w-3xl w-full'>
        <h1 className='text-4xl font-bold text-foreground'>実験終了</h1>
        <p className='text-lg text-muted-foreground'>
          ご協力ありがとうございました。
        </p>
        <div className='flex items-center justify-center gap-4 mt-6'>
          <Link href='/'>
            <Button size='lg' className='text-lg px-8 py-6'>
              トップページに戻る
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
