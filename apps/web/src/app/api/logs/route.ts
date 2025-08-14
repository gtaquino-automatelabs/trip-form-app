import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { logs } = await request.json();
    
    // In production, you would send these to a monitoring service like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - New Relic
    // - Custom logging service
    
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to monitoring service
      // await sendToMonitoringService(logs);
      
      // For now, just log to server console
      console.log('[CLIENT LOGS]', JSON.stringify(logs, null, 2));
    } else {
      // In development, log to console
      console.group('[CLIENT LOGS - Development]');
      logs.forEach((log: any) => {
        const method = log.level === 'error' ? 'error' : log.level === 'warning' ? 'warn' : 'log';
        console[method](`[${log.timestamp}] ${log.message}`, log);
      });
      console.groupEnd();
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing logs:', error);
    return NextResponse.json(
      { error: 'Failed to process logs' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}