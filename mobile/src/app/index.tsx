import { getAccessToken, getRefreshToken, hasOnboarded } from "@/utils/storage";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";

const LOGO_SIZE = 185;

const BRAND = ["t", "a", "x", "p", "a", "d", "i"];

export default function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0.12)).current;
  const logoOpacity = useRef(new Animated.Value(0));
  const logoX = useRef(new Animated.Value(-700)).current;
  const logoY = useRef(new Animated.Value(-900)).current;
  const logoRotate = useRef(new Animated.Value(-18)).current;

  const glowOpacity = useRef(new Animated.Value(0)).current;

  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(18)).current;

  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const bottomY = useRef(new Animated.Value(18)).current;

  const screenOpacity = useRef(new Animated.Value(1)).current;

  const letters = BRAND.map(() => ({
    opacity: useRef(new Animated.Value(0)).current,
    x: useRef(new Animated.Value(-LOGO_SIZE)).current,
    scale: useRef(new Animated.Value(0.8)).current,
  }));

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity.current, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),

        Animated.timing(logoScale, {
          toValue: 1.15,
          duration: 950,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(logoX, {
          toValue: 0,
          duration: 950,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(logoY, {
          toValue: 0,
          duration: 950,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 950,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 55,
          useNativeDriver: true,
        }),

        Animated.timing(glowOpacity, {
          toValue: 0.25,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),

      Animated.stagger(
        35,
        letters.map((letter) =>
          Animated.parallel([
            Animated.timing(letter.opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),

            Animated.timing(letter.x, {
              toValue: 0,
              duration: 300,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),

            Animated.spring(letter.scale, {
              toValue: 1,
              friction: 5,
              tension: 90,
              useNativeDriver: true,
            }),
          ])
        )
      ),

      Animated.delay(180),

      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),

        Animated.timing(taglineY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(bottomOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),

        Animated.timing(bottomY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    initialize();
  }, []);

  const initialize = async () => {
    await new Promise((r) => setTimeout(r, 3600));

    await new Promise<void>((resolve) => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => resolve());
    });

    // A valid refresh token means the user is still "logged in" even if the
    // short-lived access token has expired — the API layer renews it on demand.
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    if (accessToken || refreshToken) {
      router.replace("/(tabs)/dashboard");
    } else if (await hasOnboarded()) {
      // Returning user whose session has ended — send them to sign in, not onboarding.
      router.replace("/login");
    } else {
      // Genuine first launch.
      router.replace("/welcome");
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: screenOpacity,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.glow,
          {
            opacity: glowOpacity,
          },
        ]}
      />

      <Animated.Image
        source={require("../../assets/images/logoA5.png")}
        resizeMode="contain"
        style={[
          styles.logo,
          {
            opacity: logoOpacity.current,
            transform: [
              { translateX: logoX },
              { translateY: logoY },
              {
                rotate: logoRotate.interpolate({
                  inputRange: [-18, 0],
                  outputRange: ["-18deg", "0deg"],
                }),
              },
              { scale: logoScale },
            ],
          },
        ]}
      />

      <View style={styles.word}>
        {BRAND.map((letter, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.logoText,
              {
                color:
                  index >= 3
                    ? "#D9534F"
                    : "#FFFFFF",

                opacity: letters[index].opacity,

                transform: [
                  {
                    translateX:
                      letters[index].x,
                  },
                  {
                    scale:
                      letters[index].scale,
                  },
                ],
              },
            ]}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>

      {/* <Animated.Text
        style={[
          styles.tagline,
          {
            opacity: taglineOpacity,
            transform: [
              {
                translateY: taglineY,
              },
            ],
          },
        ]}
      >
        TRUSTED TAX MANAGEMENT • GHANA
      </Animated.Text> */}

      <Animated.Text
        style={[
          styles.bottomText,
          {
            opacity: bottomOpacity,
            transform: [
              {
                translateY: bottomY,
              },
            ],
          },
        ]}
      >
        Your tax, sorted.
      </Animated.Text>

      <View style={styles.loader}>
        <LoadingPill delay={0} />
        <LoadingPill delay={180} />
        <LoadingPill delay={360} />
      </View>
    </Animated.View>
  );
}

function LoadingPill({
  delay,
}: {
  delay: number;
}) {
  const scale = useRef(
    new Animated.Value(0.8)
  ).current;

  const opacity = useRef(
    new Animated.Value(0.35)
  ).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),

        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.5,
            duration: 220,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(opacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 220,
            useNativeDriver: true,
          }),

          Animated.timing(opacity, {
            toValue: 0.35,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),

        Animated.delay(180),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.pill,
        {
          opacity,
          transform: [
            {
              scale,
            },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  glow: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "#C44736",
  },

  logo: {
    width: 185,
    height: 185,
  },

  word: {
    flexDirection: "row",
    marginTop: 28,
    alignItems: "center",
  },

  logoText: {
    fontSize: 56,
    letterSpacing: -2,
    fontFamily: "Inter_700Bold",
  },

  tagline: {
    marginTop: 12,
    color: "#D77A7A",
    fontSize: 18,
    letterSpacing: 0.5,
    fontFamily: "Inter_400Regular",
  },

  bottomText: {
    marginTop: 18,
    color: "#A8A8A8",
    fontSize: 11,
    letterSpacing: 4,
    fontFamily: "Inter_600SemiBold",
  },

  loader: {
    flexDirection: "row",
    marginTop: 55,
    alignItems: "center",
  },

  pill: {
    width: 18,
    height: 5,
    borderRadius: 99,
    backgroundColor: "#C44736",
    marginHorizontal: 5,
  },
});