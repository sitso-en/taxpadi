import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ManagePlanScreen() {

  const selectPlan = (plan:string)=>{
    Alert.alert(
      "Coming Soon",
      `${plan} subscriptions will be available once backend payments are connected.`
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom:40,
      }}
    >
      <TouchableOpacity
        onPress={()=>router.back()}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color="#C44736"
        />
      </TouchableOpacity>

      <Text style={styles.title}>
        Manage Plan
      </Text>

      <Text style={styles.subtitle}>
        Upgrade or downgrade your TaxPadi subscription.
      </Text>

      {[
        {
          name:"FREE",
          price:"GH¢0",
          color:"#6B7280"
        },
        {
          name:"PRO",
          price:"GH¢99/month",
          color:"#C44736"
        },
        {
          name:"BUSINESS",
          price:"GH¢199/month",
          color:"#34A853"
        }
      ].map(plan=>(
        <View
          key={plan.name}
          style={styles.card}
        >
          <Text
            style={[
              styles.plan,
              {color:plan.color}
            ]}
          >
            {plan.name}
          </Text>

          <Text style={styles.price}>
            {plan.price}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={()=>selectPlan(plan.name)}
          >
            <Text style={styles.buttonText}>
              Select Plan
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles=StyleSheet.create({

container:{
flex:1,
backgroundColor:"#FAFAFA",
padding:20,
paddingTop:55,
},

title:{
fontSize:30,
fontFamily:"Inter_700Bold",
marginTop:20,
color:"#111827",
},

subtitle:{
marginTop:6,
marginBottom:30,
color:"#6B7280",
},

card:{
backgroundColor:"#FFF",
borderRadius:18,
padding:22,
marginBottom:18,
},

plan:{
fontSize:24,
fontFamily:"Inter_700Bold",
},

price:{
marginTop:8,
marginBottom:20,
fontSize:18,
},

button:{
backgroundColor:"#C44736",
borderRadius:12,
padding:16,
alignItems:"center",
},

buttonText:{
color:"#FFF",
fontSize:16,
fontFamily:"Inter_600SemiBold",
}

});