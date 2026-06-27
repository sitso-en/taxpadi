import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import { router } from "expo-router";
import { useState } from "react";

import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useTransactions } from "../../context/TransactionContext";

export default function AddTransactionScreen() {
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const { addTransaction } = useTransactions();

  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isDeductible, setIsDeductible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleSave = () => {
    if (!amount) return;

    addTransaction({
      id: Date.now(),
      title: description || "Transaction",
      amount: Number(amount),
      type,
      category: category || "Other",
      isDeductible,
      date: date.toISOString(),
    });

    router.replace("/(tabs)/transactions");
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const scanReceipt = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        setReceiptUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleRecording = async () => {
    try {
      if (!isRecording) {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        setRecording(recording);
        setIsRecording(true);
      } else {
        await recording?.stopAndUnloadAsync();
        setRecording(null);
        setIsRecording(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/transactions")}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Log Transaction</Text>
      </View>

      {/* Type Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            type === "income" && styles.selectedToggle,
          ]}
          onPress={() => setType("income")}
        >
          <Text
            style={[
              styles.toggleText,
              type === "income" && styles.selectedToggleText,
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            type === "expense" && styles.selectedToggle,
          ]}
          onPress={() => setType("expense")}
        >
          <Text
            style={[
              styles.toggleText,
              type === "expense" && styles.selectedToggleText,
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount */}
      <Text style={styles.label}>AMOUNT (GHS)</Text>
      <View style={styles.inputCard}>
        <Text style={styles.currency}>GH₵</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {/* Category */}
      <Text style={styles.label}>CATEGORY</Text>
      <TextInput
        style={styles.input}
        placeholder="Select category..."
        placeholderTextColor="#9CA3AF"
        value={category}
        onChangeText={setCategory}
      />

      {/* Description */}
      <Text style={styles.label}>DESCRIPTION</Text>
      <TextInput
        style={styles.descriptionInput}
        placeholder="What was this for?"
        placeholderTextColor="#9CA3AF"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      {/* Date */}
      <Text style={styles.label}>DATE</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ color: "#6B7280" }}>
          {date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      </TouchableOpacity>

      {showDatePicker && Platform.OS !== "web" && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
        />
      )}

      {/* Tax Deductible */}
      <View style={styles.switchContainer}>
        <View>
          <Text style={styles.switchTitle}>Tax Deductible?</Text>
          <Text style={styles.switchSubtitle}>Reduces your tax liability</Text>
        </View>
        <Switch value={isDeductible} onValueChange={setIsDeductible} />
      </View>

      {/* Attach */}
      <Text style={styles.label}>ATTACH</Text>
      <View style={styles.attachContainer}>

        {/* Scan Receipt */}
        <TouchableOpacity style={styles.attachButton} onPress={scanReceipt}>
          <Ionicons name="camera-outline" size={18} color="#111827" />
          <Text style={styles.attachText}>
            {receiptUri ? "Receipt Added ✓" : "Scan Receipt"}
          </Text>
        </TouchableOpacity>

        {/* Voice Log */}
        <View style={styles.attachButton}>
          <TouchableOpacity
            style={styles.helpContainer}
            onPress={() => setShowVoiceHelp(true)}
          >
            <Text style={styles.helpText}>How to record?</Text>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#C44736"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.voiceButton}
            onPress={toggleRecording}
          >
            <Ionicons
              name={isRecording ? "stop-circle-outline" : "mic-outline"}
              size={24}
              color="#111827"
            />
            <Text style={styles.attachText}>
              {isRecording ? "Stop Recording" : "Voice Log"}
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Save */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Transaction</Text>
      </TouchableOpacity>

      {/* Voice Help Popup */}
      {showVoiceHelp && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="mic-outline" size={60} color="#C44736" />
            <Text style={styles.modalTitle}>Voice Recording Tips</Text>
            <Text style={styles.modalMessage}>
              • Record one transaction at a time{"\n\n"}
              • Start with "I spent..." or "I received..."{"\n\n"}
              • Say the amount clearly in cedis{"\n\n"}
              • Keep recordings under 15 seconds{"\n\n"}
              • Speak clearly at a normal pace{"\n\n"}
              Good example:{"\n"}
              "I spent 500 cedis on groceries today"
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowVoiceHelp(false)}
            >
              <Text style={styles.modalButtonText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </ScrollView>
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
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginLeft: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 30,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 30,
  },
  selectedToggle: {
    backgroundColor: "#C44736",
  },
  toggleText: {
    color: "#111827",
    fontFamily: "Inter_500Medium",
  },
  selectedToggleText: {
    color: "#FFFFFF",
  },
  label: {
    color: "#C44736",
    fontSize: 11,
    marginBottom: 8,
    fontFamily: "Inter_600SemiBold",
  },
  inputCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  currency: {
    fontSize: 28,
    color: "#C44736",
    marginRight: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    ...(Platform.OS === "web" ? { outlineWidth: 0 } : {}),
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  descriptionInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 18,
    minHeight: 90,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  switchContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  switchTitle: {
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
  },
  switchSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 4,
  },
  attachContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  attachButton: {
    width: "48%",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  attachText: {
    marginTop: 6,
    color: "#111827",
  },
  saveButton: {
    backgroundColor: "#C44736",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    marginTop: 14,
    fontSize: 20,
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },
  modalMessage: {
    marginTop: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  modalButton: {
    marginTop: 24,
    backgroundColor: "#C44736",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },
  helpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  helpText: {
    color: "#6B7280",
    fontSize: 12,
    marginRight: 4,
    fontFamily: "Inter_500Medium",
  },
  voiceButton: {
    alignItems: "center",
    marginTop: 14,
  },
});