import React, { useEffect, useState } from 'react'
import { Slot } from 'expo-router'


const RootLayout = () => {



  useEffect(() => {
    // Alert.alert('Welcome to the Attendance App', 'Please login to continue.');
  }, [])

  return (
    <Slot></Slot>
  )
}

export default RootLayout
