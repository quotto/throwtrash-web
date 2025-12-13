import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const address = req.nextUrl.searchParams.get('address') ?? '';
    const res = await fetch(`https://zipcode.mythrowaway.net/load?address=${encodeURIComponent(address)}`, {
        cache: 'no-store',
        next: { revalidate: 0 }
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
