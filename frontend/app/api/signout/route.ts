import { NextRequest, NextResponse } from 'next/server';

const apiHost = process.env.API_HOST;
const apiStage = process.env.API_STAGE;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_: NextRequest) {
    const res = await fetch(`https://${apiHost}/${apiStage}/signout`, {
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        cache: 'no-store',
        next: { revalidate: 0 }
    });
    return NextResponse.json(null, { status: res.status });
}
