"use client"
import { Button } from '@/components/ui/button'
import { SignOutButton, useUser } from '@clerk/nextjs'
import React from 'react'

export default function DashboardPage() {
  const { isSignedIn, isLoaded, user } = useUser()
  return (
    <div>
      {!isLoaded && <div>Loading</div>}
      {isSignedIn && <div>Signed In</div>}
      {user && <div>{user.emailAddresses[0].emailAddress}</div>}

      <Button asChild>
        <SignOutButton />
      </Button>
    </div>
  )
}
