import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const BUTTON_SIZE = 58;
const MARGIN = 20;
const TOP_Y = 60;
const BOTTOM_Y = Dimensions.get("window").height - BUTTON_SIZE - 110;

const corners = (width: number) => ({
  topLeft:     { x: MARGIN,                        y: TOP_Y    },
  topRight:    { x: width - BUTTON_SIZE - MARGIN,  y: TOP_Y    },
  bottomLeft:  { x: MARGIN,                        y: BOTTOM_Y },
  bottomRight: { x: width - BUTTON_SIZE - MARGIN,  y: BOTTOM_Y },
});

export default function FloatingTaxBot() {
  const { width, height } = Dimensions.get("window");
  const c = corners(width);

  // Start bottom-left so it doesn't clash with screen FABs (which are always bottom-right)
  const dragPos = useRef({ x: c.bottomLeft.x, y: c.bottomLeft.y });
  const position = useRef(
    new Animated.ValueXY({ x: c.bottomLeft.x, y: c.bottomLeft.y })
  ).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > 4 || Math.abs(dy) > 4,

      onPanResponderGrant: () => {
        position.setOffset({ x: dragPos.current.x, y: dragPos.current.y });
        position.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: (_, { dx, dy }) => {
        position.setValue({ x: dx, y: dy });
      },

      onPanResponderRelease: (_, { dx, dy }) => {
        const releaseX = dragPos.current.x + dx;
        const releaseY = dragPos.current.y + dy;
        const halfW = width / 2;
        const halfH = height / 2;

        let target;
        if (releaseX < halfW && releaseY < halfH)       target = c.topLeft;
        else if (releaseX >= halfW && releaseY < halfH)  target = c.topRight;
        else if (releaseX < halfW)                       target = c.bottomLeft;
        else                                             target = c.bottomRight;

        position.flattenOffset();

        Animated.spring(position, {
          toValue: target,
          useNativeDriver: false,
          tension: 120,
          friction: 8,
        }).start(() => {
          dragPos.current = target;
        });
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.container, { left: position.x, top: position.y }]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.button}
        onPress={() => router.push("/taxbot")}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 9999,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: "rgba(196, 71, 54, 0.92)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 8,
  },
});
