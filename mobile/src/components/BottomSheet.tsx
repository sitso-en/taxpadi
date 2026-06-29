import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

const SCREEN_HEIGHT = Dimensions.get("window").height;
// Fully off-screen resting position for the closed sheet.
const CLOSED = SCREEN_HEIGHT;

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Pass true when the sheet contains text inputs that need keyboard avoidance */
  avoidKeyboard?: boolean;
};

// Plain timing curves — no spring overshoot, so the sheet slides without bouncing.
const OPEN = { duration: 260, easing: Easing.out(Easing.cubic) } as const;
const CLOSE = { duration: 220, easing: Easing.in(Easing.cubic) } as const;

export default function BottomSheet({ visible, onClose, children, avoidKeyboard }: Props) {
  const ty = useSharedValue(CLOSED);
  const [modalVisible, setModalVisible] = useState(visible);

  // Reanimated keyboard height (UI-thread) — smooth, no layout thrash.
  // Hooks must run unconditionally; we only *use* the value when avoidKeyboard is set.
  const keyboard = useAnimatedKeyboard({ isStatusBarTranslucentAndroid: true });

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      ty.value = withTiming(0, OPEN);
    } else if (modalVisible) {
      ty.value = withTiming(CLOSED, CLOSE, (finished) => {
        // Only unmount once the exit animation actually completes.
        if (finished) runOnJS(setModalVisible)(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Pan lives on the handle only, so it never fights the ScrollView body.
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) ty.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 800) {
        ty.value = withTiming(CLOSED, CLOSE, (finished) => {
          if (finished) runOnJS(onClose)();
        });
      } else {
        ty.value = withTiming(0, OPEN);
      }
    });

  const animStyle = useAnimatedStyle(() => {
    const lift = avoidKeyboard ? keyboard.height.value : 0;
    return { transform: [{ translateY: ty.value - lift }] };
  });

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar style="dark" />
      {/* A GestureHandlerRootView is required INSIDE the Modal — the app-root one
          does not extend into the Modal's separate native view hierarchy. */}
      <GestureHandlerRootView style={styles.flex}>
        <View style={styles.overlay}>
          {/* Backdrop — tap anywhere outside the sheet to dismiss */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />

          <Animated.View style={[styles.sheet, animStyle]}>
            <GestureDetector gesture={panGesture}>
              <View style={styles.handleArea}>
                <View style={styles.handle} />
              </View>
            </GestureDetector>

            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {children}
            </ScrollView>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  handleArea: {
    paddingVertical: 12,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
  },
});