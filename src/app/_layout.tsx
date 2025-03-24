import React, { useState } from 'react'
import { Redirect, Stack } from 'expo-router'
import { ClerkProvider } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'
import { tokenCache } from '@clerk/clerk-expo/token-cache'

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
  )
}

const RootLayout = () => {
  const [isLoggedin, setIsLoggedin] = useState(true)

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {/* <Stack screenOptions={{ headerShown: false }} /> */}
      <Slot></Slot>
    </ClerkProvider>
  )
}

export default RootLayout
