import React, { useEffect } from "react";
import { View, Text, StatusBar } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

export default function SplashScreen({ navigation }) {
  const logoScale = useSharedValue(0.9);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    // FAANG animation
    logoOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.exp),
    });

    logoScale.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.exp),
    });

    textOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 600 })
    );

    taglineOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 600 })
    );

    const timer = setTimeout(() => {
      navigation.replace("Onboarding"); // ✅ FIXED (IMPORTANT)
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#020617",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StatusBar barStyle="light-content" />

      {/* LOGO */}
      <Animated.Text
        style={[
          {
            fontSize: 64,
            marginBottom: 20,
          },
          logoStyle,
        ]}
      >
        🛡️
      </Animated.Text>

      {/* TITLE */}
      <Animated.Text
        style={[
          {
            fontSize: 34,
            fontWeight: "600",
            color: "#FFFFFF",
            letterSpacing: 0.5,
          },
          titleStyle,
        ]}
      >
        GigShield AI
      </Animated.Text>

      {/* TAGLINE */}
      <Animated.Text
        style={[
          {
            marginTop: 10,
            fontSize: 14,
            color: "#94A3B8",
          },
          taglineStyle,
        ]}
      >
        Intelligent protection for gig workers
      </Animated.Text>

      {/* LOADER BAR */}
      <Animated.View
        style={[
          {
            marginTop: 40,
            height: 4,
            width: 60,
            borderRadius: 2,
            backgroundColor: "#6366F1",
          },
          taglineStyle,
        ]}
      />
    </View>
  );
}   