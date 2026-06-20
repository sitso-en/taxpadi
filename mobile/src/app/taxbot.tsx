import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function TaxBotScreen() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      sender: "bot",
      text: "Hello 👋 I'm TaxBot. Ask me anything about taxes.",
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const userMessage = {
      sender: "user",
      text: message,
    };

    let botReply =
      "I can help with VAT, PAYE, filing returns, tax deadlines and compliance.";

    if (message.toLowerCase().includes("vat")) {
      botReply =
        "VAT returns are usually filed monthly. Ensure your records are updated before submission.";
    }

    if (message.toLowerCase().includes("paye")) {
      botReply = "PAYE is Pay As You Earn tax deducted from employee salaries.";
    }

    if (message.toLowerCase().includes("deadline")) {
      botReply = "Always check upcoming filing deadlines to avoid penalties.";
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
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#C44736" />
      </TouchableOpacity>

      <Text style={styles.title}>TaxBot</Text>

      <ScrollView style={styles.chatArea}>
        {chat.map((item, index) => (
          <View
            key={index}
            style={[
              styles.message,
              item.sender === "user" ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text>{item.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask TaxBot..."
          value={message}
          onChangeText={setMessage}
        />

        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 20,
    paddingTop: 50,
  },

  backButton: {
    marginBottom: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  chatArea: {
    flex: 1,
  },

  message: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: "80%",
  },

  userMessage: {
    backgroundColor: "#FCE8E6",
    alignSelf: "flex-end",
  },

  botMessage: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
  },

  inputRow: {
    flexDirection: "row",
    marginTop: 10,
  },

  input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 15,
  },

  sendButton: {
    backgroundColor: "#C44736",
    marginLeft: 10,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
});
