import React, { useEffect, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Pass true when sheet contains text inputs that need keyboard avoidance */
  avoidKeyboard?: boolean;
};

const SPRING = { damping: 28, stiffness: 220 } as const;

export default function BottomSheet({ visible, onClose, children, avoidKeyboard }: Props) {
  const ty = useSharedValue(800);
  const [modalVisible, setModalVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      ty.value = withSpring(0, SPRING);
    } else {
      ty.value = withSpring(800, SPRING, () => runOnJS(setModalVisible)(false));
    }
  }, [visible]);

  const panGesture = Gesture.Pan()
    .activeOffsetY(5)
    .onUpdate((e) => {
      if (e.translationY > 0) ty.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 600) {
        ty.value = withSpring(800, SPRING, () => runOnJS(onClose)());
      } else {
        ty.value = withSpring(0, SPRING);
      }
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
  }));

  const content = (
    <View style={styles.overlay}>
      {/* Backdrop — tap to close immediately, no animation needed */}
      <TouchableOpacity
        style={StyleSheet.absoluteFillObject}
        activeOpacity={1}
        onPress={onClose}
      />
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, animStyle]}>
          {/* Draggable handle */}
          <View style={styles.handleArea} pointerEvents="box-only">
            <View style={styles.handle} />
          </View>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {children}
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </View>
  );

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar style="dark" />
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
