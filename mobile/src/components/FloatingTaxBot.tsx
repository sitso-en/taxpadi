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
    }),
  ).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },

      onPanResponderGrant: () => {
        position.extractOffset();
      },

      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false },
      ),

      onPanResponderRelease: () => {
        position.flattenOffset();
      },
    }),
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.floatingContainer,
        {
          transform: position.getTranslateTransform(),
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.button}
        onPress={() => router.push("/taxbot")}
      >
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={24}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 99999,
  },

  button: {
    width: 52,
    height: 52,
    borderRadius: 26,

    backgroundColor: "#C44736",
    opacity: 0.8,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,

    elevation: 10,
  },
});
