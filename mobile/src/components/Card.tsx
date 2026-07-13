import React from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
} from "react-native";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function Card({
  children,
  style,
}: Props) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 18,

    shadowColor: "#000",

    shadowOpacity: 0.06,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },
});