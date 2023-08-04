import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const href = url.searchParams.get('url')

  if (!href) {
    return new NextResponse('Invalid href.', { status: 400 })
  }

  const response = await axios.get(href)

  const tileMatch = response.data.match(/<title>(.*?)<\/title>/)
  const title = tileMatch ? tileMatch[1] : ''

  const descriptionMatch = response.data.match(
    /<meta name="description" content="(.*?)"/,
  )
  const description = descriptionMatch ? descriptionMatch[1] : ''

  const imageMatch = response.data.match(
    /<meta property="og:image" content="(.*?)"/,
  )
  const imageUrl = imageMatch ? imageMatch[1] : ''

  return new NextResponse(
    JSON.stringify({
      success: 1,
      meta: {
        title,
        description,
        image: {
          url: imageUrl,
        },
      },
    }),
  )
}
