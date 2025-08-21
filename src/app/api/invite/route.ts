import { NextResponse } from 'next/server'
import { supabaseClient } from '@/app/lib/supabaseClient'
import { encodeEmail } from '@/app/utils/encodeEmail'

export async function POST(req: Request) {
  const { email, roleId } = await req.json()

  const encodedEmail = encodeEmail(email)
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/invite-status?token=${encodedEmail}&role=${roleId}`

  const { error } = await supabaseClient.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Invitation sent' })
}
