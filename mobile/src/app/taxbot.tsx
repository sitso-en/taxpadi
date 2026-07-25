import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  askTaxBot,
  clearConversationHistory,
  getConversationHistory,
} from "@/services/taxbot.service";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/context/ToastContext";

type ChatMessage = {
  sender: "user" | "bot";
  text: string;
};

const QUICK_PROMPTS = [
  { icon: "calculator-outline", label: "What is VAT?", prompt: "What is VAT?" },
  { icon: "receipt-outline", label: "My invoices", prompt: "How many invoices do I have?" },
  { icon: "calendar-outline", label: "Deadlines", prompt: "What are my upcoming tax deadlines?" },
  { icon: "cash-outline", label: "PAYE", prompt: "How is PAYE calculated in Ghana?" },
] as const;

function TypingDots() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, { toValue: 1, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.dotsRow}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
              transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }],
            },
          ]}
        />
      ))}
    </View>
  );
}

function BotAvatar() {
  return (
    <View style={styles.botAvatar}>
      <Ionicons name="sparkles" size={13} color="#FFFFFF" />
    </View>
  );
}

export default function TaxBotScreen() {
  const { showToast } = useToast();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const scrollToEnd = () =>
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await getConversationHistory();
        if (response.success && response.data.conversations.length > 0) {
          // History arrives newest-first; render oldest-first so the newest sits at the bottom.
          const messages: ChatMessage[] = [];
          [...response.data.conversations].reverse().forEach((c) => {
            messages.push({ sender: "user", text: c.question });
            messages.push({ sender: "bot", text: c.answer });
          });
          setChat(messages);
          scrollToEnd();
        }
      } catch {
        // start with empty chat — hero will be shown
      }
    };
    loadHistory();
  }, []);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (loading || !trimmed) return;

    setLoading(true);
    setChat((prev) => [...prev, { sender: "user", text: trimmed }]);
    setMessage("");
    scrollToEnd();

    try {
      const response = await askTaxBot(trimmed);
      if (response.success) {
        setChat((prev) => [...prev, { sender: "bot", text: response.data.answer }]);
      }
    } catch (error: any) {
      setChat((prev) => [
        ...prev,
        {
          sender: "bot",
          text: error?.response?.data?.message ?? "Sorry, I'm unable to answer right now.",
        },
      ]);
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      await clearConversationHistory();
      setChat([]);
      showToast("Chat cleared.", "success");
    } catch {
      showToast("Couldn't clear the chat. Please try again.", "error");
    } finally {
      setClearing(false);
      setConfirmClear(false);
    }
  };

  const hasChat = chat.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.innerLayout}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.headerBtn}
            >
              <Ionicons name="chevron-back" size={26} color="#111827" />
            </TouchableOpacity>

            <View style={styles.headerTitleWrap}>
              <BotAvatar />
              <View>
                <Text style={styles.headerTitle}>TaxBot</Text>
                <Text style={styles.headerSubtitle}>Ghana tax assistant</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setConfirmClear(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.headerBtn, { alignItems: "flex-end" }]}
              disabled={!hasChat}
            >
              <Ionicons
                name="trash-outline"
                size={21}
                color={hasChat ? "#C44736" : "transparent"}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.chatArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.chatContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Hero — only shown when no chat yet */}
            {!hasChat && (
              <View style={styles.heroCard}>
                <View style={styles.heroIcon}>
                  <Ionicons name="sparkles" size={22} color="#C44736" />
                </View>
                <Text style={styles.heroTitle}>Hi, I'm TaxBot 👋</Text>
                <Text style={styles.heroText}>
                  Ask me anything about VAT, PAYE, withholding tax, deadlines, or your
                  invoices. I'm here to make Ghana tax simple.
                </Text>
              </View>
            )}

            {chat.map((item, index) =>
              item.sender === "bot" ? (
                <View key={index} style={styles.botRow}>
                  <BotAvatar />
                  <View style={[styles.messageBubble, styles.botBubble]}>
                    <Text style={styles.messageText}>{item.text}</Text>
                  </View>
                </View>
              ) : (
                <View key={index} style={styles.userRow}>
                  <View style={[styles.messageBubble, styles.userBubble]}>
                    <Text style={[styles.messageText, styles.userMessageText]}>{item.text}</Text>
                  </View>
                </View>
              )
            )}

            {loading && (
              <View style={styles.botRow}>
                <BotAvatar />
                <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
                  <TypingDots />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick prompts — only before the conversation starts */}
          {!hasChat && (
            <View style={styles.quickWrap}>
              <Text style={styles.quickHeader}>Try asking</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickContent}
              >
                {QUICK_PROMPTS.map((q) => (
                  <TouchableOpacity
                    key={q.label}
                    style={styles.quickButton}
                    onPress={() => send(q.prompt)}
                    activeOpacity={0.86}
                  >
                    <Ionicons name={q.icon as any} size={14} color="#C44736" style={{ marginRight: 6 }} />
                    <Text style={styles.quickText}>{q.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Composer */}
          <View style={styles.composerCard}>
            <TextInput
              style={styles.input}
              placeholder="Ask TaxBot anything..."
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
              onSubmitEditing={() => send(message)}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, (!message.trim() || loading) && styles.sendButtonDisabled]}
              onPress={() => send(message)}
              activeOpacity={0.85}
              disabled={!message.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={confirmClear}
        onClose={() => setConfirmClear(false)}
        iconName="trash-outline"
        iconColor="#C44736"
        title="Clear chat?"
        message="This permanently deletes your entire TaxBot conversation history. This can't be undone."
        confirmLabel="Clear chat"
        onConfirm={handleClear}
        loading={clearing}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2EDE8",
  },
  keyboardContainer: {
    flex: 1,
  },
  innerLayout: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerBtn: {
    width: 40,
    justifyContent: "center",
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11.5,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginTop: 1,
  },

  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
  },

  // Hero
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EFEFED",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FCE8E6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F8C5BF",
  },
  heroTitle: {
    fontSize: 19,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    letterSpacing: -0.3,
  },
  heroText: {
    color: "#6B7280",
    marginTop: 6,
    lineHeight: 20,
    fontSize: 13.5,
    fontFamily: "Inter_400Regular",
  },

  // Chat
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingBottom: 8,
  },
  botRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 12,
    maxWidth: "88%",
  },
  userRow: {
    alignItems: "flex-end",
    marginBottom: 12,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18,
  },
  botBubble: {
    flexShrink: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: "#EFEFED",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  userBubble: {
    maxWidth: "82%",
    backgroundColor: "#C44736",
    borderTopRightRadius: 6,
  },
  typingBubble: {
    paddingVertical: 14,
  },
  messageText: {
    color: "#111827",
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    fontSize: 14,
  },
  userMessageText: {
    color: "#FFFFFF",
  },

  dotsRow: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#C44736",
  },

  // Quick prompts
  quickWrap: {
    marginTop: 8,
    marginBottom: 10,
  },
  quickHeader: {
    color: "#6B7280",
    fontFamily: "Inter_600SemiBold",
    fontSize: 11.5,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  quickContent: {
    paddingRight: 6,
    gap: 10,
  },
  quickButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#EFEFED",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  quickText: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
    fontSize: 11.5,
  },

  // Composer
  composerCard: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 8,
    paddingLeft: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#EFEFED",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === "ios" ? 12 : 8,
    paddingBottom: Platform.OS === "ios" ? 12 : 8,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#111827",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#E0B8B1",
  },
});