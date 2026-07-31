import { NextResponse } from 'next/server'

export const POST = async (request: Request) => {
  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.delete('hippo_token')
  response.cookies.delete('hippo_user_name')
  return response
}
