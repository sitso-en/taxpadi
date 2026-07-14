import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
// import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Dropdown } from "react-native-element-dropdown";
import {
  uploadVoiceTransaction,
  scanReceiptTransaction,
  createTransaction,
} from "@/services/transaction.service";

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
import transactions from "./transactions";

const categories = [
  { label: "Sales", value: "Sales" },
  { label: "Transport", value: "Transport" },
  { label: "Utilities", value: "Utilities" },
  { label: "Food", value: "Food" },
  { label: "Salary", value: "Salary" },
  { label: "Rent", value: "Rent" },
  { label: "Other", value: "Other" },
];

export default function AddTransactionScreen() {
  // const [showVoiceHelp, setShowVoiceHelp] = useState(false);

  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isDeductible, setIsDeductible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const transactions = useTransactions();
  // const [recording, setRecording] = useState<Audio.Recording | null>(null);
  // const [audioUri, setAudioUri] = useState<string | null>(null);
  // const [isRecording, setIsRecording] = useState(false);
  // const [sound, setSound] = useState<Audio.Sound | null>(null);

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (loading) return;

    if (!amount.trim()) {
      alert("Enter an amount.");
      return;
    }

    if (Number(amount) <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }

    if (!category) {
      alert("Select a category.");
      return;
    }

    if (!description.trim()) {
      alert("Enter a description.");
      return;
    }

    setLoading(true);

    try {
      await createTransaction({
        type,
        amount: Number(amount),
        category,
        transaction_date: date.toISOString().split("T")[0],
        tax_deductible: isDeductible,
        withholding_applicable: false,
        description,
      });

      router.replace("/(tabs)/transactions");
      await transactions.refreshTransactions();
      alert("Transaction added successfully.");
    
    } catch (error: any) {
      console.log(error);
      alert(
        error?.response?.data?.message ??
        "Failed to save transaction."
      );
    } finally {
      setLoading(false);
    }
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
        base64: true,
      });

      if (result.canceled) return;

      setReceiptUri(result.assets[0].uri);

      if (result.assets[0].base64) {
        const response = await scanReceiptTransaction(
          result.assets[0].base64,
          type
        );

        const data = response.data;

        setAmount(String(data.amount ?? ""));
        setCategory(data.category ?? "");
        setDescription(data.description ?? "");

        if (data.transaction_date) {
          setDate(new Date(data.transaction_date));
        }

        alert("Receipt scanned successfully.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const toggleRecording = async () => {
  //   try {
  //     if (!isRecording) {
  //       const permission = await Audio.requestPermissionsAsync();

  //       if (!permission.granted) {
  //         alert("Microphone permission denied.");
  //         return;
  //       }

  //       await Audio.setAudioModeAsync({
  //         allowsRecordingIOS: true,
  //         playsInSilentModeIOS: true,
  //       });

  //       const { recording } = await Audio.Recording.createAsync(
  //         Audio.RecordingOptionsPresets.HIGH_QUALITY
  //       );

  //       setRecording(recording);
  //       setIsRecording(true);
  //     } else {
  //       await recording?.stopAndUnloadAsync();

  //       const uri = recording?.getURI();

  //       if (uri) {
  //         setAudioUri(uri);

  //         try {
  //           const response =
  //             await uploadVoiceTransaction(uri);

  //           alert("Voice transaction processed.");

  //           const data = response.data;

  //           setType(
  //             data.type === "expense"
  //               ? "expense"
  //               : "income"
  //           );

  //           setAmount(String(data.amount ?? ""));

  //           setCategory(data.category ?? "");

  //           setDescription(
  //             data.description ?? ""
  //           );

  //           setIsDeductible(
  //             data.tax_deductible ?? false
  //           );

  //           if (data.transaction_date) {
  //             setDate(
  //               new Date(data.transaction_date)
  //             );
  //           }
  //         } catch (error) {
  //           console.log(error);
  //           alert("Voice upload failed.");
  //         }
  //       }

  //       setRecording(null);
  //       setIsRecording(false);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const playRecording = async () => {
  //   if (!audioUri) return;

  //   if (sound) {
  //     await sound.unloadAsync();
  //   }

  //   const { sound: playback } = await Audio.Sound.createAsync({
  //     uri: audioUri,
  //   });

  //   setSound(playback);

  //   await playback.playAsync();
  // };

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

        <View style={{ marginLeft: 10 }}>
          <Text style={styles.title}>Log Transaction</Text>
          <Text style={styles.subtitle}>
            Record your income or expenses quickly.
          </Text>
        </View>
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
      <Dropdown
        style={styles.input}
        data={categories}
        labelField="label"
        valueField="value"
        placeholder="Select Category"
        value={category}
        onChange={(item) => setCategory(item.value)}
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
        {/* <View style={styles.attachButton}>

          {/* How to record? link */}
          {/* <TouchableOpacity
            style={styles.helpContainer}
            onPress={() => setShowVoiceHelp(true)}
          >
            <Text style={styles.helpText}>How to record?</Text>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#C44736"
            />
          </TouchableOpacity> */}

          {/* Mic button */}
          {/* <TouchableOpacity
            style={styles.voiceButton}
            onPress={toggleRecording}
          >
            <Ionicons
              name={isRecording ? "stop-circle-outline" : "mic-outline"}
              size={24}
              color={isRecording ? "#C44736" : "#111827"}
            />
            <Text
              style={[
                styles.attachText,
                { color: isRecording ? "#C44736" : "#111827" },
              ]}
            >
              {isRecording
                ? "Stop Recording"
                : audioUri
                ? "Voice Added ✓"
                : "Voice Log"}
            </Text>
          </TouchableOpacity>

        </View> */}

      </View>

      {/* Play Recording Button */}
      {/* {audioUri && !isRecording && (
        <TouchableOpacity
          style={styles.playButton}
          onPress={playRecording}
        >
          <Ionicons
            name="play-circle-outline"
            size={22}
            color="#C44736"
          />
          <Text style={styles.playText}>Play Recording</Text>
        </TouchableOpacity>
      )} */}

      {/* Save */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "Saving..." : "Save Transaction"}
        </Text>
      </TouchableOpacity>

      {/* Voice Help Popup */}
      {/* {showVoiceHelp && (
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
              • Good example:{"\n"}
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
      )} */}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
    paddingTop: 44,
  },
  header: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 32,
    padding: 5,
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
    fontSize: 32,
    color: "#C44736",
    marginRight: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 40,
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
    marginBottom: 16,
  },
  attachButton: {
    width: "48%",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 20,
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  attachText: {
    marginTop: 6,
    color: "#111827",
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FCE8E6",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 20,
  },
  playText: {
    marginLeft: 8,
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
  },
  saveButton: {
    backgroundColor: "#C44736",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
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
    fontSize: 11,
    marginRight: 4,
    fontFamily: "Inter_500Medium",
  },
  voiceButton: {
    alignItems: "center",
    marginTop: 12,
  },
});