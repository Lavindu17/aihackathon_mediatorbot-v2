import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../lib/supabase";
import { generateBridgeSummary } from "../lib/gemini";
import { Copy, CheckCircle, Home } from "lucide-react-native";

export default function InviteScreen() {
  const { sessionId } = useLocalSearchParams();
  const [code, setCode] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prepareInvite();
  }, []);

  const prepareInvite = async () => {
    try {
      // 1. Fetch Session Data
      const { data: session } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (session) {
        setCode(session.session_code);

        // 2. Generate Bridge Summary (If it doesn't exist yet)
        if (!session.bridge_summary) {
          // Fetch Partner A's chat history to summarize
          const { data: chat } = await supabase
            .from("messages")
            .select("content, role")
            .eq("session_id", sessionId)
            .eq("role", "partner_a");

          const bridge = await generateBridgeSummary(chat || []);
          setSummary(bridge);

          // Save the summary to the database
          await supabase
            .from("sessions")
            .update({ bridge_summary: bridge })
            .eq("id", sessionId);
        } else {
          setSummary(session.bridge_summary);
        }
      }
    } catch (e) {
      console.error(e);
      setSummary("important relationship topics");
    } finally {
      setLoading(false);
    }
  };

  const shareInvite = () => {
    Share.share({
      message: `I've started a mediation session regarding "${summary}". Please join me here using code: ${code}`,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Generating neutral summary...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconBox}>
        <CheckCircle size={48} color="#10B981" />
      </View>

      <Text style={styles.title}>Step 1 Complete</Text>
      <Text style={styles.body}>
        The mediator has listened to your side. To keep things fair, we now need
        to hear from your partner.
      </Text>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>TOPIC SUMMARY FOR PARTNER:</Text>
        <Text style={styles.summaryText}>"{summary}"</Text>
        <Text style={styles.summaryHint}>
          (Your partner will see this summary, but NOT your private chat
          details.)
        </Text>
      </View>

      <View style={styles.codeSection}>
        <Text style={styles.codeLabel}>SHARE THIS CODE</Text>
        <TouchableOpacity style={styles.codeBox} onPress={shareInvite}>
          <Text style={styles.code}>{code}</Text>
          <Copy size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.hint}>Tap code to copy & share</Text>
      </View>

      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => router.replace("/")}
      >
        <Home size={20} color="#0F172A" />
        <Text style={styles.homeText}>Return Home</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        You can close the app now. When your partner joins, you can log back in
        using this Code + Your PIN.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, color: "#64748B" },
  iconBox: {
    marginBottom: 24,
    backgroundColor: "#DCFCE7",
    padding: 20,
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  body: {
    textAlign: "center",
    fontSize: 16,
    color: "#475569",
    marginBottom: 32,
    lineHeight: 24,
  },

  summaryBox: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 8,
    letterSpacing: 1,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    fontStyle: "italic",
    marginBottom: 12,
    textAlign: "center",
  },
  summaryHint: { fontSize: 12, color: "#94A3B8", textAlign: "center" },

  codeSection: { width: "100%", alignItems: "center", marginBottom: 40 },
  codeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 12,
    letterSpacing: 1,
  },
  codeBox: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    gap: 16,
  },
  code: { fontSize: 32, fontWeight: "800", color: "#0F172A", letterSpacing: 2 },
  hint: { marginTop: 12, color: "#94A3B8", fontSize: 14 },

  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    marginBottom: 24,
  },
  homeText: { fontSize: 16, fontWeight: "600", color: "#0F172A" },
  note: {
    textAlign: "center",
    fontSize: 13,
    color: "#94A3B8",
    maxWidth: "80%",
  },
});
