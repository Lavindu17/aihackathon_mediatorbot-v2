import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  MessageSquare,
  Users,
  Heart,
  Sparkles,
  ArrowRight,
  Shield,
  X,
  Lock,
} from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function LandingPage() {
  const [showMenu, setShowMenu] = useState(false);

  const handleAction = (route: string) => {
    setShowMenu(false);
    setTimeout(() => router.push(route), 200);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* BACKGROUND GRADIENT MESH */}
      <LinearGradient
        colors={["#FDFBF7", "#F3F4F6", "#FFFFFF"]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.pillBadge}>
              <Sparkles size={14} color="#D946EF" />
              <Text style={styles.pillText}>AI Mediator v1.0</Text>
            </View>
          </View>

          {/* MAIN HERO */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              Find Common{"\n"}
              <Text style={styles.heroTitleHighlight}>Ground.</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Navigate relationship conflicts with a private, unbiased AI
              mediator that ensures both sides are heard.
            </Text>
          </View>

          {/* BENTO GRID LAYOUT */}
          <View style={styles.bentoGrid}>
            {/* LARGE CARD */}
            <View style={styles.bentoLarge}>
              <LinearGradient
                colors={["#1E293B", "#0F172A"]}
                style={styles.cardGradient}
              >
                <View style={styles.iconCircle}>
                  <Shield size={28} color="#fff" />
                </View>
                <Text style={styles.cardTitleLight}>100% Private Space</Text>
                <Text style={styles.cardDescLight}>
                  We lock your chat with a PIN. Your partner only sees the
                  summary, never your raw feelings.
                </Text>
              </LinearGradient>
            </View>

            {/* ROW OF SMALL CARDS */}
            <View style={styles.bentoRow}>
              <View style={[styles.bentoSmall, { backgroundColor: "#F0FDF4" }]}>
                <Heart size={32} color="#16A34A" />
                <Text style={styles.bentoLabel}>Empathetic</Text>
              </View>
              <View style={[styles.bentoSmall, { backgroundColor: "#EFF6FF" }]}>
                <MessageSquare size={32} color="#2563EB" />
                <Text style={styles.bentoLabel}>Unbiased</Text>
              </View>
            </View>
          </View>

          {/* HOW IT WORKS (Timeline) */}
          <View style={styles.timelineSection}>
            <Text style={styles.sectionTitle}>The Flow</Text>

            <View style={styles.timelineItem}>
              <View style={styles.timelineLine} />
              <View style={styles.timelineDot}>
                <Text style={styles.dotNum}>1</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineHeader}>Speak Freely</Text>
                <Text style={styles.timelineText}>
                  Chat privately. The AI listens without judgment.
                </Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineLine} />
              <View style={styles.timelineDot}>
                <Text style={styles.dotNum}>2</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineHeader}>Invite Partner</Text>
                <Text style={styles.timelineText}>
                  Send a secure code. They share their side.
                </Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineDot}>
                <Text style={styles.dotNum}>3</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineHeader}>Resolution</Text>
                <Text style={styles.timelineText}>
                  Get a shared analysis and actionable advice.
                </Text>
              </View>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* FLOATING CTA */}
        <View style={styles.floatingContainer}>
          <TouchableOpacity
            style={styles.mainButton}
            activeOpacity={0.9}
            onPress={() => setShowMenu(true)}
          >
            <Text style={styles.mainButtonText}>Start Mediation</Text>
            <View style={styles.btnIcon}>
              <ArrowRight size={20} color="#000" />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* MODERN BOTTOM SHEET MODAL */}
      <Modal visible={showMenu} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.backdrop}
            onPress={() => setShowMenu(false)}
          />

          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Choose your path</Text>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => handleAction("/create")}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#F3E8FF" }]}>
                <MessageSquare size={24} color="#9333EA" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Initiate Session</Text>
                <Text style={styles.optionDesc}>
                  I want to start a new topic.
                </Text>
              </View>
              <ArrowRight size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => handleAction("/join")}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#DBEAFE" }]}>
                <Users size={24} color="#2563EB" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Join Partner</Text>
                <Text style={styles.optionDesc}>I have a code to join.</Text>
              </View>
              <ArrowRight size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowMenu(false)}
            >
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBF7" },
  scrollContent: { padding: 24 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 24,
  },
  pillBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAE8FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D946EF",
    letterSpacing: 0.5,
  },

  // Hero
  heroSection: { marginBottom: 40 },
  heroTitle: {
    fontSize: 48,
    fontWeight: "800",
    color: "#1E293B",
    lineHeight: 54,
    letterSpacing: -1.5,
  },
  heroTitleHighlight: { color: "#2563EB" },
  heroSubtitle: {
    fontSize: 18,
    color: "#64748B",
    marginTop: 16,
    lineHeight: 28,
    maxWidth: "90%",
  },

  // Bento Grid
  bentoGrid: { gap: 16, marginBottom: 40 },
  bentoLarge: {
    height: 180,
    borderRadius: 32,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#1E293B",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  cardGradient: { flex: 1, padding: 24, justifyContent: "flex-end" },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  cardTitleLight: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardDescLight: { color: "#CBD5E1", fontSize: 14, lineHeight: 20 },

  bentoRow: { flexDirection: "row", gap: 16 },
  bentoSmall: {
    flex: 1,
    height: 140,
    borderRadius: 32,
    padding: 20,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bentoLabel: { fontSize: 16, fontWeight: "700", color: "#1E293B" },

  // Timeline
  timelineSection: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 15,
    top: 40,
    bottom: -40,
    width: 2,
    backgroundColor: "#E2E8F0",
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  dotNum: { color: "#fff", fontWeight: "700" },
  timelineContent: { flex: 1, paddingBottom: 10 },
  timelineHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  timelineText: { fontSize: 15, color: "#64748B", lineHeight: 22 },

  // Floating CTA
  floatingContainer: { position: "absolute", bottom: 30, left: 24, right: 24 },
  mainButton: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    padding: 4,
    borderRadius: 100,
    alignItems: "center",
    height: 64,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
  },
  mainButtonText: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    paddingLeft: 20,
  },
  btnIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  // Bottom Sheet Modal
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 24,
  },

  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextContainer: { flex: 1 },
  optionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  optionDesc: { fontSize: 13, color: "#64748B" },

  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },
  closeBtn: { marginTop: 24, alignItems: "center", padding: 16 },
  closeText: { fontSize: 16, fontWeight: "600", color: "#64748B" },
});
