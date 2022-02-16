import { getProviderStatusAsync } from "expo-location";
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


export default function AdminLogin() {

const [username, setUsername] = React.useState('');
const [password, setPassword] = React.useState('');


    return(

        <View style={{flex:1, flexDirection:'column'}}>
          <Text style={styles.Msg}>Maps can only be edited by Administers.</Text>

          <View style={{flexDirection:'row'}}>
            <Text style={styles.UnPw}>Username</Text>
            <TextInput 
              style={styles.txInput}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}/>
          </View>

          <View style={{flexDirection:'row'}}>
            <Text style={styles.UnPw}>Password</Text>
            <TextInput
              style={styles.txInput}
              maxLength={18}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry/>
          </View> 
          <Button title="Sign in" onPress={() => ({ username, password})}/>   
        </View>
    );
  }
  const styles = StyleSheet.create({
    Msg: {
        textAlign:'center',
        fontSize:30,
        fontWeight:'700', 
        lineHeight:50,
    },
   txInput: {
     borderWidth:2,
     margin:5,
     marginEnd:125,
      fontSize:20,
      fontWeight:'500', 
      lineHeight:30,
      flex:3,
    },
    UnPw: {
      bottom:-10,
      fontSize:20,
      fontWeight:'500',
    },
  });