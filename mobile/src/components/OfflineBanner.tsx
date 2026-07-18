import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetwork } from "@/context/NetworkContext";

type BannerStatus = "offline" | "reconnected" | "hidden";

export default function OfflineBanner() {
  const { isOnline } = useNetwork();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-80)).current;
  const [status, setStatus] = useState<BannerStatus>("hidden");
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasBeenOffline = useRef(false);

  useEffect(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }

    if (!isOnline) {
      hasBeenOffline.current = true;
      setStatus("offline");
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else if (hasBeenOffline.current) {
      setStatus("reconnected");
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();

      hideTimer.current = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -80,
          duration: 280,
          useNativeDriver: true,
        }).start(() => {
          setStatus("hidden");
          hasBeenOffline.current = false;
        });
      }, 2200);
    }
  }, [isOnline]);

  if (status === "hidden") return null;

  const bannerHeight = insets.top + 36;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.banner,
        status === "reconnected" ? styles.reconnectedBanner : styles.offlineBanner,
        { height: bannerHeight, paddingTop: insets.top, transform: [{ translateY }] },
      ]}
    >
      <Ionicons
        name={status === "reconnected" ? "wifi-outline" : "cloud-offline-outline"}
        size={13}
        color="#FFFFFF"
        style={{ marginRight: 6 }}
      />
      <Text style={styles.text}>
        {status === "reconnected"
          ? "Back online"
          : "You're offline · Some features unavailable"}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  offlineBanner: {
    backgroundColor: "#374151",
  },
  reconnectedBanner: {
    backgroundColor: "#16A34A",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.1,
  },
});
