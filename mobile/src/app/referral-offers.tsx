import React, {
  useMemo,
  useState,
} from "react";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTransactions } from "../context/TransactionContext";
import { useDeadlines } from "../context/DeadlineContext";
import { useUser } from "../context/UserContext";

type Offer = {
  id: number;
  title: string;
  subtitle: string;
  amount: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: "available" | "locked";
};

export default function ReferralOffersScreen() {
  const { user } = useUser();

  const { transactions } =
    useTransactions();

  const { deadlines } =
    useDeadlines();

  const [showPopup, setShowPopup] =
    useState(false);

  const [popupMessage, setPopupMessage] =
    useState("");

  const completedDeadlines =
    deadlines.filter(
      (d) => d.completed
    ).length;

  const compliant =
    deadlines.every(
      (d) => d.completed
    );

  const monthsOfRecords =
    Math.max(
      1,
      Math.ceil(
        transactions.length / 5
      )
    );

  const totalIncome =
    transactions
      .filter(
        (t) => t.type === "income"
      )
      .reduce(
        (sum, t) =>
          sum + t.amount,
        0
      );

  const consistencyScore =
    Math.min(
      100,
      Math.round(
        monthsOfRecords * 15 +
          completedDeadlines * 10 +
          transactions.length * 2
      )
    );

  const availableOffers =
    useMemo(() => {
      const offers: Offer[] = [];

      if (
        transactions.length >= 3
      ) {
        offers.push({
          id: 1,
          title: "Fido Instant Loan",
          subtitle:
            "Loan Offer",

          amount: `Up to GH¢ ${Math.max(
            1000,
            Math.round(
              totalIncome * 0.3
            )
          ).toLocaleString()}`,

          description:
            "Pre-qualified based on your transaction history.",

          icon: "cash-outline",

          type: "available",
        });
      }

      if (
        consistencyScore >= 40
      ) {
        offers.push({
          id: 2,
          title:
            "Acacia Insurance",

          subtitle:
            "Business Insurance",

          amount:
            "From GH¢ 48/month",

          description:
            "Protect your business assets and income.",

          icon:
            "shield-checkmark-outline",

          type: "available",
        });
      }

      return offers;
    }, [
      transactions,
      totalIncome,
      consistencyScore,
    ]);

  const lockedOffers =
    useMemo(() => {
      const offers: Offer[] = [];

      if (
        monthsOfRecords < 6 ||
        !compliant
      ) {
        offers.push({
          id: 3,
          title:
            "Premium Credit Line",

          subtitle:
            "Requires 6 months of records and full compliance.",

          amount: "",

          description: "",

          icon:
            "lock-closed-outline",

          type: "locked",
        });
      }

      return offers;
    }, [
      monthsOfRecords,
      compliant,
    ]);

  const handleApply = (
    offerName: string
  ) => {
    setPopupMessage(
      `Your application for ${offerName} has been submitted successfully.`
    );

    setShowPopup(true);
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: 50,
        }}
        showsVerticalScrollIndicator={
          false
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              router.back()
            }
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#111827"
            />
          </TouchableOpacity>

          <Text style={styles.title}>
            Referral Offers
          </Text>
        </View>

        <View style={styles.heroCard}>
          <Ionicons
            name="trophy-outline"
            size={32}
            color="#C44736"
          />

          <View
            style={{
              marginLeft: 14,
              flex: 1,
            }}
          >
            <Text
              style={styles.heroTitle}
            >
              You are eligible for{" "}
              {
                availableOffers.length
              }{" "}
              offer
              {availableOffers.length !==
              1
                ? "s"
                : ""}
              !
            </Text>

            <Text
              style={
                styles.heroSubtitle
              }
            >
              Based on your
              transaction and
              compliance history
            </Text>

            <Text
              style={styles.scoreText}
            >
              Consistency score:{" "}
              {consistencyScore}
              /100
            </Text>
          </View>
        </View>

        <Text
          style={styles.sectionTitle}
        >
          AVAILABLE OFFERS
        </Text>

        {availableOffers.length ===
        0 ? (
          <View
            style={styles.infoCard}
          >
            <Text
              style={styles.infoText}
            >
              Keep using
              TaxPadi to unlock
              referral offers.
            </Text>
          </View>
        ) : (
          availableOffers.map(
            (offer) => (
              <View
                key={offer.id}
                style={
                  styles.offerCard
                }
              >
                <View
                  style={
                    styles.offerHeader
                  }
                >
                  <Ionicons
                    name={offer.icon}
                    size={26}
                    color="#C44736"
                  />

                  <View
                    style={{
                      marginLeft: 12,
                      flex: 1,
                    }}
                  >
                    <Text
                      style={
                        styles.offerTitle
                      }
                    >
                      {offer.title}
                    </Text>

                    <Text
                      style={
                        styles.offerSubtitle
                      }
                    >
                      {
                        offer.subtitle
                      }
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.newBadge
                    }
                  >
                    ★ New
                  </Text>
                </View>

                <Text
                  style={
                    styles.offerAmount
                  }
                >
                  {offer.amount}
                </Text>

                <Text
                  style={
                    styles.offerDescription
                  }
                >
                  {
                    offer.description
                  }
                </Text>

                <TouchableOpacity
                  style={
                    styles.primaryButton
                  }
                  onPress={() =>
                    handleApply(
                      offer.title
                    )
                  }
                >
                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    Apply Now →
                  </Text>
                </TouchableOpacity>
              </View>
            )
          )
        )}

      </ScrollView>

      {showPopup && (
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={styles.modalCard}
          >
            <Ionicons
              name="checkmark-circle"
              size={70}
              color="#34A853"
            />

            <Text
              style={
                styles.modalTitle
              }
            >
              Application Submitted
            </Text>

            <Text
              style={
                styles.modalMessage
              }
            >
              {popupMessage}
            </Text>

            <TouchableOpacity
              style={
                styles.modalButton
              }
              onPress={() =>
                setShowPopup(false)
              }
            >
              <Text
                style={
                  styles.modalButtonText
                }
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
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
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    marginLeft: 10,
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  heroTitle: {
    color: "#111827",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },

  heroSubtitle: {
    color: "#6B7280",
    marginTop: 4,
    fontSize: 12,
  },

  scoreText: {
    color: "#C44736",
    marginTop: 6,
    fontFamily: "Inter_600SemiBold",
  },

  sectionTitle: {
    color: "#C44736",
    fontSize: 11,
    marginBottom: 12,
    fontFamily: "Inter_600SemiBold",
  },

  offerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },

  offerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  offerTitle: {
    color: "#111827",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },

  offerSubtitle: {
    color: "#6B7280",
    marginTop: 2,
    fontSize: 12,
  },

  newBadge: {
    color: "#C44736",
    fontSize: 12,
  },

  offerAmount: {
    marginTop: 18,
    color: "#111827",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },

  offerDescription: {
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 18,
    lineHeight: 20,
  },

  primaryButton: {
    backgroundColor: "#C44736",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
  },

  infoText: {
    color: "#6B7280",
    lineHeight: 20,
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 22,
    color: "#111827",
    marginTop: 16,
    fontFamily: "Inter_700Bold",
  },

  modalMessage: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },

  modalButton: {
    backgroundColor: "#C44736",
    borderRadius: 14,
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 24,
  },

  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});