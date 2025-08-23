
'use client'

import { Suspense } from "react"
import InviteStatusContent from "../components/InviteStatusContent"

export default function InviteStatusPage() {
  return (
      <Suspense>
          <InviteStatusContent />
      </Suspense>
  )
}
