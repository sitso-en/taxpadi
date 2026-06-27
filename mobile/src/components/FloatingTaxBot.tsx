import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function FloatingTaxBot() {
  const position = useRef(
    new Animated.ValueXY({
      x: 0,
      y: 0,
    })
  ).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > 5 ||
          Math.abs(gestureState.dy) > 5
        );
      },

      onPanResponderGrant: () => {
        position.extractOffset();
      },

      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),

      onPanResponderRelease: () => {
        position.flattenOffset();
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {
          transform:
            position.getTranslateTransform(),
        },
      ]}
    >
      <TouchableOpacity
  activeOpacity={0.9}
  style={styles.button}
  onPress={() => router.push("/taxbot")}
>
        <Ionicons
  name="chatbubble-ellipses"
  size={26}
  color="#FFFFFF"
/>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 95,
    right: 20,
    zIndex: 9999,
  },

 button: {
  width: 58,
  height: 58,
  borderRadius: 29,

  backgroundColor: "rgba(196, 71, 54, 0.8)",

  justifyContent: "center",
  alignItems: "center",

  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.2,
  shadowRadius: 6,

  elevation: 8,
},
});