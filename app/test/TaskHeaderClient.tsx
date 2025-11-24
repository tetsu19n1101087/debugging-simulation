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
  const taskParam = searchParams?.get('task') ?? 'default';

  useEffect(() => {
    if (onTaskParamAction) onTaskParamAction(taskParam);
  }, [taskParam, onTaskParamAction]);

  const taskMap: Record<string, { title: string; lead: string; note: string }> =
    {
      library: {
        title: 'デバッグタスク — 図書館管理',
        lead: '以下のPythonコードには、図書館管理システムに関するエラーが含まれています。コードを確認し、エラーの原因を特定してください。',
        note: '各ファイルのタブを切り替えたり、クラスやメソッドを展開して調査することができます。',
      },
      database: {
        title: 'デバッグタスク — データベース',
        lead: '以下のPythonコードには、データベース接続やクエリ実行に関する問題が含まれています。接続周り・SQL・例外処理を中心に調査してください。',
        note: 'テーブルやクエリの実装を確認し、再現手順を推定してください。',
      },
      ui: {
        title: 'デバッグタスク — UI 表示',
        lead: '以下のPythonコードと成果物にはフロントエンド表示の不具合に繋がる挙動があります。表示ロジックやデータ整形を確認してください。',
        note: 'スタイルや出力内容に着目して問題箇所を特定してください。',
      },
      default: {
        title: 'デバッグタスク',
        lead: '以下のPythonコードには、図書館管理システムに関するエラーが含まれています。コードを確認し、エラーの原因を特定してください。',
        note: '各ファイルのタブを切り替えたり、クラスやメソッドを展開して調査することができます。',
      },
    };

  const { title, lead, note } = taskMap[taskParam] ?? taskMap.default;

  return (
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
  );
}
