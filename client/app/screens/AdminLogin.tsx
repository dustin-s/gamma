import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
    Button,
    TextInput,
  } from "react-native";


const [username, setUsername] = React.useState('');
const [password, setPassword] = React.useState('');

export default function AdminLogin() {

    return(

        <View>
        <Text style={styles.Msg}>Maps can only be edited by Administers.</Text>
        <TextInput 
          placeholder="Username"
          value={username}
          onChangeText={setUsername}/>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}/>

    </View>
    );
  }
  const styles = StyleSheet.create({
    Msg: {
        textAlign:'center',
    },
  });