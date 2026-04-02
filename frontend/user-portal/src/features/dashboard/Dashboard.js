
import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput, // ✅ ADDED (search)
} from "react-native";

import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { LineChart, PieChart } from "react-native-chart-kit";
import { translations } from "../../constants/languages";
import { calculatePremiumAPI } from "../../services/api";
import { useLanguage } from "../../state/language";

export default function Dashboard({ navigation }) {
  const [premium, setPremium] = useState(38);
  const [claim, setClaim] = useState(null);

  // ✅ ADDED: recent claims (SAFE ADD)
  const [recentClaims, setRecentClaims] = useState([]);

  // ✅ ADDED: search state (SAFE ADD)
  const [search, setSearch] = useState("");

  const { language } = useLanguage();
  const screenWidth = Dimensions.get("window").width;

  const t = translations[language] || translations.en;

  /* ================= ANIMATION ================= */
  const pulse = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.02, { duration: 2000 }), -1, true);
  }, []);

  const animatedPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  /* ================= LOGIC ================= */
  const calculatePremium = async () => {
    try {
      const res = await calculatePremiumAPI();
      if (res?.premium) setPremium(res.premium);
    } catch (e) {
      console.log(e);
    }
  };

  const simulateEvent = () => {
    const newClaim = {
      event: t.disruption,
      payout: 500,
      time: new Date(),
    };

    setClaim(newClaim);

    // ✅ ADDED: recent claims tracking
    setRecentClaims((prev) => [newClaim, ...prev].slice(0, 5)); // increased to 5
  };

  useEffect(() => {
    const interval = setInterval(simulateEvent, 10000);
    return () => clearInterval(interval);
  }, [language]);

  // ✅ ADDED: clean date formatter
  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#020617" }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(800)} style={{ padding: 20 }}>

        {/* HEADER */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={{
            fontSize: 30,
            fontWeight: "700",
            color: "#E2E8F0"
          }}>
            🛡️ {t.title}
          </Text>

          <Text style={{
            color: "#94A3B8",
            marginTop: 6
          }}>
            {t.subtitle}
          </Text>
        </Animated.View>

        {/* ✅ ADDED: SEARCH BAR (aligned right style) */}
        <View style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginTop: 16
        }}>
          <View style={{
            flexDirection: "row",
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            width: "70%"
          }}>
            <TextInput
              placeholder="Search claims..."
              placeholderTextColor="#64748B"
              value={search}
              onChangeText={setSearch}
              style={{
                color: "#fff",
                flex: 1
              }}
            />
          </View>
        </View>

        {/* HERO */}
        <Animated.View
          entering={FadeInDown.delay(140)}
          style={[{
            backgroundColor: "rgba(99,102,241,0.08)",
            borderRadius: 24,
            padding: 24,
            marginTop: 22,
            borderWidth: 1,
            borderColor: "rgba(99,102,241,0.25)",
            shadowColor: "#6366F1",
            shadowOpacity: 0.3,
            shadowRadius: 20,
          }, animatedPulse]}
        >
          <Text style={{ color: "#94A3B8" }}>
            {t.protected}
          </Text>

          <Text style={{
            color: "#fff",
            fontSize: 42,
            fontWeight: "800"
          }}>
            ₹{claim ? claim.payout : 0}
          </Text>

          {claim && (
            <Text style={{ color: "#64748B", marginTop: 4 }}>
              {formatDate(claim.time)} {/* ✅ FIXED */}
            </Text>
          )}

          <Text style={{ color: "#22C55E", marginTop: 6 }}>
            ● {t.live}
          </Text>
        </Animated.View>

        {/* STATS */}
        <View style={{ flexDirection: "row", marginTop: 18 }}>
          <View style={{
            flex: 1,
            marginRight: 8,
            backgroundColor: "rgba(255,255,255,0.04)",
            padding: 16,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}>
            <Text style={{ color: "#94A3B8", fontSize: 12 }}>
              {t.premium}
            </Text>
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              ₹{premium}
            </Text>
          </View>

          <View style={{
            flex: 1,
            marginLeft: 8,
            backgroundColor: "rgba(255,255,255,0.04)",
            padding: 16,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}>
            <Text style={{ color: "#94A3B8", fontSize: 12 }}>
              {t.risk}
            </Text>
            <Text style={{ color: "#EF4444", fontWeight: "700" }}>
              HIGH
            </Text>
          </View>
        </View>

        {/* ✅ IMPROVED: Recent Claims */}
        <Text style={{
          color: "#94A3B8",
          marginTop: 26,
          marginBottom: 8,
          fontWeight: "600"
        }}>
          Recent Claims
        </Text>

        {recentClaims
          .filter(c => c.event.toLowerCase().includes(search.toLowerCase()))
          .map((c, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(200 + index * 100)}
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              padding: 14,
              borderRadius: 14,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <View>
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {c.event}
              </Text>

              <Text style={{ color: "#64748B", fontSize: 12 }}>
                {formatDate(c.time)}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: "#22C55E", fontWeight: "700" }}>
                ₹{c.payout}
              </Text>

              {/* ✅ ADDED: small badge */}
              <View style={{
                marginTop: 4,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 8,
                backgroundColor: "rgba(34,197,94,0.1)"
              }}>
                <Text style={{
                  color: "#22C55E",
                  fontSize: 10
                }}>
                  SUCCESS
                </Text>
              </View>
            </View>
          </Animated.View>
        ))}

        {/* BUTTON */}
        <Animated.View style={buttonStyle}>
          <TouchableOpacity
            onPressIn={() => (buttonScale.value = withTiming(0.95))}
            onPressOut={() => (buttonScale.value = withTiming(1))}
            onPress={calculatePremium}
            style={{
              backgroundColor: "#6366F1",
              paddingVertical: 18,
              borderRadius: 22,
              alignItems: "center",
              marginTop: 24,
              shadowColor: "#6366F1",
              shadowOpacity: 0.4,
              shadowRadius: 12,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {t.update}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* SECOND BUTTON */}
        <Animated.View style={buttonStyle}>
          <TouchableOpacity
            onPressIn={() => (buttonScale.value = withTiming(0.96))}
            onPressOut={() => (buttonScale.value = withTiming(1))}
            onPress={simulateEvent}
            style={{
              marginTop: 12,
              paddingVertical: 16,
              borderRadius: 20,
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.04)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{ color: "#94A3B8", fontWeight: "600" }}>
              {t.trigger}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ANALYTICS */}
        <Text style={{
          color: "#94A3B8",
          marginTop: 26,
          marginBottom: 8
        }}>
          ANALYTICS
        </Text>

        {/* LINE CHART */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <View style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: 22,
            padding: 18
          }}>
            <LineChart
              data={{
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
                datasets: [{ data: [200, 450, 300, 600, 500] }],
              }}
              width={screenWidth - 64}
              height={200}
              yAxisSuffix="₹"
              chartConfig={{
                backgroundGradientFrom: "#020617",
                backgroundGradientTo: "#020617",
                color: (opacity = 1) => `rgba(99,102,241, ${opacity})`,
                labelColor: () => "#94A3B8",
                strokeWidth: 3,
              }}
              bezier
            />
          </View>
        </Animated.View>

        {/* PIE CHART */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <View style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: 22,
            padding: 18,
            marginTop: 22,
            marginBottom: 40
          }}>
            <PieChart
              data={[
                {
                  name: "Protected",
                  population: claim ? 70 : 40,
                  color: "#6366F1",
                  legendFontColor: "#94A3B8",
                  legendFontSize: 12,
                },
                {
                  name: "Risk",
                  population: claim ? 30 : 60,
                  color: "#EF4444",
                  legendFontColor: "#94A3B8",
                  legendFontSize: 12,
                },
              ]}
              width={screenWidth - 50}
              height={200}
              accessor="population"
              backgroundColor="transparent"
              chartConfig={{
                color: () => "#fff",
              }}
              paddingLeft="12"
              absolute
            />
          </View>
        </Animated.View>
{/* ================= NAVIGATION ACTIONS ================= */}

