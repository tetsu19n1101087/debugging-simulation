import { PythonCodeViewer } from '@/components/python-code-viewer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function TestPage() {
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
        <div className='flex justify-center'>
          <Link href='/end'>
            <Button size='lg' className='text-lg px-8 py-6'>
              実験を終了する
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
