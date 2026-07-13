import React from "react";
import { usePayments } from "../context/PaymentContext";
import { useTransactions } from "../context/TransactionContext";
import { useDeadlines } from "../context/DeadlineContext";
import { useNotifications } from "../context/NotificationContext";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Card from "../components/Card";

export default function DeadlinesScreen() {
  const { transactions } = useTransactions();
  const { payments } = usePayments();
  const { deadlines, toggleDeadline } = useDeadlines();
  

  // Financial calculations
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const payeDue = totalIncome * 0.055;

  // Overdue deadlines
  const overdueDeadlines = deadlines.filter(
    (deadline) =>
      !deadline.completed && new Date(deadline.dueDate) < new Date()
  );

  const lateFee = overdueDeadlines.length > 0 ? payeDue * 0.2 : 0;

  const totalPenalty = overdueDeadlines.length > 0 ? payeDue + lateFee : 0;

  // Days left
  const calculateDaysLeft = (date: string) => {
    const today = new Date();
    const difference = new Date(date).getTime() - today.getTime();
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  // Week strip
  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - 3 + index);

    return {
      day: date.getDate().toString(),
      week: date
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase(),
      active: date.toDateString() === new Date().toDateString(),
    };
  });

  // Complete deadline
  const handleDeadlinePress = (
    id: number,
    title: string,
    completed: boolean
  ) => {
    toggleDeadline(id);

  
  };

  // Penalty payment
  const handlePayPenalty = () => {
    if (totalPenalty <= 0) {
      Alert.alert(
        "No Penalties",
        "You currently have no penalties to pay."
      );
      return;
    }

    Alert.alert(
      "Redirecting",
      "You will be redirected to the Payments screen."
    );

    router.push("/payments");
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/dashboard");
            }
          }}
        >
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.title}>Deadlines</Text>
      </View>

      <Text style={styles.subtitle}>
        Keep track of filing deadlines and avoid penalties.
      </Text>

      {/* Week Strip */}
      <View style={styles.dateContainer}>
        {dates.map((item) => (
          <View
            key={`${item.day}${item.week}`}
            style={[
              styles.dateCard,
              item.active && styles.activeDateCard,
            ]}
          >
            <Text
              style={[
                styles.dateNumber,
                item.active && styles.activeDateText,
              ]}
            >
              {item.day}
            </Text>

            <Text
              style={[
                styles.dateWeek,
                item.active && styles.activeDateText,
              ]}
            >
              {item.week}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>UPCOMING DEADLINES</Text>

      {deadlines.length === 0 ? (
        <Card style={styles.emptyStateCard}>
          <Ionicons
            name="calendar-outline"
            size={48}
            color="#9CA3AF"
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.emptyStateTitle}>No Deadlines</Text>
          <Text style={styles.emptyStateSubtitle}>
            You're all caught up.
          </Text>
        </Card>
      ) : (
        deadlines.map((item) => {
          const daysLeft = calculateDaysLeft(item.dueDate);

          return (
            <Card key={item.id} style={styles.card}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  handleDeadlinePress(item.id, item.title, item.completed)
                }
                style={styles.cardContent}
              >
                <View style={styles.leftSection}>
                  <View style={styles.calendarIcon}>
                    <Ionicons
                      name="calendar-outline"
                      size={22}
                      color="#C44736"
                    />
                  </View>

                  <View>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.subText}>{item.authority}</Text>
                    <Text style={styles.dateText}>
                      {new Date(item.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {item.completed ? (
                  <View style={styles.greenBadge}>
                    <Text style={styles.badgeText}>✓ Completed</Text>
                  </View>
                ) : daysLeft >= 0 ? (
                  <View style={styles.greenBadge}>
                    <Text style={styles.badgeText}>Upcoming</Text>
                    <Text style={[styles.badgeText, { fontSize: 10, textAlign: 'center' }]}>
                      {daysLeft} days left
                    </Text>
                  </View>
                ) : (
                  <View style={styles.redBadge}>
                    <Text style={styles.redBadgeText}>⚠ Overdue</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Card>
          );
        })
      )}

      <Text style={styles.sectionTitle}>OUTSTANDING PENALTIES</Text>

      {totalPenalty > 0 ? (
        <>
          <View style={styles.penaltyCard}>
            <View style={styles.penaltyHeaderRow}>
              <Ionicons
                name="warning-outline"
                size={20}
                color="#C44736"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.penaltyTitle}>Late Filing Penalty</Text>
            </View>

            <Text style={styles.penaltyInfo}>
              Original: GH¢ {payeDue.toFixed(2)}
              {"\n"}
              Late Fee: GH¢ {lateFee.toFixed(2)}
            </Text>

            <View style={styles.penaltyRow}>
              <Text style={styles.totalLabel}>Total Due</Text>
              <Text style={styles.totalAmount}>
                GH¢ {totalPenalty.toFixed(2)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.payButton}
            onPress={handlePayPenalty}
          >
            <Text style={styles.payButtonText}>Pay Penalties</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.penaltyCard}>
          <Text style={styles.penaltyInfo}>No outstanding penalties.</Text>
        </View>
      )}

      <Text style={styles.footerText}>
        Filing on time saves you from penalties and surcharges.
      </Text>
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
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    marginLeft: 10,
    color: "#111827",
  },

  subtitle: {
    color: "#6B7280",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginTop: -16,
    marginBottom: 28,
  },

  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  dateCard: {
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
  },

  activeDateCard: {
    backgroundColor: "#C44736",
    width: 46,
    height: 58,
    justifyContent: "center",
  },

  dateNumber: {
    fontSize: 18,
    color: "#444",
  },

  dateWeek: {
    fontSize: 10,
    color: "#888",
  },

  activeDateText: {
    color: "#FFFFFF",
  },

  sectionTitle: {
    fontSize: 11,
    color: "#C44736",
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
    marginTop: 10,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#111827",
  },

  subText: {
    color: "#888",
    fontSize: 12,
    marginTop: 3,
  },

  dateText: {
    color: "#555",
    marginTop: 6,
  },

  greenBadge: {
    backgroundColor: "#DFF5E7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#34A853",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  redBadge: {
    backgroundColor: "#FCE8E6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  redBadgeText: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },

  penaltyCard: {
    backgroundColor: "#FFF8F6",
    borderWidth: 1,
    borderColor: "#F4D7D2",
    borderRadius: 18,
    padding: 20,
    marginTop: 10,
  },

  penaltyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  penaltyTitle: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
  },

  penaltyInfo: {
    color: "#666",
    marginBottom: 12,
  },

  penaltyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontFamily: "Inter_600SemiBold",
  },

  totalAmount: {
    color: "#C44736",
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },

  payButton: {
    backgroundColor: "#C44736",
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },

  payButtonText: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },

  footerText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 18,
    marginBottom: 10,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },

  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  calendarIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FCE8E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  emptyStateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ECECEC",
  },

  emptyStateTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginBottom: 4,
  },

  emptyStateSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
  },
});