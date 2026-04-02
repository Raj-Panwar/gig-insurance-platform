import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StyleSheet,
  StatusBar,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

const { width } = Dimensions.get("window");

const slides = [
  {
    title: "Protect Your Income",
    subtitle: "Get insured against rain, heat & disruptions",
    icon: "☔",
  },
  {
    title: "AI Smart Premium",
    subtitle: "Pay only based on real-time risk",
    icon: "🧠",
  },
  {
    title: "Instant Payouts",
    subtitle: "Get paid automatically when events happen",
    icon: "⚡",
  },
];

export default function OnboardingScreen({ navigation }) {
  const [index, setIndex] = useState(0);

  const handleScroll = (e) => {
    const newIndex = Math.round(
      e.nativeEvent.contentOffset.x / width
    );
    setIndex(newIndex);
  };

  const finish = () => {
    navigation.replace("Language");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
      >
        {slides.map((item, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <Animated.Text entering={FadeIn.duration(600)} style={styles.icon}>
              {item.icon}
            </Animated.Text>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      {/* DOTS */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { opacity: i === index ? 1 : 0.3 },
            ]}
          />
        ))}
      </View>

      {/* BUTTON */}
      <TouchableOpacity style={styles.button} onPress={finish}>
        <Text style={styles.buttonText}>
          {index === slides.length - 1 ? "Get Started" : "Skip"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  slide: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  icon: {
    fontSize: 70,
    marginBottom: 30,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    color: "#94A3B8",
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  dot: {
    height: 6,
    width: 20,
    backgroundColor: "#6366F1",
    marginHorizontal: 4,
    borderRadius: 3,
  },
  button: {
    backgroundColor: "#6366F1",
    margin: 20,
    padding: 16,
    borderRadius: 14,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },
});