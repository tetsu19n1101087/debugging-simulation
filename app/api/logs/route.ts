import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type IncomingLog = {
  sessionId: string;
  type: string;
  location: string;
  timestamp: number | string;
};

export async function POST(req: Request) {
  const supabase = await createClient();

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
      session_id: l.sessionId,
      event_type: l.type,
      location: l.location,
      occurred_at: new Date(
        typeof l.timestamp === 'number' ? l.timestamp : Number(l.timestamp)
      ).toISOString(),
    }));

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

    // If selectedRows were sent, store them in the separate selected_rows table keyed by session_id
    let selectedSaved = false;
    try {
      const sessionId =
        logs.find((l: IncomingLog) => l.sessionId)?.sessionId ?? null;

      if (Array.isArray(selectedRows) && selectedRows.length > 0 && sessionId) {
        const { error: upsertError } = await supabase
          .from('selected_rows')
          .upsert(
            { session_id: sessionId, selected_rows: selectedRows },
            { onConflict: 'session_id' }
          );

        if (upsertError) {
          return NextResponse.json(
            { success: false, error: upsertError.message },
            { status: 500 }
          );
        }

        selectedSaved = true;
      }
    } catch (e) {
      return NextResponse.json(
        { success: false, error: String(e) },
        { status: 500 }
      );
    }

    const count = Array.isArray(data) ? data.length : 0;
    return NextResponse.json({ success: true, count, selectedSaved });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
