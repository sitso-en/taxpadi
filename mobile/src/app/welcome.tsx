import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getAccessToken } from "@/utils/storage";
import { AuthArcs } from "@/components/AuthArcs";

const { width: W, height: H } = Dimensions.get("window");
const PAGES = 3;

function buildGrain(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.sin(i * 127.321) * 0.5 + 0.5) * W,
    y: (Math.sin(i * 311.719) * 0.5 + 0.5) * H,
    size: 2 + Math.abs(Math.sin(i * 47.93)) * 3.5,
    opacity: 0.12 + Math.abs(Math.sin(i * 73.17)) * 0.2,
  }));
}

export default function WelcomeScreen() {
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const grain = useMemo(() => buildGrain(500), []);

  const grainX = useRef(new Animated.Value(0)).current;
  const grainY = useRef(new Animated.Value(0)).current;

  // Per-page fade-in animations
  const fadeAnims = useRef(
    Array.from({ length: PAGES }, () => new Animated.Value(0))
  ).current;
  const slideAnims = useRef(
    Array.from({ length: PAGES }, () => new Animated.Value(24))
  ).current;

  useEffect(() => {
    const check = async () => {
      const token = await getAccessToken();
      if (token) router.replace("/(tabs)/dashboard");
    };
    check();
    animatePage(0);
  }, []);

  const animatePage = (idx: number) => {
    // Reset target page
    fadeAnims[idx].setValue(0);
    slideAnims[idx].setValue(24);
    Animated.parallel([
      Animated.timing(fadeAnims[idx], {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnims[idx], {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const goTo = (idx: number) => {
    scrollRef.current?.scrollTo({ x: idx * W, animated: true });
    setPage(idx);
    animatePage(idx);
  };

  const handleTouch = (x: number, y: number) => {
    Animated.spring(grainX, {
      toValue: (x / W - 0.5) * 40,
      useNativeDriver: true,
      tension: 20,
      friction: 5,
    }).start();
    Animated.spring(grainY, {
      toValue: (y / H - 0.5) * 40,
      useNativeDriver: true,
      tension: 20,
      friction: 5,
    }).start();
  };

  const resetGrain = () => {
    Animated.spring(grainX, { toValue: 0, useNativeDriver: true, tension: 20, friction: 8 }).start();
    Animated.spring(grainY, { toValue: 0, useNativeDriver: true, tension: 20, friction: 8 }).start();
  };

  const pageStyle = (idx: number) => ({
    opacity: fadeAnims[idx],
    transform: [{ translateY: slideAnims[idx] }],
  });

  return (
    <View
      style={styles.root}
      onTouchStart={(e) => handleTouch(e.nativeEvent.locationX, e.nativeEvent.locationY)}
      onTouchMove={(e) => handleTouch(e.nativeEvent.locationX, e.nativeEvent.locationY)}
      onTouchEnd={resetGrain}
    >
      {/* Base background */}
      <LinearGradient
        colors={["#F9F3EE", "#F2EDE8", "#EADFD7"]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Grain */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { transform: [{ translateX: grainX }, { translateY: grainY }] },
        ]}
      >
        {grain.map((dot) => (
          <View
            key={dot.id}
            style={{
              position: "absolute",
              left: dot.x,
              top: dot.y,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              backgroundColor: "#5C2B1E",
              opacity: dot.opacity,
            }}
          />
        ))}
      </Animated.View>

      <AuthArcs />

      <SafeAreaView style={styles.safe}>
        {/* Skip button */}
        {page < 2 && (
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => router.push("/login")}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Pages */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          scrollEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const newPage = Math.round(e.nativeEvent.contentOffset.x / W);
            if (newPage !== page) {
              setPage(newPage);
              animatePage(newPage);
            }
          }}
          style={styles.scroll}
        >
          {/* ── Page 1: Brand ── */}
          <View style={styles.page}>
            <Animated.View style={[styles.pageInner, pageStyle(0)]}>
              {/* Logo */}
              <View style={styles.logoRow}>
                <Image
                  source={require("@/assets/images/symbol.png")}
                  style={styles.logoSymbol}
                  resizeMode="contain"
                />
                <View style={styles.logoText}>
                  <Image
                    source={require("@/assets/images/tax.png")}
                    style={styles.logoTax}
                    resizeMode="contain"
                  />
                  <Image
                    source={require("@/assets/images/padi.png")}
                    style={styles.logoPadi}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <View style={styles.brandAccent} />

              <Text style={styles.heading}>
                Know your taxes.{"\n"}
                <Text style={styles.headingAccent}>Own your money.</Text>
              </Text>
              <Text style={styles.description}>
                Ghana's smartest tax companion — built for individuals, freelancers, and small businesses who want to stay ahead.
              </Text>
            </Animated.View>
          </View>

          {/* ── Page 2: Tax Tracking ── */}
          <View style={styles.page}>
            <Animated.View style={[styles.pageInner, pageStyle(1)]}>
              <View style={[styles.iconCircle, { backgroundColor: "#FDE8E5" }]}>
                <Ionicons name="calendar-outline" size={52} color="#C44736" />
              </View>

              <Text style={styles.heading}>
                Never miss a{"\n"}
                <Text style={styles.headingAccent}>tax deadline.</Text>
              </Text>
              <Text style={styles.description}>
                Automatic reminders for VAT, PAYE, and withholding tax filings — so GRA penalties never catch you off guard.
              </Text>

              <View style={styles.featureList}>
                {[
                  { icon: "checkmark-circle", text: "Real-time VAT & PAYE summaries" },
                  { icon: "notifications-outline", text: "Deadline alerts before due dates" },
                  { icon: "receipt-outline", text: "Withholding tax history at a glance" },
                ].map((f) => (
                  <View key={f.text} style={styles.featureRow}>
                    <Ionicons name={f.icon as any} size={20} color="#C44736" />
                    <Text style={styles.featureText}>{f.text}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          </View>

          {/* ── Page 3: Full Toolkit + CTA ── */}
          <View style={styles.page}>
            <Animated.View style={[styles.pageInner, pageStyle(2)]}>
              <View style={[styles.iconCircle, { backgroundColor: "#F5E6E4" }]}>
                <Ionicons name="briefcase-outline" size={52} color="#8B2318" />
              </View>

              <Text style={styles.heading}>
                Your complete{"\n"}
                <Text style={[styles.headingAccent, { color: "#8B2318" }]}>tax toolkit.</Text>
              </Text>
              <Text style={styles.description}>
                Invoices, savings vault, compliance certificates, and detailed reports — everything you need, in one place.
              </Text>

              <View style={styles.featureList}>
                {[
                  { icon: "document-text-outline", text: "Generate and send invoices instantly" },
                  { icon: "shield-checkmark-outline", text: "Download compliance certificates" },
                  { icon: "wallet-outline", text: "Save for taxes with the savings vault" },
                ].map((f) => (
                  <View key={f.text} style={styles.featureRow}>
                    <Ionicons name={f.icon as any} size={20} color="#8B2318" />
                    <Text style={styles.featureText}>{f.text}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push("/register")}
                activeOpacity={0.88}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push("/login")}
                activeOpacity={0.75}
              >
                <Text style={styles.secondaryButtonText}>I already have an account</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>

        {/* Bottom: dots + next */}
        <View style={styles.bottomBar}>
          <View style={styles.dots}>
            {Array.from({ length: PAGES }).map((_, i) => (
              <TouchableOpacity key={i} onPress={() => goTo(i)}>
                <View style={[styles.dot, i === page && styles.dotActive]} />
              </TouchableOpacity>
            ))}
          </View>

          {page < 2 && (
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => goTo(page + 1)}
              activeOpacity={0.85}
            >
              <Text style={styles.nextText}>Next</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F2EDE8",
  },

  safe: {
    flex: 1,
  },

  skipBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },

  skipText: {
    fontSize: 15,
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
  },

  scroll: {
    flex: 1,
  },

  page: {
    width: W,
    flex: 1,
    justifyContent: "center",
  },

  pageInner: {
    paddingHorizontal: 28,
  },

  // ── Page 1 logo ──
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    marginBottom: 36,
  },

  logoText: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoSymbol: {
    width: 62,
    height: 62,
  },

  logoTax: {
    width: 90,
    height: 58,
    marginLeft: -12
  },

  logoPadi: {
    width: 168,
    height: 58,
    marginLeft: -40,
  },

  brandAccent: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C44736",
    marginBottom: 24,
  },

  // ── Pages 2 & 3 icon ──
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },

  // ── Shared text ──
  heading: {
    fontSize: 36,
    lineHeight: 46,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
    marginBottom: 16,
  },

  headingAccent: {
    color: "#C44736",
  },

  description: {
    color: "#4B5563",
    fontSize: 15.5,
    lineHeight: 25,
    fontFamily: "Inter_400Regular",
    marginBottom: 32,
  },

  // ── Feature list ──
  featureList: {
    gap: 14,
    marginBottom: 36,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  featureText: {
    fontSize: 14.5,
    color: "#374151",
    fontFamily: "Inter_500Medium",
    flex: 1,
  },

  // ── Buttons (page 3 only) ──
  primaryButton: {
    backgroundColor: "#C44736",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#C44736",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.1,
  },

  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.12)",
  },

  secondaryButtonText: {
    color: "#111827",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.1,
  },

  // ── Bottom bar ──
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingBottom: 20,
    paddingTop: 12,
  },

  dots: {
    flexDirection: "row",
    gap: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(17,24,39,0.18)",
  },

  dotActive: {
    width: 24,
    backgroundColor: "#C44736",
  },

  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },

  nextText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
