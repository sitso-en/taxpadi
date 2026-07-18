import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  value: boolean;
  onValueChange: () => void;
  disabled?: boolean;
};

export default function Toggle({ value, onValueChange, disabled = false }: Props) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });
  const bgColor = disabled
    ? "#E5E7EB"
    : anim.interpolate({ inputRange: [0, 1], outputRange: ["#D1D5DB", "#B83729"] });

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={disabled ? undefined : onValueChange} disabled={disabled}>
      <Animated.View style={[styles.track, { backgroundColor: bgColor }]}>
        <Animated.View style={[styles.knob, { transform: [{ translateX }] }]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 46,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
