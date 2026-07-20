import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
  getConversationHistory,
} from "@/services/taxbot.service";

type ChatMessage = {
  sender: "user" | "bot";
  text: string;
};

export default function TaxBotScreen() {
  const [message, setMessage] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await getConversationHistory();

        if (
          response.success &&
          response.data.conversations.length > 0
        ) {
          const messages: ChatMessage[] = [];

          response.data.conversations.forEach((conversation) => {
            messages.push({
              sender: "user",
              text: conversation.question,
            });

            messages.push({
              sender: "bot",
              text: conversation.answer,
            });
          });

          setChat(messages);
        }
      } catch {
        // start with empty chat — hero will be shown
      }
    };

    loadHistory();
  }, []);

  const sendMessage = async () => {
    if (loading) return;

    if (!message.trim()) return;

    setLoading(true);

    setShowSuggestions(false);

    const userText = message;

    setChat((previous) => [
      ...previous,
      {
        sender: "user",
        text: userText,
      },
    ]);

    setMessage("");

    try {
      const response = await askTaxBot(userText);

      if (response.success) {
        setChat((previous) => [
          ...previous,
          {
            sender: "bot",
            text: response.data.answer,
          },
        ]);
      }
    } catch (error: any) {
      setChat((previous) => [
        ...previous,
        {
          sender: "bot",
          text:
            error?.response?.data?.message ??
            "Sorry, I'm unable to answer right now.",
        },
      ]);
    } finally {
      setLoading(false);

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({
          animated: true,
        });
      }, 200);
    }
  };

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
            >
              <Ionicons name="chevron-back" size={26} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>TaxBot</Text>
            <View style={{ width: 26 }} />
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.chatArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.chatContent}
          >
            {/* Hero — only shown when no chat yet */}
            {chat.length === 0 && (
              <View style={styles.heroCard}>
                <View style={styles.heroTopRow}>
                  <View style={styles.botIcon}>
                    <Ionicons name="chatbubbles-outline" size={21} color="#C44736" />
                  </View>

                  <View style={styles.heroCopy}>
                    <Text style={styles.heroTitle}>Your AI Tax Assistant</Text>
                    <Text style={styles.heroText}>
                      Fast answers, smarter guidance, and quick help on tax tasks.
                    </Text>
                  </View>
                </View>

                <View style={styles.heroTags}>
                  <View style={styles.heroTag}>
                    <Ionicons name="calculator-outline" size={12} color="#C44736" />
                    <Text style={styles.heroTagText}>VAT</Text>
                  </View>
                  <View style={styles.heroTag}>
                    <Ionicons name="receipt-outline" size={12} color="#C44736" />
                    <Text style={styles.heroTagText}>Invoices</Text>
                  </View>
                  <View style={styles.heroTag}>
                    <Ionicons name="calendar-outline" size={12} color="#C44736" />
                    <Text style={styles.heroTagText}>Deadlines</Text>
                  </View>
                </View>
              </View>
            )}

            {chat.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.messageContainer,
                  item.sender === "user"
                    ? styles.userContainer
                    : styles.botContainer,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    item.sender === "user"
                      ? styles.userBubble
                      : styles.botBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      item.sender === "user" && styles.userMessageText,
                    ]}
                  >
                    {item.text}
                  </Text>
                </View>
              </View>
            ))}

            {loading && (
              <View style={styles.thinkingRow}>
                <ActivityIndicator size="small" color="#C44736" />
                <Text style={styles.thinkingText}>TaxBot is thinking...</Text>
              </View>
            )}
          </ScrollView>

          {showSuggestions && chat.length === 0 && (
            <View style={styles.quickWrap}>
              <Text style={styles.quickHeader}>Quick prompts</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.quickActions}
                contentContainerStyle={styles.quickContent}
              >
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => {
                    setMessage("What is VAT?");
                    setShowSuggestions(false);
                  }}
                  activeOpacity={0.86}
                >
                  <Ionicons name="calculator-outline" size={14} color="#C44736" style={{ marginRight: 6 }} />
                  <Text style={styles.quickText}>What is VAT?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => {
                    setMessage("How many invoices do I have?");
                    setShowSuggestions(false);
                  }}
                  activeOpacity={0.86}
                >
                  <Ionicons name="receipt-outline" size={14} color="#C44736" style={{ marginRight: 6 }} />
                  <Text style={styles.quickText}>My invoices</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => {
                    setMessage("Tax deadlines");
                    setShowSuggestions(false);
                  }}
                  activeOpacity={0.86}
                >
                  <Ionicons name="calendar-outline" size={14} color="#C44736" style={{ marginRight: 6 }} />
                  <Text style={styles.quickText}>Deadlines</Text>
                </TouchableOpacity>
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
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />

            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessage}
              activeOpacity={0.85}
            >
              <Ionicons
                name={loading ? "hourglass-outline" : "send"}
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EFEFED",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  botIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FCE8E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#F8C5BF",
  },

  heroCopy: {
    flex: 1,
    minWidth: 0,
  },

  heroTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    letterSpacing: -0.2,
  },

  heroText: {
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 18,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },

  heroTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  heroTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8F6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#F8C5BF",
  },

  heroTagText: {
    marginLeft: 5,
    color: "#C44736",
    fontSize: 11.5,
    fontFamily: "Inter_600SemiBold",
  },

  chatArea: {
    flex: 1,
  },

  chatContent: {
    paddingBottom: 8,
  },

  messageContainer: {
    width: "100%",
    marginBottom: 10,
  },

  botContainer: {
    alignItems: "flex-start",
  },

  userContainer: {
    alignItems: "flex-end",
  },

  messageBubble: {
    maxWidth: "78%",
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 16,
  },

  botBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFEFED",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  userBubble: {
    backgroundColor: "#C44736",
  },

  messageText: {
    color: "#111827",
    fontFamily: "Inter_400Regular",
    flexShrink: 1,
    lineHeight: 19,
    fontSize: 13.5,
  },

  userMessageText: {
    color: "#FFFFFF",
  },

  thinkingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },

  thinkingText: {
    marginLeft: 10,
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
  },

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

  quickActions: {
    marginHorizontal: -2,
  },

  quickContent: {
    paddingRight: 6,
  },

  quickButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#EFEFED",
    marginRight: 10,
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

  composerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 10,
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
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Inter_400Regular",
    color: "#111827",
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    shadowColor: "#C44736",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
});