import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAudioRecorder, useAudioPlayer, useAudioPlayerStatus, AudioModule, RecordingPresets } from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { getUserFriendlyError } from "@/utils/error";
import BottomSheet from "@/components/BottomSheet";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "@/context/ToastContext";
import { useNetwork } from "@/context/NetworkContext";
import OfflineFormNotice from "@/components/OfflineFormNotice";

import {
  uploadVoiceTransaction,
  scanReceiptTransaction,
  createTransaction,
} from "@/services/transaction.service";
import { useTransactions } from "../../context/TransactionContext";

const WAVE_BAR_PEAKS = [18, 34, 26, 44, 30, 22, 40];
const WAVE_BAR_DURATIONS = [380, 340, 490, 310, 440, 370, 410];

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
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { refreshTransactions } = useTransactions();
  const insets = useSafeAreaInsets();

  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isDeductible, setIsDeductible] = useState(false);
  const [withholdingApplicable, setWithholdingApplicable] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { isOnline } = useNetwork();
  const [scanning, setScanning] = useState(false);
  const [errors, setErrors] = useState<{amount?: string; category?: string; description?: string}>({});

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [showScanHelp, setShowScanHelp] = useState(false);
  const [pendingAudioUri, setPendingAudioUri] = useState<string | null>(null);
  const [showVoiceReview, setShowVoiceReview] = useState(false);
  const [pendingReceiptUri, setPendingReceiptUri] = useState<string | null>(null);
  const [pendingReceiptBase64, setPendingReceiptBase64] = useState<string | null>(null);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [audioPlaybackUri, setAudioPlaybackUri] = useState<string | null>(null);
  const player = useAudioPlayer(audioPlaybackUri);
  const playerStatus = useAudioPlayerStatus(player);

  // Waveform bar animations for recording overlay
  const waveBarAnims = useRef(WAVE_BAR_PEAKS.map(() => new Animated.Value(8))).current;

  useEffect(() => {
    if (isRecording) {
      const loops = waveBarAnims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: WAVE_BAR_PEAKS[i], duration: WAVE_BAR_DURATIONS[i], useNativeDriver: false }),
            Animated.timing(anim, { toValue: 6, duration: WAVE_BAR_DURATIONS[i], useNativeDriver: false }),
          ])
        )
      );
      loops.forEach((l) => l.start());
      return () => {
        loops.forEach((l) => l.stop());
        waveBarAnims.forEach((a) => a.setValue(8));
      };
    }
  }, [isRecording]);

  // Auto-start voice mode if launched with ?mode=voice
  useEffect(() => {
    if (mode === "voice") {
      toggleRecording();
    }
  }, []);

  // Reset form every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setType("income");
      setAmount("");
      setCategory("");
      setDescription("");
      setIsDeductible(false);
      setWithholdingApplicable(false);
      setDate(new Date());
      setReceiptUri(null);
      setAudioUri(null);
      setErrors({});
      setPendingAudioUri(null);
      setAudioPlaybackUri(null);
      setShowVoiceReview(false);
      setPendingReceiptUri(null);
      setPendingReceiptBase64(null);
      setShowReceiptPreview(false);
    }, [])
  );

  const handleSave = async () => {
    if (!isOnline) {
      showToast("You're offline. Connect to the internet to save this transaction.", "info");
      return;
    }
    if (loading) return;

    const newErrors: {amount?: string; category?: string; description?: string} = {};
    if (!amount.trim() || Number(amount) <= 0) newErrors.amount = "Enter an amount greater than zero.";
    if (!category) newErrors.category = "Select a category.";
    if (!description.trim()) newErrors.description = "Enter a description.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
        withholding_applicable: withholdingApplicable,
        description,
      });

      await refreshTransactions();
      router.replace("/(tabs)/transactions");
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const scanReceipt = async () => {
    if (!isOnline) {
      showToast("You're offline. Receipt scanning requires an internet connection.", "info");
      return;
    }
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.5,
        base64: true,
      });

      if (result.canceled || !result.assets[0].base64) return;

      setPendingReceiptUri(result.assets[0].uri);
      setPendingReceiptBase64(result.assets[0].base64);
      setShowReceiptPreview(true);
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    }
  };

  const toggleRecording = async () => {
    try {
      if (!isRecording) {
        const permission = await AudioModule.requestRecordingPermissionsAsync();
        if (!permission.granted) {
          showToast("Microphone permission is required for voice logging.", "error");
          return;
        }

        try {
          await AudioModule.setAudioModeAsync({
            allowsRecording: true,
            playsInSilentMode: true,
          });
        } catch {
          // non-fatal — silent mode toggle not critical on all platforms
        }

        await audioRecorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
        audioRecorder.record();
        setIsRecording(true);
      } else {
        await audioRecorder.stop();
        const uri = audioRecorder.uri;
        setIsRecording(false);

        if (uri) {
          setPendingAudioUri(uri);
          setAudioPlaybackUri(uri);
          setShowVoiceReview(true);
        }
      }
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    }
  };

  const handlePlayPause = () => {
    if (playerStatus.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const confirmVoice = async () => {
    if (!pendingAudioUri || loading) return;
    setLoading(true);
    try {
      player.pause();
      const response = await uploadVoiceTransaction(pendingAudioUri);
      const data = response.data;
      setType(data.type === "expense" ? "expense" : "income");
      setAmount(String(data.amount ?? ""));
      setCategory(data.category ?? "");
      setDescription(data.description ?? "");
      setIsDeductible(data.tax_deductible ?? false);
      setWithholdingApplicable(data.withholding_applicable ?? false);
      if (data.transaction_date) setDate(new Date(data.transaction_date));
      setAudioUri(pendingAudioUri);
      setPendingAudioUri(null);
      setAudioPlaybackUri(null);
      setShowVoiceReview(false);
      showToast("Fields filled from your recording.", "success");
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const discardVoice = () => {
    player.pause();
    setPendingAudioUri(null);
    setAudioPlaybackUri(null);
    setShowVoiceReview(false);
  };

  const confirmScan = async () => {
    if (!pendingReceiptBase64 || scanning) return;
    setScanning(true);
    try {
      const response = await scanReceiptTransaction(pendingReceiptBase64, type);
      const data = response.data;
      setAmount(String(data.amount ?? ""));
      setCategory(data.category ?? "");
      setDescription(data.description ?? "");
      if (data.transaction_date) setDate(new Date(data.transaction_date));
      setReceiptUri(pendingReceiptUri);
      setPendingReceiptUri(null);
      setPendingReceiptBase64(null);
      setShowReceiptPreview(false);
      showToast("Fields filled from receipt.", "success");
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setScanning(false);
    }
  };

  const discardScan = () => {
    setPendingReceiptUri(null);
    setPendingReceiptBase64(null);
    setShowReceiptPreview(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F2EDE8" }}
      behavior="padding"
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <OfflineFormNotice />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
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
            style={[styles.toggleButton, type === "income" && styles.selectedToggle]}
            onPress={() => setType("income")}
          >
            <Text style={[styles.toggleText, type === "income" && styles.selectedToggleText]}>
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, type === "expense" && styles.selectedToggle]}
            onPress={() => setType("expense")}
          >
            <Text style={[styles.toggleText, type === "expense" && styles.selectedToggleText]}>
              Expense
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <Text style={styles.label}>AMOUNT (GHS)</Text>
        <View style={[styles.inputCard, errors.amount && styles.inputError, !!errors.amount && { marginBottom: 4 }]}>
          <Text style={styles.currency}>GH₵</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={amount}
            onChangeText={(text) => { setAmount(text); if (errors.amount) setErrors(e => ({ ...e, amount: undefined })); }}
          />
        </View>
        {errors.amount ? <Text style={styles.fieldError}>{errors.amount}</Text> : null}

        {/* Category */}
        <Text style={styles.label}>CATEGORY</Text>
        <Dropdown
          style={[styles.input, errors.category && styles.inputError, !!errors.category && { marginBottom: 4 }]}
          data={categories}
          labelField="label"
          valueField="value"
          placeholder="Select Category"
          placeholderStyle={styles.dropdownPlaceholder}
          selectedTextStyle={styles.dropdownSelected}
          itemTextStyle={styles.dropdownSelected}
          containerStyle={styles.dropdownContainer}
          activeColor="#F2EDE8"
          iconColor="#9CA3AF"
          value={category}
          onChange={(item) => { setCategory(item.value); if (errors.category) setErrors(e => ({ ...e, category: undefined })); }}
        />
        {errors.category ? <Text style={styles.fieldError}>{errors.category}</Text> : null}

        {/* Description */}
        <Text style={styles.label}>DESCRIPTION</Text>
        <TextInput
          style={[styles.descriptionInput, errors.description && styles.inputError, !!errors.description && { marginBottom: 4 }]}
          placeholder="What was this for?"
          placeholderTextColor="#9CA3AF"
          multiline
          value={description}
          onChangeText={(text) => { setDescription(text); if (errors.description) setErrors(e => ({ ...e, description: undefined })); }}
        />
        {errors.description ? <Text style={styles.fieldError}>{errors.description}</Text> : null}

        {/* Date */}
        <Text style={styles.label}>DATE</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: "#6B7280", fontFamily: "Inter_400Regular" }}>
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
        <TouchableOpacity
          style={[styles.checkRow, isDeductible && styles.checkRowActive]}
          onPress={() => setIsDeductible(!isDeductible)}
          activeOpacity={0.7}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Tax Deductible</Text>
            <Text style={styles.switchSubtitle}>Reduces your tax liability</Text>
          </View>
          <View style={[styles.checkbox, isDeductible && styles.checkboxActive]}>
            {isDeductible && (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            )}
          </View>
        </TouchableOpacity>

        {/* Withholding Tax */}
        <TouchableOpacity
          style={[styles.checkRow, withholdingApplicable && styles.checkRowActive]}
          onPress={() => setWithholdingApplicable(!withholdingApplicable)}
          activeOpacity={0.7}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Withholding Tax Applicable</Text>
            <Text style={styles.switchSubtitle}>Subject to WHT deduction</Text>
          </View>
          <View style={[styles.checkbox, withholdingApplicable && styles.checkboxActive]}>
            {withholdingApplicable && (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            )}
          </View>
        </TouchableOpacity>

        {/* Attach */}
        <Text style={styles.label}>ATTACH</Text>
        <View style={styles.attachContainer}>
          {/* Scan Receipt */}
          <View style={styles.attachButton}>
            <TouchableOpacity
              style={styles.helpContainer}
              onPress={() => setShowScanHelp(true)}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Ionicons name="information-circle-outline" size={16} color="#C44736" />
            </TouchableOpacity>
            <TouchableOpacity onPress={scanReceipt} style={{ alignItems: "center" }}>
              <Ionicons name="camera-outline" size={24} color={scanning ? "#C44736" : "#111827"} />
              <Text style={[styles.attachText, scanning && { color: "#C44736" }]}>
                {scanning ? "Scanning..." : receiptUri ? "Receipt Added ✓" : "Scan Receipt"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Voice Log */}
          <View style={[styles.attachButton, isRecording && styles.recordingButton]}>
            <TouchableOpacity
              style={styles.helpContainer}
              onPress={() => setShowVoiceHelp(true)}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Ionicons name="information-circle-outline" size={16} color="#C44736" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleRecording} style={{ alignItems: "center" }}>
              <Ionicons
                name={isRecording ? "stop-circle-outline" : "mic-outline"}
                size={24}
                color={isRecording ? "#C44736" : "#111827"}
              />
              <Text style={[styles.attachText, isRecording && { color: "#C44736" }]}>
                {isRecording ? "Stop Recording" : audioUri ? "Voice Added ✓" : "Voice Log"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Sticky footer — always visible above tab bar and keyboard */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.saveButton, loading && { opacity: 0.7 }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {loading ? "Saving..." : "Save Transaction"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Voice Help Tooltip */}
      <BottomSheet visible={showVoiceHelp} onClose={() => setShowVoiceHelp(false)}>
        <View style={styles.tooltipContent}>
          <View style={styles.tooltipHeaderRow}>
            <View style={styles.tooltipIconBox}>
              <Ionicons name="mic-outline" size={18} color="#C44736" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.tooltipTitle}>Voice Log Tips</Text>
              <Text style={styles.tooltipSub}>Speak clearly for best results</Text>
            </View>
          </View>

          {[
            { icon: "person-outline", text: "Record one transaction at a time" },
            { icon: "chatbubble-outline", text: 'Start with "I spent…" or "I received…"' },
            { icon: "cash-outline", text: "Say the amount clearly in cedis" },
            { icon: "timer-outline", text: "Keep it under 15 seconds" },
          ].map((tip, i) => (
            <View key={i} style={styles.tooltipTipRow}>
              <Ionicons name={tip.icon as any} size={14} color="#C44736" />
              <Text style={styles.tooltipTipText}>{tip.text}</Text>
            </View>
          ))}

          <View style={styles.tooltipExample}>
            <Text style={styles.tooltipExampleLabel}>Example</Text>
            <Text style={styles.tooltipExampleText}>
              "I spent 500 cedis on groceries today"
            </Text>
          </View>

          <TouchableOpacity
            style={styles.tooltipBtn}
            onPress={() => setShowVoiceHelp(false)}
          >
            <Text style={styles.tooltipBtnText}>Got It</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Scan Receipt Tooltip */}
      <BottomSheet visible={showScanHelp} onClose={() => setShowScanHelp(false)}>
        <View style={styles.tooltipContent}>
          <View style={styles.tooltipHeaderRow}>
            <View style={styles.tooltipIconBox}>
              <Ionicons name="camera-outline" size={18} color="#C44736" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.tooltipTitle}>Receipt Scan Tips</Text>
              <Text style={styles.tooltipSub}>Get the best results from scanning</Text>
            </View>
          </View>

          {[
            { icon: "sunny-outline", text: "Use good lighting — avoid shadows" },
            { icon: "expand-outline", text: "Fit the whole receipt in frame" },
            { icon: "hand-left-outline", text: "Hold steady to avoid blurring" },
            { icon: "document-outline", text: "Works best on printed receipts" },
          ].map((tip, i) => (
            <View key={i} style={styles.tooltipTipRow}>
              <Ionicons name={tip.icon as any} size={14} color="#C44736" />
              <Text style={styles.tooltipTipText}>{tip.text}</Text>
            </View>
          ))}

          <View style={styles.tooltipExample}>
            <Text style={styles.tooltipExampleLabel}>What gets extracted</Text>
            <Text style={styles.tooltipExampleText}>
              Amount, description, date, and category are auto-filled from your receipt.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.tooltipBtn}
            onPress={() => setShowScanHelp(false)}
          >
            <Text style={styles.tooltipBtnText}>Got It</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Voice Scanning Overlay */}
      <Modal
        visible={isRecording}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.scanOverlay}>
          <View style={styles.scanMicCircle}>
            <Ionicons name="mic" size={34} color="#FFFFFF" />
          </View>

          {/* Live waveform */}
          <View style={styles.waveformRow}>
            {waveBarAnims.map((anim, i) => (
              <Animated.View
                key={i}
                style={{ width: 4, height: anim, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.85)" }}
              />
            ))}
          </View>

          <Text style={styles.scanListening}>Listening…</Text>
          <Text style={styles.scanHint}>
            "I spent 120 cedis on transport today"
          </Text>
          <TouchableOpacity style={styles.scanStopBtn} onPress={toggleRecording} activeOpacity={0.85}>
            <Ionicons name="stop-circle-outline" size={18} color="#C44736" />
            <Text style={styles.scanStopText}>Stop Recording</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* Voice Review */}
      <BottomSheet visible={showVoiceReview} onClose={discardVoice}>
        <View style={styles.tooltipContent}>
          <View style={styles.tooltipHeaderRow}>
            <View style={styles.tooltipIconBox}>
              <Ionicons name="mic" size={18} color="#C44736" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.tooltipTitle}>Review Recording</Text>
              <Text style={styles.tooltipSub}>Listen before logging this transaction</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.playbackRow} onPress={handlePlayPause} activeOpacity={0.8}>
            <View style={styles.playIconBox}>
              <Ionicons name={playerStatus.playing ? "pause" : "play"} size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.playbackLabel}>{playerStatus.playing ? "Playing…" : "Tap to play"}</Text>
              <Text style={styles.playbackSub}>
                {playerStatus.duration > 0
                  ? `${Math.floor(playerStatus.currentTime)}s / ${Math.floor(playerStatus.duration)}s`
                  : "Your voice recording"}
              </Text>
            </View>
            <Ionicons name="volume-medium-outline" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={styles.discardBtn} onPress={discardVoice} activeOpacity={0.85}>
              <Text style={styles.discardBtnText}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tooltipBtn, { flex: 1 }]}
              onPress={confirmVoice}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.tooltipBtnText}>{loading ? "Processing…" : "Confirm & Log"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>

      {/* Receipt Preview */}
      <Modal
        visible={showReceiptPreview}
        transparent
        animationType="slide"
        onRequestClose={discardScan}
      >
        <View style={styles.receiptPreviewOverlay}>
          <View style={styles.receiptPreviewCard}>
            <Text style={styles.receiptPreviewTitle}>Review Receipt</Text>
            <Text style={styles.receiptPreviewSub}>Does this look clear enough to scan?</Text>
            {pendingReceiptUri && (
              <Image
                source={{ uri: pendingReceiptUri }}
                style={styles.receiptPreviewImage}
                resizeMode="contain"
              />
            )}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={styles.discardBtn} onPress={discardScan} activeOpacity={0.85}>
                <Text style={styles.discardBtnText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tooltipBtn, { flex: 1 }]}
                onPress={confirmScan}
                disabled={scanning}
                activeOpacity={0.85}
              >
                <Text style={styles.tooltipBtnText}>{scanning ? "Scanning…" : "Scan This Receipt"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EDE8",
    paddingHorizontal: 16,
    paddingTop: 30,
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
    marginTop:20
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#EDE8E3",
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
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  toggleText: {
    color: "#9CA3AF",
    fontFamily: "Inter_500Medium",
  },
  selectedToggleText: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },
  label: {
    color: "#C44736",
    fontSize: 11,
    marginBottom: 8,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  inputCard: {
    backgroundColor: "#EDE8E3",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  currency: {
    fontSize: 18,
    marginRight: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#6B7280",
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    ...(Platform.OS === "web" ? { outlineWidth: 0 } : {}),
  },
  input: {
    backgroundColor: "#EDE8E3",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  dropdownPlaceholder: {
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  dropdownSelected: {
    color: "#111827",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  dropdownContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: "hidden",
    marginTop: 2,
  },
  descriptionInput: {
    backgroundColor: "#EDE8E3",
    borderRadius: 16,
    padding: 16,
    minHeight: 90,
    textAlignVertical: "top",
    marginBottom: 16,
    fontFamily: "Inter_400Regular",
  },
  checkRow: {
    backgroundColor: "#EDE8E3",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  checkRowActive: {
    backgroundColor: "#FDF0EE",
    borderColor: "#C44736",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#C4B5B0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  checkboxActive: {
    backgroundColor: "#C44736",
    borderColor: "#C44736",
  },
  switchTitle: {
    fontFamily: "Inter_500Medium",
    color: "#374151",
    fontSize: 14,
  },
  switchSubtitle: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 3,
    fontFamily: "Inter_400Regular",
  },
  attachContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  attachButton: {
    width: "48%",
    backgroundColor: "#EDE8E3",
    borderRadius: 12,
    paddingVertical: 16,
    minHeight: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  recordingButton: {
    borderWidth: 2,
    borderColor: "#C44736",
    backgroundColor: "#FCE8E6",
  },
  attachText: {
    marginTop: 6,
    color: "#111827",
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    fontSize: 12,
  },
  helpContainer: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#F2EDE8",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E3D9D0",
  },
  saveButton: {
    backgroundColor: "#C44736",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  tooltipContent: {
    paddingHorizontal: 22,
    paddingBottom: 32,
  },
  tooltipHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  tooltipIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
  },
  tooltipTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  tooltipSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    marginTop: 1,
  },
  tooltipTipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tooltipTipText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#374151",
  },
  tooltipExample: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    marginBottom: 18,
  },
  tooltipExampleLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#C44736",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tooltipExampleText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#374151",
    fontStyle: "italic",
  },
  tooltipBtn: {
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#C44736",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  tooltipBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },

  // Voice scanning overlay
  scanOverlay: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.92)",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  waveformRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 5,
    height: 52,
  },
  scanMicCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#C44736",
    shadowOpacity: 0.55,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  scanListening: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginTop: 8,
  },
  scanHint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  scanStopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 12,
    marginTop: 8,
  },
  scanStopText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#C44736",
  },
  // Voice review
  playbackRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 14,
  },
  playIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
  },
  playbackLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
  },
  playbackSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    marginTop: 2,
  },
  discardBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#EDE8E3",
    alignItems: "center",
    justifyContent: "center",
  },
  discardBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#374151",
  },

  // Receipt preview
  receiptPreviewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  receiptPreviewCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: 36,
  },
  receiptPreviewTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 4,
  },
  receiptPreviewSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginBottom: 14,
  },
  receiptPreviewImage: {
    width: "100%",
    height: 260,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },

  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: "#EF4444",
  },
});
