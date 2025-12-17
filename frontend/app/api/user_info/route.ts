import { NextRequest, NextResponse } from 'next/server';

const apiHost = process.env.API_HOST;
const apiStage = process.env.API_STAGE;

export async function GET(req: NextRequest) {
    // 環境変数未設定や接続失敗時でもUIを壊さないようnullを返す
    if (!apiHost || !apiStage) {
        return NextResponse.json(null, { status: 200 });
    }
    try {
        const res = await fetch(`https://${apiHost}/${apiStage}/user_info`, {
            headers: {
                'Content-Type': 'application/json',
                cookie: req.headers.get('cookie') ?? ''
            },
            // 異ホストでも throwaway-session を送るため手動でCookieを付与
            credentials: 'include',
            cache: 'no-store',
            next: { revalidate: 0 }
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json(null, { status: 200 });
    }
}
