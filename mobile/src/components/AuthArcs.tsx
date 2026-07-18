import React from "react";
import { View } from "react-native";

const SIZES = [90, 140, 190];
const CLIP_SIZE = 155;

/**
 * Decorative concentric quarter-circle arcs in the bottom-right corner.
 * Clipped to a 155×155 container so only the top-left quarter of each
 * arc is visible — a subtle brand watermark using #C44736 at low opacity.
 */
export function AuthArcs() {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        width: CLIP_SIZE,
        height: CLIP_SIZE,
        overflow: "hidden",
      }}
    >
      {SIZES.map((size) => (
        <View
          key={size}
          style={{
            position: "absolute",
            bottom: -size / 2,
            right: -size / 2,
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: "#C44736",
            opacity: 0.07,
          }}
        />
      ))}
    </View>
  );
}
