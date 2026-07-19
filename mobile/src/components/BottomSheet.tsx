import React, { useCallback, useEffect } from "react";
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Pass true when sheet contains text inputs that need keyboard avoidance */
  avoidKeyboard?: boolean;
};

const SPRING = { damping: 22, stiffness: 220 } as const;

export default function BottomSheet({ visible, onClose, children, avoidKeyboard }: Props) {
  const ty = useSharedValue(800);

  useEffect(() => {
    ty.value = withSpring(visible ? 0 : 800, SPRING);
  }, [visible]);

  const dismiss = useCallback(() => {
    "worklet";
    ty.value = withSpring(800, SPRING, () => runOnJS(onClose)());
  }, [onClose]);

  const handleClose = useCallback(() => {
    runOnUI(dismiss)();
  }, [dismiss]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) ty.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 600) dismiss();
      else ty.value = withSpring(0, SPRING);
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
  }));

  const content = (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={StyleSheet.absoluteFillObject}
        activeOpacity={1}
        onPress={handleClose}
      />
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, animStyle]}>
          {/* Draggable handle */}
          <View style={styles.handleArea} pointerEvents="box-only">
            <View style={styles.handle} />
          </View>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      {avoidKeyboard ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
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
