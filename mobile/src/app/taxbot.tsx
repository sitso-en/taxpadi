import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
        } else {
          setChat([
            {
              sender: "bot",
              text: "Hello 👋 I'm TaxBot. How can I help you today?",
            },
          ]);
        }
      } catch {
        setChat([
          {
            sender: "bot",
            text: "Hello 👋 I'm TaxBot. How can I help you today?",
          },
        ]);
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>TaxBot</Text>

        <View style={{ width: 28 }} />
      </View>

      <View style={styles.heroCard}>
        <View style={styles.botIcon}>
          <Ionicons
            name="chatbubble-ellipses"
            size={28}
            color="#C44736"
          />
        </View>

        <Text style={styles.heroTitle}>Your AI Tax Assistant</Text>

        <Text style={styles.heroText}>
          Ask questions about VAT, PAYE, invoices, compliance and
          deadlines.
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      >
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
                  item.sender === "user" && {
                    color: "#FFFFFF",
                  },
                ]}
              >
                {item.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {showSuggestions && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickActions}
        >
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => {
              setMessage("What is VAT?");
              setShowSuggestions(false);
            }}
          >
            <Text style={styles.quickText}>What is VAT?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => {
              setMessage("How many invoices do I have?");
              setShowSuggestions(false);
            }}
          >
            <Text style={styles.quickText}>My invoices</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => {
              setMessage("Tax deadlines");
              setShowSuggestions(false);
            }}
          >
            <Text style={styles.quickText}>Deadlines</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {loading && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <ActivityIndicator size="small" color="#C44736" />

          <Text
            style={{
              marginLeft: 10,
              color: "#6B7280",
            }}
          >
            TaxBot is thinking...
          </Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask TaxBot anything..."
          placeholderTextColor="#9CA3AF"
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={sendMessage}
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={loading}
        >
          <Ionicons
            name={loading ? "hourglass-outline" : "send"}
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 20,
    paddingTop: 55,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },

  botIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FCE8E6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  heroTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  heroText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },

  chatArea: {
    flex: 1,
  },

  messageContainer: {
    width: "100%",
    marginBottom: 12,
  },

  botContainer: {
    alignItems: "flex-start",
  },

  userContainer: {
    alignItems: "flex-end",
  },

  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
  },

  botBubble: {
    backgroundColor: "#FFFFFF",
  },

  userBubble: {
    backgroundColor: "#C44736",
  },

  messageText: {
    color: "#111827",
    fontFamily: "Inter_400Regular",
    flexShrink: 1,
  },

  quickActions: {
    marginVertical: 12,
  },

  quickButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },

  quickText: {
    color: "#111827",
    fontFamily: "Inter_500Medium",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: "Inter_400Regular",
  },

  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
});