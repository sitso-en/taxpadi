import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTransactions } from "../../context/TransactionContext";
import Card from "../../components/Card";

export default function TransactionsScreen() {
  const { transactions, loading, deleteTransaction } = useTransactions();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesFilter =
      selectedFilter === "All"
        ? true
        : transaction.type?.toLowerCase() === selectedFilter.toLowerCase();

    const transactionTitle = transaction.title ?? "";

    const matchesSearch = transactionTitle
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleDelete = async (id: number) => {
    Alert.alert("Delete Transaction", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTransaction(id.toString());
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.subtitle}>
          Track your income and expenses in one place.
        </Text>
        <Text style={styles.transactionCount}>
          {filteredTransactions.length} transaction
          {filteredTransactions.length !== 1 ? "s" : ""}
        </Text>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {["All", "Income", "Expense"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterButton,
                selectedFilter === item && styles.selectedFilter,
              ]}
              onPress={() => setSelectedFilter(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === item && styles.selectedFilterText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />

          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Transactions list layout */}
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#C44736" />
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptyText}>
              Start by adding your first transaction.
            </Text>
          </View>
        ) : (
          filteredTransactions.filter(Boolean).map((transaction) => {
            console.log("Rendering transaction:", transaction.transaction_id);
            const currentId = transaction.transaction_id;
            return (
              <Card key={currentId} style={styles.transactionCard}>
                <TouchableOpacity
                  style={styles.transactionItem}
                  onPress={() =>
                    router.push(`/edit-transaction?id=${currentId}`)
                  }
                  onLongPress={() => handleDelete(currentId)}
                >
                  <View>
                    <Text style={styles.transactionTitle}>
                      {transaction.description}
                    </Text>

                    <View
                      style={[
                        styles.typeBadge,
                        transaction.type === "income"
                          ? styles.incomeBadge
                          : styles.expenseBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeBadgeText,
                          transaction.type === "income"
                            ? styles.incomeBadgeText
                            : styles.expenseBadgeText,
                        ]}
                      >
                        {transaction.type}
                      </Text>
                    </View>

                    <Text style={styles.transactionCategory}>
                      {transaction.category}
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={[
                        styles.amount,
                        {
                          color:
                            transaction.type === "income"
                              ? "#22C55E"
                              : "#C44736",
                        },
                      ]}
                    >
                      {transaction.type === "income" ? "+ " : "- "}
                      GH¢ {Number(transaction.amount).toFixed(2)}
                    </Text>

                    <Text style={styles.date}>
                      {transaction.date
                        ? new Date(transaction.transaction_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "No Date"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Floating Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/add-transaction")}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
    paddingTop: 44,
  },

  title: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 6,
  },

  subtitle: {
    color: "#6B7280",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 28,
  },

  transactionCount: {
    color: "#9CA3AF",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginTop: -18,
    marginBottom: 22,
  },

  filterContainer: {
    flexDirection: "row",
    marginBottom: 18,
  },

  filterButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 24,
    marginRight: 8,
  },

  selectedFilter: {
    backgroundColor: "#C44736",
  },

  filterText: {
    color: "#111827",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },

  selectedFilterText: {
    color: "#FFFFFF",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 18,
    height: 56,
    marginBottom: 24,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: "Inter_400Regular",

    ...(require("react-native").Platform.OS === "web"
      ? { outlineWidth: 0 }
      : {}),
  },

  transactionCard: {
    marginBottom: 16,
  },

  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  transactionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },

  incomeBadge: {
    backgroundColor: "#DCFCE7",
  },

  expenseBadge: {
    backgroundColor: "#FEE2E2",
  },

  typeBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "capitalize",
  },

  incomeBadgeText: {
    color: "#15803D",
  },

  expenseBadgeText: {
    color: "#B91C1C",
  },

  transactionCategory: {
    color: "#9CA3AF",
    marginTop: 4,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },

  amount: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },

  date: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },

  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },

  emptyTitle: {
    fontSize: 18,
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
    marginTop: 16,
  },

  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 6,
    fontFamily: "Inter_400Regular",
  },

  fab: {
    position: "absolute",
    right: 25,
    bottom: 25,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 6,
  },
});
