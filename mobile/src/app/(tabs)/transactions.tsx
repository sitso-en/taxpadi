import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTransactions } from "../../context/TransactionContext";

export default function TransactionsScreen() {
  const { transactions } = useTransactions();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesFilter =
      selectedFilter === "All"
        ? true
        : transaction.type.toLowerCase() ===
          selectedFilter.toLowerCase();

    const matchesSearch = transaction.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text style={styles.title}>Transactions</Text>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {["All", "Income", "Expense"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterButton,
                selectedFilter === item &&
                  styles.selectedFilter,
              ]}
              onPress={() => setSelectedFilter(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === item &&
                    styles.selectedFilterText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#9CA3AF"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Transactions */}
        {filteredTransactions.length === 0 ? (
          <Text style={styles.emptyText}>
            No transactions found.
          </Text>
        ) : (
          filteredTransactions.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              style={styles.transactionItem}
              onPress={() =>
                router.push(
                  `/edit-transaction?id=${transaction.id}`
                )
              }
            >
              <View>
                <Text style={styles.transactionTitle}>
                  {transaction.title}
                </Text>

                <Text style={styles.transactionCategory}>
                  {transaction.type} • {transaction.category}
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
                  {transaction.type === "income" ? "+" : "-"}
                  GH¢ {transaction.amount}
                </Text>

                <Text style={styles.date}>
                  {transaction.date
                    ? new Date(
                        transaction.date
                      ).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )
                    : "No Date"}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Floating Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/add-transaction")}
      >
        <Ionicons
          name="add"
          size={32}
          color="#FFFFFF"
        />
      </TouchableOpacity>
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

  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 18,
  },

  filterContainer: {
    flexDirection: "row",
    marginBottom: 18,
  },

  filterButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
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
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 30,
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,
    marginLeft: 8,
    fontFamily: "Inter_400Regular",

    ...(require("react-native").Platform.OS === "web"
      ? { outlineWidth: 0 }
      : {}),
  },

  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  transactionTitle: {
    fontSize: 17,
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
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

  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 50,
    fontFamily: "Inter_400Regular",
  },

  fab: {
    position: "absolute",
    right: 25,
    bottom: 25,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});