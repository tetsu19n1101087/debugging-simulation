'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

export default function TaskHeaderClient({
  onTaskParamAction,
}: {
  onTaskParamAction?: (task: string) => void;
}) {
  const searchParams = useSearchParams();
  const taskParam = searchParams?.get('task') ?? 'duplicate';

  useEffect(() => {
    if (onTaskParamAction) onTaskParamAction(taskParam);
  }, [taskParam, onTaskParamAction]);

  const taskMap: Record<string, { title: string; lead: string }> = {
    duplicate: {
      title: '本の重複',
      lead: '同じ図書番号（ISBN）を持つ別の本を図書館に追加できてしまいます。既存データが上書きされる、または同一図書が二重に登録される恐れがあります。',
    },
    exceed: {
      title: '貸出上限超過',
      lead: '図書館のメンバーが許容される貸出冊数を超えても貸出が許可されてしまいます',
    },
    return: {
      title: '返却の誤処理',
      lead: '他のメンバーが借りている本を、実際に借りていない別のメンバーが返却できてしまいます。',
    },
  };

  const { title, lead } = taskMap[taskParam];

  return (
    <div className='container mx-auto max-w-5xl px-6 py-8'>
      <div className='bg-amber-950/50 border border-amber-700/50 rounded-lg p-6'>
        <div className='flex items-start gap-4'>
          <AlertCircle className='w-6 h-6 text-amber-500 shrink-0 mt-1' />
          <div className='flex-1'>
            <h2 className='text-xl font-semibold text-amber-400 mb-2'>
              エラー：{title}
            </h2>
            <p className='text-amber-100/90 leading-relaxed mb-3'>{lead}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
