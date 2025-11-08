import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type IncomingLog = {
  type: string;
  location: string;
  timestamp: number | string;
  sessionId?: string;
  meta?: any;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { logs, selectedRows } = body || {};

    if (!Array.isArray(logs) || logs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'logs must be a non-empty array' },
        { status: 400 }
      );
    }

    const rows = logs.map((l: IncomingLog) => ({
      session_id: l.sessionId ?? (l as any).session_id ?? null,
      event_type: l.type,
      location: l.location,
      occurred_at: new Date(
        typeof l.timestamp === 'number' ? l.timestamp : Number(l.timestamp)
      ).toISOString(),
      meta: { ...(l.meta || {}), selectedRows: selectedRows ?? [] },
    }));

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('click_logs')
      .insert(rows)
      .select('id');

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const count = Array.isArray(data) ? data.length : 0;
    return NextResponse.json({ success: true, count });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
