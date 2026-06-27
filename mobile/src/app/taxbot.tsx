import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useInvoices } from "../context/InvoiceContext";
import { useDeadlines } from "../context/DeadlineContext";
import { useNotifications } from "../context/NotificationContext";

type ChatMessage = {
  sender: "user" | "bot";
  text: string;
};

export default function TaxBotScreen() {
  const [message, setMessage] = useState("");
  const [showSuggestions, setShowSuggestions] =
    useState(true);

  const { invoices } = useInvoices();
  const { deadlines } = useDeadlines();
  const { unreadCount } =
    useNotifications();

  const scrollRef = useRef<ScrollView>(null);

  const [chat, setChat] = useState<
    ChatMessage[]
  >([
    {
      sender: "bot",
      text:
        "Hello 👋 I'm TaxBot. How can I help you today?",
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    setShowSuggestions(false);

    const text = message.toLowerCase();

    const userMessage: ChatMessage = {
      sender: "user",
      text: message,
    };

    let botReply =
      "I can assist you with VAT, PAYE, invoices, deadlines, notifications and compliance.";

    if (text.includes("vat")) {
      botReply =
        "VAT returns are normally filed monthly. Keep proper records before filing.";
    }

    else if (text.includes("paye")) {
      botReply =
        "PAYE stands for Pay As You Earn. It is deducted from employee salaries.";
    }

    else if (
      text.includes("deadline") ||
      text.includes("deadlines")
    ) {
      const upcomingDeadlines =
        deadlines.filter(
          (deadline) =>
            new Date(
              deadline.dueDate
            ) >= new Date()
        );

      botReply =
        upcomingDeadlines.length === 0
          ? "You currently have no upcoming tax deadlines."
          : `You currently have ${upcomingDeadlines.length} upcoming tax deadline${
              upcomingDeadlines.length >
              1
                ? "s"
                : ""
            }.`;
    }

    else if (
      text.includes("invoice") &&
      text.includes("how many")
    ) {
      botReply =
        invoices.length === 0
          ? "You currently have no invoices."
          : `You currently have ${invoices.length} invoice${
              invoices.length > 1
                ? "s"
                : ""
            }.`;
    }

    else if (text.includes("unpaid")) {
      const unpaidInvoices =
        invoices.filter(
          (invoice) =>
            invoice.status !== "Paid"
        );

      botReply =
        unpaidInvoices.length === 0
          ? "Great! You have no unpaid invoices."
          : `You currently have ${unpaidInvoices.length} unpaid invoice${
              unpaidInvoices.length > 1
                ? "s"
                : ""
            }.`;
    }

    else if (
      text.includes("total") &&
      text.includes("invoice")
    ) {
      const totalAmount =
        invoices.reduce(
          (sum, invoice) =>
            sum + invoice.amount,
          0
        );

      botReply = `The total value of your invoices is GH¢ ${totalAmount.toFixed(
        2
      )}.`;
    }

    else if (
      text.includes("notification")
    ) {
      botReply =
        unreadCount === 0
          ? "You have no unread notifications."
          : `You currently have ${unreadCount} unread notification${
              unreadCount > 1
                ? "s"
                : ""
            }.`;
    }

    else if (
      text.includes("next") &&
      text.includes("deadline")
    ) {
      const upcoming = deadlines
        .filter(
          (deadline) =>
            new Date(
              deadline.dueDate
            ) >= new Date()
        )
        .sort(
          (a, b) =>
            new Date(
              a.dueDate
            ).getTime() -
            new Date(
              b.dueDate
            ).getTime()
        );

      if (upcoming.length > 0) {
        botReply = `Your next deadline is ${upcoming[0].title} due on ${new Date(
          upcoming[0].dueDate
        ).toLocaleDateString()}.`;
      } else {
        botReply =
          "You currently have no upcoming deadlines.";
      }
    }

    setChat((prev) => [
      ...prev,
      userMessage,
      {
        sender: "bot",
        text: botReply,
      },
    ]);

    setMessage("");

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color="#111827"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          TaxBot
        </Text>

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

        <Text style={styles.heroTitle}>
          Your AI Tax Assistant
        </Text>

        <Text style={styles.heroText}>
          Ask questions about VAT,
          PAYE, invoices, compliance
          and deadlines.
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        showsVerticalScrollIndicator={
          false
        }
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
                  item.sender ===
                    "user" && {
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
          showsHorizontalScrollIndicator={
            false
          }
          style={styles.quickActions}
        >
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => {
              setMessage(
                "What is VAT?"
              );
              setShowSuggestions(
                false
              );
            }}
          >
            <Text
              style={styles.quickText}
            >
              What is VAT?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => {
              setMessage(
                "How many invoices do I have?"
              );
              setShowSuggestions(
                false
              );
            }}
          >
            <Text
              style={styles.quickText}
            >
              My invoices
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => {
              setMessage(
                "Tax deadlines"
              );
              setShowSuggestions(
                false
              );
            }}
          >
            <Text
              style={styles.quickText}
            >
              Deadlines
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask TaxBot anything..."
          placeholderTextColor="#9CA3AF"
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={
            sendMessage
          }
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
        >
          <Ionicons
            name="send"
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
    justifyContent:
      "space-between",
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
    fontFamily:
      "Inter_400Regular",
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
    fontFamily:
      "Inter_500Medium",
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
    fontFamily:
      "Inter_400Regular",
  },

  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#C44736",
    justifyContent:
      "center",
    alignItems: "center",
    marginLeft: 10,
  },
});

