import { View, Text } from 'react-native'
import React from 'react'
import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

const Auth = () => {

  const { isSignedIn } = useAuth()
  if (isSignedIn) {
    return <Redirect href={'/(home)/(tabs)/home'} />
  }
  return (
    <Stack screenOptions={{ headerShown: false }} />
  )
}

export default Auth