import { NextResponse } from 'next/server'
import { supabaseClient } from '@/app/lib/supabaseClient'
import { encodeEmail } from '@/app/utils/encodeEmail'

export async function POST(req: Request) {
  const { email, roleId } = await req.json()

  const encodedEmail = encodeEmail(email)
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/invite-status?token=${encodedEmail}&role=${roleId}`

  const { error: inviteError, data: inviteData} = await supabaseClient.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  })

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 })
  }

  const { error: insertError } = await supabaseClient.from('user_roles').insert({
    email,
    user_id: inviteData?.user?.id,
    role_id: roleId,
    status: 'pending',
  })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Invitation sent' })
}
