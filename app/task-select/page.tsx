import Link from 'next/link';

export default function TaskSelectPage() {
  const tasks = [
    {
      id: 'library',
      title: '図書館管理システムのバグ',
      desc: '図書館管理に関するロジックの不具合を見つけてください。',
    },
    {
      id: 'database',
      title: 'データベース接続の不具合',
      desc: 'DB接続／クエリに関する問題を特定してください。',
    },
    {
      id: 'ui',
      title: 'フロントエンド表示の不具合',
      desc: 'UI 表示やスタイルに関する問題を調査してください。',
    },
  ];

  return (
    <main className='min-h-screen bg-background'>
      <div className='container mx-auto max-w-5xl px-6 py-8'>
        <div className='bg-card border-border rounded-lg p-6 mb-6'>
          <h1 className='text-2xl font-semibold mb-4'>タスク選択</h1>
          <p className='text-sm text-muted-foreground mb-4'>
            実行したいデバッグタスクを選んでください。選択すると該当タスクでテストページが開きます。
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {tasks.map((t) => (
              <Link
                key={t.id}
                href={`/test?task=${encodeURIComponent(t.id)}`}
                className='block rounded-lg border border-border p-4 hover:shadow-md'
              >
                <h2 className='font-medium mb-1'>{t.title}</h2>
                <p className='text-sm text-muted-foreground'>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
