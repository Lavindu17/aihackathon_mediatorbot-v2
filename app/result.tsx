import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../lib/supabase";
import { generateFinalReport } from "../lib/gemini";
import { ArrowLeft, Lock, RefreshCw, Clock } from "lucide-react-native";

export default function ResultScreen() {
  const { sessionId, role } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("analyzing");
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    loadOrGenerateReport();
  }, []);

  const loadOrGenerateReport = async () => {
    setLoading(true);
    setStatus("analyzing");

    try {
      // 1. CHECK IF REPORT ALREADY EXISTS (Single Source of Truth)
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .select("mediation_report, partner_a_name, partner_b_name") // Get names too if needed
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;

      // If report exists in DB, just use it!
      if (sessionData?.mediation_report) {
        setReport(sessionData.mediation_report);
        setStatus("ready");
        setLoading(false);
        return;
      }

      // 2. IF NO REPORT, WE NEED TO GENERATE IT

      // Fetch Chats
      const { data: chatA } = await supabase
        .from("messages")
        .select("content, role")
        .eq("session_id", sessionId)
        .eq("role", "partner_a");
      const { data: chatB } = await supabase
        .from("messages")
        .select("content, role")
        .eq("session_id", sessionId)
        .eq("role", "partner_b");

      const countA = chatA?.length || 0;
      const countB = chatB?.length || 0;

      // Check participation
      if (countA < 2 || countB < 2) {
        setStatus("waiting");
        setLoading(false);
        return;
      }

      // Generate AI Report
      const result = await generateFinalReport(chatA || [], chatB || []);

      if (result) {
        // 3. SAVE REPORT TO DB SO PARTNER SEES THE SAME THING
        const { error: saveError } = await supabase
          .from("sessions")
          .update({ mediation_report: result })
          .eq("id", sessionId);

        if (!saveError) {
          setReport(result);
          setStatus("ready");
        } else {
          console.error("Save Error", saveError);
          setStatus("error");
        }
      } else {
        setStatus("error");
      }
    } catch (e) {
      console.error(e);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Analyzing conflict dynamics...</Text>
      </View>
    );
  }

  if (status === "waiting") {
    return (
      <View style={styles.center}>
        <Clock size={64} color="#F59E0B" />
        <Text style={styles.title}>Waiting for Partner</Text>
        <Text style={styles.bodyText}>
          We need both perspectives to generate a fair report.
        </Text>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={loadOrGenerateReport}
        >
          <RefreshCw size={20} color="#fff" />
          <Text style={styles.refreshText}>Check Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={{ color: "#64748B" }}>Go back to chat</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === "error" || !report) {
    return (
      <View style={styles.center}>
        <Text>Could not generate report.</Text>
        <TouchableOpacity onPress={loadOrGenerateReport}>
          <Text style={{ color: "blue", marginTop: 10 }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Determine advice view
  const myAdvice =
    role === "partner_a" ? report.advice_for_a : report.advice_for_b;
  const otherAdvice =
    role === "partner_a" ? report.advice_for_b : report.advice_for_a;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 24 }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ marginBottom: 20 }}
      >
        <ArrowLeft size={24} color="#1E293B" />
      </TouchableOpacity>

      <Text style={styles.title}>Mediation Report</Text>

      {/* SHARED ANALYSIS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shared Analysis</Text>
        <Text style={styles.body}>{report.analysis}</Text>
      </View>

      {/* MY ADVICE */}
      <View style={[styles.card, styles.highlightCard]}>
        <Text style={styles.cardTitle}>Advice for You</Text>
        <Text style={styles.cardBody}>{myAdvice}</Text>
      </View>

      {/* PARTNER ADVICE */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.cardTitle}>Advice for Partner</Text>
          <Lock size={16} color="#94A3B8" />
        </View>
        <Text
          style={[styles.cardBody, { color: "#94A3B8", fontStyle: "italic" }]}
        >
          (This advice is private for them. Focus on your part!)
        </Text>
      </View>

      <TouchableOpacity
        style={styles.doneBtn}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.doneText}>End Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", paddingTop: 40 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 24,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 16,
    textAlign: "center",
  },
  bodyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#334155",
    marginTop: 16,
  },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  body: { fontSize: 16, lineHeight: 24, color: "#334155" },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },
  highlightCard: {
    borderWidth: 2,
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1E293B",
  },
  cardBody: { fontSize: 16, lineHeight: 24, color: "#334155" },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  doneBtn: {
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  doneText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  refreshBtn: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
    gap: 10,
    alignItems: "center",
    marginTop: 20,
  },
  refreshText: { color: "#fff", fontWeight: "600" },
  backLink: { marginTop: 20, padding: 10 },
});
