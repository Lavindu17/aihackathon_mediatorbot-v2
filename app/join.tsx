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

export default function JoinScreen() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim() || pin.length !== 4) {
      Alert.alert("Required", "Please enter Session Code and PIN.");
      return;
    }

    setLoading(true);

    try {
      // 1. Find Session
      const { data: session, error: findError } = await supabase
        .from("sessions")
        .select("*")
        .eq("session_code", code.toUpperCase().trim())
        .single();

      if (findError || !session) {
        Alert.alert("Error", "Invalid Session Code");
        setLoading(false);
        return;
      }

      // 2. CHECK: Is this a NEW Partner B or Existing Partner B logging back in?
      if (session.partner_b_ready) {
        // --- LOGIN MODE ---
        // If B is already registered, check the PIN
        if (session.partner_b_pin !== pin) {
          Alert.alert("Access Denied", "Incorrect PIN for this session.");
          setLoading(false);
          return;
        }
        // PIN matches? Let them in.
        router.replace({
          pathname: "/chat",
          params: {
            sessionId: session.id,
            role: "partner_b",
            name: session.partner_b_name,
          },
        });
      } else {
        // --- REGISTER MODE ---
        if (!name.trim() || !email.trim()) {
          Alert.alert(
            "Missing Info",
            "Since this is your first time joining, please enter Name and Email."
          );
          setLoading(false);
          return;
        }

        // Register B
        const { error: updateError } = await supabase
          .from("sessions")
          .update({
            partner_b_name: name,
            partner_b_email: email,
            partner_b_pin: pin,
            partner_b_ready: true,
          })
          .eq("id", session.id);

        if (updateError) throw updateError;

        router.replace({
          pathname: "/chat",
          params: { sessionId: session.id, role: "partner_b", name: name },
        });
      }
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

        <Text style={styles.title}>Join Session</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Session Code</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="XYZ123"
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Sam"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="sam@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Set/Enter 4-Digit PIN</Text>
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            placeholder="****"
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />
          <Text style={styles.hint}>
            This secures your chat from your partner.
          </Text>

          <TouchableOpacity
            style={styles.btn}
            onPress={handleJoin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Join Session</Text>
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
    backgroundColor: "#10B981",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  hint: { fontSize: 12, color: "#94A3B8" },
});
