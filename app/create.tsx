import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { ArrowLeft } from "lucide-react-native";

export default function CreateScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !email.trim() || pin.length !== 4) {
      Alert.alert(
        "Missing Info",
        "Please enter Name, Email, and a 4-digit PIN."
      );
      return;
    }

    setLoading(true);
    const sessionCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    try {
      const { data: session, error } = await supabase
        .from("sessions")
        .insert({
          session_code: sessionCode,
          partner_a_name: name,
          partner_a_email: email,
          partner_a_pin: pin,
          status: "waiting",
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from("session_context").insert([
        {
          session_id: session.id,
          partner_role: "partner_a",
          conversation_history: [],
        },
        {
          session_id: session.id,
          partner_role: "partner_b",
          conversation_history: [],
        },
      ]);

      router.replace({
        pathname: "/chat",
        params: { sessionId: session.id, role: "partner_a", name: name },
      });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Start Session</Text>
        <Text style={styles.subtitle}>
          Let's talk about what's on your mind.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Alex"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="alex@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Create 4-Digit PIN</Text>
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            placeholder="1234"
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.btn}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Start Chatting</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  backBtn: { marginBottom: 20 },
  title: { fontSize: 32, fontWeight: "800", color: "#0F172A" },
  subtitle: { fontSize: 16, color: "#64748B", marginTop: 8 },
  form: { marginTop: 32, gap: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#64748B" },
  input: {
    backgroundColor: "#F1F5F9",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: "#0F172A",
  },
  btn: {
    backgroundColor: "#0F172A",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
