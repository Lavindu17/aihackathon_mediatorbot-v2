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
      const { data: session, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("session_code", code.toUpperCase().trim())
        .single();
      if (error || !session) {
        Alert.alert("Error", "Invalid Session Code");
        setLoading(false);
        return;
      }

      // LOGIN CHECK
      if (session.partner_a_pin === pin) {
        // Logging in as Partner A
        router.replace({
          pathname: "/chat",
          params: {
            sessionId: session.id,
            role: "partner_a",
            name: session.partner_a_name,
          },
        });
        return;
      }

      if (session.partner_b_ready && session.partner_b_pin === pin) {
        // Logging in as Partner B
        router.replace({
          pathname: "/chat",
          params: {
            sessionId: session.id,
            role: "partner_b",
            name: session.partner_b_name,
          },
        });
        return;
      }

      // NEW PARTNER B REGISTRATION
      if (!session.partner_b_ready) {
        if (!name.trim() || !email.trim()) {
          Alert.alert(
            "Missing Info",
            "New to this session? Please enter Name and Email."
          );
          setLoading(false);
          return;
        }
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
        return;
      }

      Alert.alert("Access Denied", "Incorrect PIN.");
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
        <Text style={styles.title}>Join / Login</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Session Code</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="XYZ123"
            autoCapitalize="characters"
          />

          <Text style={styles.label}>PIN (4 Digits)</Text>
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            placeholder="****"
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />

          <Text style={styles.divider}>New here? Fill these too:</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your Name"
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TouchableOpacity
            style={styles.btn}
            onPress={handleJoin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Enter Session</Text>
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
  divider: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 10,
    marginBottom: 5,
  },
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
});