{/* BUY POLICY */}
<TouchableOpacity
  onPress={() => navigation.navigate("Policies")}
  style={{
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#6366F1",
  }}
>
  <Text style={{ color: "#fff", fontWeight: "600" }}>
    Buy Policy
  </Text>
</TouchableOpacity>

{/* VIEW POLICIES */}
<TouchableOpacity
  onPress={() => navigation.navigate("PoliciesList")}
  style={{
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  }}
>
  <Text style={{ color: "#94A3B8" }}>
    View Policies
  </Text>
</TouchableOpacity>

{/* CLAIMS */}
<TouchableOpacity
  onPress={() => navigation.navigate("Claims")}
  style={{
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "rgba(99,102,241,0.15)",
  }}
>
  <Text style={{ color: "#6366F1", fontWeight: "600" }}>
    View Claims
  </Text>
</TouchableOpacity>

{/* WORKERS */}
<TouchableOpacity
  onPress={() => navigation.navigate("Workers")}
  style={{
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  }}
>
  <Text style={{ color: "#94A3B8" }}>
    View Workers
  </Text>
</TouchableOpacity><TouchableOpacity
  onPress={() => navigation.navigate("Payouts")}
  style={{
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  }}
>
  <Text style={{ color: "#94A3B8" }}>
    View Payouts
  </Text>
</TouchableOpacity><TouchableOpacity
  onPress={() => navigation.replace("Login")}
  style={{
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#EF4444",
  }}
>
  <Text style={{ color: "#fff", fontWeight: "600" }}>
    Logout
  </Text>
</TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}