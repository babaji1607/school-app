import { View, Text } from 'react-native'
import React from 'react'
import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

const Auth = () => {

  const { isSignedIn } = useAuth()
  if (isSignedIn) {
    return <Redirect href={'/(main)/(tabs)/index'} />
  }
  return (
    <Stack />
  )
}

export default Auth