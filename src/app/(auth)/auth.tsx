import { View, Text } from 'react-native'
import React from 'react'
import { Slot } from 'expo-router'
import Signin from './sign-in'
import SignUpScreen from './sign-up'

const auth = () => {
  return (
    <>
      {/* <SignUpScreen /> */}
      <Signin />
    </>
  )
}

export default auth