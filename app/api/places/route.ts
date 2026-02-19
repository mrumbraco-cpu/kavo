import { NextResponse } from 'next/server'

const GOONG_API_KEY = process.env.GOONG_API_KEY || process.env.NEXT_PUBLIC_GOONG_API_KEY
const GOONG_BASE_URL = 'https://rsapi.goong.io'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const input = searchParams.get('input')
    const place_id = searchParams.get('place_id')
    const limit = searchParams.get('limit') || '10'

    if (!GOONG_API_KEY) {
        return NextResponse.json({ error: 'Goong API Key not configured' }, { status: 500 })
    }

    try {
        let url = ''

        if (place_id) {
            // Place Detail API
            url = `${GOONG_BASE_URL}/Place/Detail?place_id=${place_id}&api_key=${GOONG_API_KEY}`
        } else if (input) {
            // Autocomplete API
            url = `${GOONG_BASE_URL}/Place/AutoComplete?input=${encodeURIComponent(input)}&limit=${limit}&api_key=${GOONG_API_KEY}`
        } else {
            return NextResponse.json({ error: 'Missing input or place_id' }, { status: 400 })
        }

        const res = await fetch(url)
        const data = await res.json()

        if (!res.ok) {
            return NextResponse.json(data, { status: res.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Goong API Proxy Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
