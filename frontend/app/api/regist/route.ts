import { NextRequest, NextResponse } from 'next/server';

const apiHost = process.env.API_HOST;
const apiStage = process.env.API_STAGE;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const res = await fetch(`https://${apiHost}/${apiStage}/regist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        credentials: 'include',
        cache: 'no-store'
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
