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

export default function DeadlinesScreen() {
  const { transactions } =
    useTransactions();

  const { payments } =
    usePayments();

  const {
    deadlines,
    toggleDeadline,
  } = useDeadlines();

  const { addNotification } =
    useNotifications();

  // Financial calculations

  const totalIncome =
    transactions
      .filter(
        (t) => t.type === "income"
      )
      .reduce(
        (sum, t) => sum + t.amount,
        0
      );

  const totalPayments =
    payments.reduce(
      (sum, payment) =>
        sum + payment.amount,
      0
    );

  const payeDue =
    totalIncome * 0.055;

  // Overdue deadlines

  const overdueDeadlines =
    deadlines.filter(
      (deadline) =>
        !deadline.completed &&
        new Date(deadline.dueDate) <
          new Date()
    );

  const lateFee =
    overdueDeadlines.length > 0
      ? payeDue * 0.2
      : 0;

  const totalPenalty =
    overdueDeadlines.length > 0
      ? payeDue + lateFee
      : 0;

  // Days left

  const calculateDaysLeft = (
    date: string
  ) => {
    const today = new Date();

    const difference =
      new Date(date).getTime() -
      today.getTime();

    return Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );
  };

  // Week strip

  const dates = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date();

      date.setDate(
        date.getDate() - 3 + index
      );

      return {
        day: date
          .getDate()
          .toString(),

        week:
          date
            .toLocaleDateString(
              "en-US",
              {
                weekday: "short",
              }
            )
            .toUpperCase(),

        active:
          date.toDateString() ===
          new Date().toDateString(),
      };
    }
  );

  // Complete deadline

  const handleDeadlinePress = (
    id: number,
    title: string,
    completed: boolean
  ) => {
    toggleDeadline(id);

    addNotification(
      completed
        ? "Deadline Reopened"
        : "Deadline Completed",

      completed
        ? `${title} has been reopened.`
        : `${title} marked as completed.`
    );
  };

  // Penalty payment

  const handlePayPenalty =
    () => {
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
      showsVerticalScrollIndicator={
        false
      }
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >
      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (
              router.canGoBack()
            ) {
              router.back();
            } else {
              router.replace(
                "/dashboard"
              );
            }
          }}
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color="#111827"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Deadlines
        </Text>
      </View>

      {/* Week Strip */}

      <View
        style={styles.dateContainer}
      >
        {dates.map((item) => (
          <View
            key={`${item.day}${item.week}`}
            style={[
              styles.dateCard,

              item.active &&
                styles.activeDateCard,
            ]}
          >
            <Text
              style={[
                styles.dateNumber,

                item.active &&
                  styles.activeDateText,
              ]}
            >
              {item.day}
            </Text>

            <Text
              style={[
                styles.dateWeek,

                item.active &&
                  styles.activeDateText,
              ]}
            >
              {item.week}
            </Text>
          </View>
        ))}
      </View>

      <Text
        style={styles.sectionTitle}
      >
        UPCOMING DEADLINES
      </Text>

      {deadlines.length === 0 ? (
        <View style={styles.card}>
          <Text>
            No deadlines available.
          </Text>
        </View>
      ) : (
        deadlines.map((item) => {
          const daysLeft =
            calculateDaysLeft(
              item.dueDate
            );

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={styles.card}
              onPress={() =>
                handleDeadlinePress(
                  item.id,
                  item.title,
                  item.completed
                )
              }
            >
              <View>
                <Text
                  style={
                    styles.cardTitle
                  }
                >
                  {item.title}
                </Text>

                <Text
                  style={
                    styles.subText
                  }
                >
                  {item.authority}
                </Text>

                <Text
                  style={
                    styles.dateText
                  }
                >
                  {new Date(
                    item.dueDate
                  ).toLocaleDateString()}
                </Text>
              </View>

              {item.completed ? (
                <View
                  style={
                    styles.greenBadge
                  }
                >
                  <Text
                    style={
                      styles.badgeText
                    }
                  >
                    Completed
                  </Text>
                </View>
              ) : daysLeft >=
                0 ? (
                <View
                  style={
                    styles.greenBadge
                  }
                >
                  <Text
                    style={
                      styles.badgeText
                    }
                  >
                    {daysLeft} days
                  </Text>
                </View>
              ) : (
                <View
                  style={
                    styles.redBadge
                  }
                >
                  <Text
                    style={
                      styles.redBadgeText
                    }
                  >
                    Overdue
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })
      )}

      <Text
        style={styles.sectionTitle}
      >
        OUTSTANDING PENALTIES
      </Text>

      {totalPenalty > 0 ? (
        <>
          <View
            style={
              styles.penaltyCard
            }
          >
            <Text
              style={
                styles.penaltyTitle
              }
            >
              ⚠ Late Filing
              Penalty
            </Text>

            <Text
              style={
                styles.penaltyInfo
              }
            >
              Original:
              GH¢{" "}
              {payeDue.toFixed(
                2
              )}
              {"\n"}
              Late Fee:
              GH¢{" "}
              {lateFee.toFixed(
                2
              )}
            </Text>

            <View
              style={
                styles.penaltyRow
              }
            >
              <Text
                style={
                  styles.totalLabel
                }
              >
                Total Due
              </Text>

              <Text
                style={
                  styles.totalAmount
                }
              >
                GH¢{" "}
                {totalPenalty.toFixed(
                  2
                )}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={
              styles.payButton
            }
            onPress={
              handlePayPenalty
            }
          >
            <Text
              style={
                styles.payButtonText
              }
            >
              Pay Penalties
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View
          style={
            styles.penaltyCard
          }
        >
          <Text
            style={
              styles.penaltyInfo
            }
          >
            No outstanding
            penalties.
          </Text>
        </View>
      )}

      <Text
        style={styles.footerText}
      >
        Filing on time saves
        you from penalties and
        surcharges.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      "#FAFAFA",
    paddingHorizontal: 20,
    paddingTop: 55,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontFamily:
      "Inter_700Bold",
    marginLeft: 10,
  },

  dateContainer: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginBottom: 25,
  },

  dateCard: {
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
  },

  activeDateCard: {
    backgroundColor:
      "#C44736",
    width: 42,
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
    fontFamily:
      "Inter_700Bold",
    marginBottom: 10,
    marginTop: 10,
  },

  card: {
    backgroundColor:
      "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  cardTitle: {
    fontFamily:
      "Inter_600SemiBold",
    fontSize: 16,
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
    backgroundColor:
      "#DFF5E7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
    color: "#34A853",
    fontSize: 12,
    fontFamily:
      "Inter_600SemiBold",
  },

  redBadge: {
    backgroundColor:
      "#FCE8E6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  redBadgeText: {
    color: "#C44736",
    fontFamily:
      "Inter_600SemiBold",
    fontSize: 12,
  },

  penaltyCard: {
    backgroundColor:
      "#FFF4F2",
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
  },

  penaltyTitle: {
    color: "#C44736",
    fontFamily:
      "Inter_600SemiBold",
    marginBottom: 8,
  },

  penaltyInfo: {
    color: "#666",
    marginBottom: 12,
  },

  penaltyRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
  },

  totalLabel: {
    fontFamily:
      "Inter_600SemiBold",
  },

  totalAmount: {
    color: "#C44736",
    fontFamily:
      "Inter_700Bold",
    fontSize: 20,
  },

  payButton: {
    backgroundColor:
      "#C44736",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  payButtonText: {
    color: "#FFFFFF",
    fontFamily:
      "Inter_700Bold",
    fontSize: 16,
  },

  footerText: {
    textAlign: "center",
    color: "#999",
    marginTop: 14,
    fontSize: 12,
  },
});