import { useEffect, useRef } from "react";
import { Animated } from "react-native";

/**
 * Shared entrance animation for auth screens.
 * Logo: spring scale (0.6→1) + fade, then content items stagger in (fade + slide-up).
 * itemCount: number of content groups to animate after the logo (max 4).
 */
export function useAuthAnimation(itemCount: number) {
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Pre-create 4 slots — hooks cannot be called inside loops
  const a0 = useRef(new Animated.Value(0)).current;
  const y0 = useRef(new Animated.Value(16)).current;
  const a1 = useRef(new Animated.Value(0)).current;
  const y1 = useRef(new Animated.Value(16)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  const y2 = useRef(new Animated.Value(16)).current;
  const a3 = useRef(new Animated.Value(0)).current;
  const y3 = useRef(new Animated.Value(16)).current;

  const allItems = [
    { opacity: a0, translateY: y0 },
    { opacity: a1, translateY: y1 },
    { opacity: a2, translateY: y2 },
    { opacity: a3, translateY: y3 },
  ];

  const items = allItems.slice(0, Math.min(itemCount, 4));

  useEffect(() => {
    Animated.sequence([
      // Logo bounces in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Content groups stagger in 60 ms apart
      Animated.stagger(
        60,
        items.map((item) =>
          Animated.parallel([
            Animated.timing(item.opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(item.translateY, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ])
        )
      ),
    ]).start();
  }, []);

  return { logoScale, logoOpacity, items };
}
