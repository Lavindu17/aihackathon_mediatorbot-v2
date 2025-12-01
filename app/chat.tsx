import "react-native-url-polyfill/auto";
import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../lib/supabase";
import { generateAIResponse } from "../lib/gemini";
import {
  ArrowLeft,
  Send,
  Sparkles,
  CheckCircle,
  Share2,
} from "lucide-react-native";

interface Message {
  id: string;
  content: string;
  role: string;
  created_at?: string;
}

export default function ChatScreen() {
  const { sessionId, role, name } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const myRole = role as string;
  const botRole = role === "partner_a" ? "bot_to_a" : "bot_to_b";

  useEffect(() => {
    fetchMessages();
    checkAndSendWelcome();

    const channel = supabase
      .channel(`chat-${sessionId}-${myRole}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.role === myRole || newMsg.role === botRole) {
            setMessages((prev) => {
              const exists = prev.find((m) => m.id === newMsg.id);
              if (exists) return prev;
              return [...prev, newMsg];
            });
            setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
          }
        }
      )
      .subscribe();

    const interval = setInterval(() => fetchMessages(true), 3000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const checkAndSendWelcome = async () => {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .in("role", [myRole, botRole]);
    if (count === 0) {
      let welcomeText = `Hi ${name}. I'm here to listen. What's on your mind?`;
      if (myRole === "partner_b") {
        const { data: session } = await supabase
          .from("sessions")
          .select("bridge_summary")
          .eq("id", sessionId)
          .single();
        if (session?.bridge_summary)
          welcomeText = `Hi ${name}. Partner A started a session regarding: "${session.bridge_summary}".\n\nHow do you feel about this?`;
      }
      await supabase
        .from("messages")
        .insert({ session_id: sessionId, role: botRole, content: welcomeText });
      fetchMessages();
    }
  };

  const fetchMessages = async (silent = false) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .in("role", [myRole, botRole])
      .order("created_at", { ascending: true });
    if (!error && data) setMessages(data);
  };

  const handleAction = () => {
    const myMsgCount = messages.filter((m) => m.role === myRole).length;
    if (myMsgCount < 3) {
      Alert.alert("Too Early", "Please share more details first.");
      return;
    }

    if (myRole === "partner_a")
      router.push({ pathname: "/invite", params: { sessionId } });
    else router.push({ pathname: "/result", params: { sessionId, role } });
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText("");
    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(), content: text, role: myRole },
    ]);
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);

    try {
      await supabase
        .from("messages")
        .insert({ session_id: sessionId, role: myRole, content: text });
      const history = messages
        .slice(-5)
        .map((m) => ({
          role: m.role === myRole ? "user" : "model",
          content: m.content,
        }));
      const aiReply = await generateAIResponse(history, text);
      await supabase
        .from("messages")
        .insert({ session_id: sessionId, role: botRole, content: aiReply });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.role === myRole;
    return (
      <View style={[styles.msgRow, isMe ? styles.myMsgRow : styles.botMsgRow]}>
        {!isMe && (
          <View style={styles.botIcon}>
            <Sparkles size={16} color="#fff" />
          </View>
        )}
        <View
          style={[styles.bubble, isMe ? styles.myBubble : styles.botBubble]}
        >
          <Text style={[styles.msgText, isMe ? styles.myText : styles.botText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/")}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Mediator</Text>
          <Text style={styles.headerSub}>Private Session ({name})</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.resolveBtn,
            messages.filter((m) => m.role === myRole).length < 3
              ? { opacity: 0.5 }
              : { opacity: 1 },
          ]}
          onPress={handleAction}
        >
          {myRole === "partner_a" ? (
            <Share2 size={20} color="#fff" />
          ) : (
            <CheckCircle size={20} color="#fff" />
          )}
          <Text style={styles.resolveText}>
            {myRole === "partner_a" ? "Invite" : "Resolve"}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      {loading && (
        <View style={styles.typing}>
          <ActivityIndicator size="small" color="#64748B" />
          <Text style={styles.typingText}>Thinking...</Text>
        </View>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Type here..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    gap: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  headerSub: { fontSize: 12, color: "#64748B" },
  resolveBtn: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
    gap: 6,
  },
  resolveText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  list: { padding: 16, paddingBottom: 40 },
  msgRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
    gap: 8,
  },
  myMsgRow: { justifyContent: "flex-end" },
  botMsgRow: { justifyContent: "flex-start" },
  botIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: { maxWidth: "80%", padding: 12, borderRadius: 20 },
  myBubble: { backgroundColor: "#1E293B", borderBottomRightRadius: 4 },
  botBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  msgText: { fontSize: 15, lineHeight: 22 },
  myText: { color: "#fff" },
  botText: { color: "#1E293B" },
  typing: {
    padding: 8,
    paddingLeft: 20,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  typingText: { fontSize: 12, color: "#94A3B8" },
  inputBox: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    alignItems: "flex-end",
    gap: 10,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    padding: 12,
    paddingTop: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
});
