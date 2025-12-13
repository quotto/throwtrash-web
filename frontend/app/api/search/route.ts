import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const zipcode = req.nextUrl.searchParams.get('zipcode') ?? '';
    const res = await fetch(`https://zipcode.mythrowaway.net/search?zipcode=${zipcode}`, {
        cache: 'no-store',
        next: { revalidate: 0 }
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
