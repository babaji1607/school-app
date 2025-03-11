import React, { useState } from 'react'
import { Redirect, Stack } from 'expo-router'

const RootLayout = () => {
  const [isLoggedin, setIsLoggedin] = useState(true)

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {
        isLoggedin ?
          <Redirect href="/(main)/(tabs)/attendance" />  // oh we needed a precise path here thats why only main was giving error
          :
          <Redirect href="/(auth)" />
      }
    </>
  )
}

export default RootLayout
