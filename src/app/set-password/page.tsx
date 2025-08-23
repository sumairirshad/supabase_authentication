'use client'

import { Suspense } from "react"
import SetPasswordContent from "../components/SetPasswordContent"


export default function SetPasswordPage() {

  return (
    <Suspense>
        <SetPasswordContent></SetPasswordContent>
    </Suspense>
  )
}
