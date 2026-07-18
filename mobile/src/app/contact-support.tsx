// =============================================================================
// PLACEHOLDER: Replace "support@taxpadi.com" with your verified support email
// address before launch. If you add a backend /support/contact endpoint, wire
// the handleSubmit function to it instead of the local success state.
// =============================================================================

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const SUPPORT_EMAIL = "sitso.nkrumah@gmail.com";

export default function ContactSupportScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  const openEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=TaxPadi Support Request`);
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Please enter your name.";
    if (!email.trim()) {
      newErrors.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!message.trim()) newErrors.message = "Please write your message.";
    else if (message.trim().length < 10) newErrors.message = "Message must be at least 10 characters.";
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    // PLACEHOLDER: Replace with an API call to your support endpoint, e.g.:
    // await client.post("/api/v1/support/contact", { name, email, message });
    setSubmitted(true);
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setMessage("");
    setSubmitted(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Support</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Direct email button */}
          <TouchableOpacity style={styles.emailCard} onPress={openEmail} activeOpacity={0.85}>
            <View style={styles.emailIconBox}>
              <Ionicons name="mail-outline" size={22} color="#C44736" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.emailTitle}>Email Us Directly</Text>
              <Text style={styles.emailAddress}>{SUPPORT_EMAIL}</Text>
            </View>
            <Ionicons name="open-outline" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or send a message below</Text>
            <View style={styles.dividerLine} />
          </View>

          {submitted ? (
            <View style={styles.successCard}>
              <View style={styles.successIconBox}>
                <Ionicons name="checkmark" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>Message Received</Text>
              <Text style={styles.successBody}>
                Thank you for reaching out. Our support team will get back to you at {email} within 1–2 business days.
              </Text>
              <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.85}>
                <Text style={styles.resetBtnText}>Send Another Message</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Send a Message</Text>
              <Text style={styles.formSub}>
                Describe your issue and we'll respond as quickly as we can.
              </Text>

              <Text style={styles.fieldLabel}>YOUR NAME</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="e.g. Kofi Mensah"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={(t) => { setName(t); if (errors.name) setErrors((e) => ({ ...e, name: undefined })); }}
              />
              {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}

              <Text style={styles.fieldLabel}>YOUR EMAIL</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="you@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => { setEmail(t); if (errors.email) setErrors((e) => ({ ...e, email: undefined })); }}
              />
              {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}

              <Text style={styles.fieldLabel}>MESSAGE</Text>
              <TextInput
                style={[styles.textArea, errors.message && styles.inputError]}
                placeholder="Describe your issue in detail…"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={message}
                onChangeText={(t) => { setMessage(t); if (errors.message) setErrors((e) => ({ ...e, message: undefined })); }}
              />
              {errors.message ? <Text style={styles.fieldError}>{errors.message}</Text> : null}

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
                <Ionicons name="send-outline" size={16} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.hoursCard}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.hoursText}>
              Support hours: Monday – Friday, 8 AM – 5 PM GMT. 
              We will most likely respond in a space of 24 hours.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2EDE8" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },

  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },

  // Email card
  emailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#FDECEC",
    shadowColor: "#C44736",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  emailIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
  },

  emailTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginBottom: 2,
  },

  emailAddress: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#C44736",
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  dividerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },

  // Form card
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  formTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 4,
  },

  formSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginBottom: 18,
    lineHeight: 19,
  },

  fieldLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#C44736",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 4,
  },

  input: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },

  textArea: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
    minHeight: 120,
  },

  inputError: {
    borderColor: "#EF4444",
  },

  fieldError: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#EF4444",
    marginTop: 2,
    marginBottom: 6,
  },

  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: "#C44736",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },

  // Success state
  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  successIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#C44736",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  successTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 10,
  },

  successBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },

  resetBtn: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },

  resetBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#374151",
  },

  // Hours note
  hoursCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
  },

  hoursText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    lineHeight: 18,
  },
});
