import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
import { useLanguage } from "../state/language";

const languages = [
  { label: "English", code: "en" },
  { label: "हिंदी", code: "hi" },
  { label: "தமிழ்", code: "ta" },
  { label: "తెలుగు", code: "te" },
  { label: "বাংলা", code: "bn" },
  { label: "मराठी", code: "mr" },
  { label: "ગુજરાતી", code: "gu" },
  { label: "ಕನ್ನಡ", code: "kn" },
];

export default function LanguageScreen({ navigation }) {
  const { setLanguage } = useLanguage();

  const selectLanguage = (code) => {
    setLanguage(code);
    navigation.replace("Login");;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <Animated.View entering={FadeIn.duration(600)}>
        <Text style={styles.title}>Choose Language</Text>
        <Text style={styles.subtitle}>
          Select your preferred language to continue
        </Text>
      </Animated.View>

      {/* LANGUAGE LIST */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {languages.map((lang, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(index * 80)}
          >
            <TouchableOpacity
              style={styles.card}
              onPress={() => selectLanguage(lang.code)}
              activeOpacity={0.85}
            >
              <Text style={styles.text}>{lang.label}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      {/* FOOTER */}
      <Animated.Text
        entering={FadeIn.delay(600)}
        style={styles.footer}
      >
        You can change language anytime in settings
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  subtitle: {
    color: "#94A3B8",
    marginTop: 8,
    fontSize: 14,
  },
  list: {
    marginTop: 40,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 12,
    marginBottom: 20,
  },
});