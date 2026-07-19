import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RefreshControl } from "react-native";
import {
  ActivityIndicator,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useToast } from "@/context/ToastContext";
import { getTransactions, deleteTransaction as deleteTransactionApi } from "@/services/transaction.service";
import Card from "../../components/Card";
import ErrorState from "@/components/ErrorState";

const LIMIT = 20;

export default function TransactionsScreen() {
  const { showToast } = useToast();

  const [localTransactions, setLocalTransactions] = useState<any[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchAnim = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const searchInitialized = useRef(false);

  const fetchTransactions = useCallback(
    async (typeFilter: string, pageNum: number, append = false, searchTerm = "") => {
      if (append) setLoadingMore(true);
      else { setLocalLoading(true); setLocalError(false); }
      try {
        const params: Record<string, any> = { page: pageNum, limit: LIMIT };
        if (typeFilter !== "All") params.type = typeFilter.toLowerCase();
        if (searchTerm.trim()) params.search = searchTerm.trim();
        const response = await getTransactions(params);
        const fetched = response.data?.transactions ?? response.transactions ?? [];
        if (append) {
          setLocalTransactions((prev) => [...prev, ...fetched]);
        } else {
          setLocalTransactions(fetched);
        }
        setHasMore(fetched.length === LIMIT);
      } catch {
        if (!append) setLocalError(true);
      } finally {
        if (append) setLoadingMore(false);
        else setLocalLoading(false);
      }
    },
    []
  );

  // Refresh on screen focus (picks up edits / new transactions from other screens)
  useFocusEffect(
    useCallback(() => {
      setPage(1);
      fetchTransactions(selectedFilter, 1, false, search);
    }, [selectedFilter])
  );

  // Debounced search — skip the initial empty-string run (useFocusEffect handles that)
  useEffect(() => {
    if (!searchInitialized.current) {
      searchInitialized.current = true;
      return;
    }
    const timer = setTimeout(() => {
      setPage(1);
      fetchTransactions(selectedFilter, 1, false, search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setLocalError(false);
    await fetchTransactions(selectedFilter, 1, false, search);
    setRefreshing(false);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setPage(1);
    fetchTransactions(filter, 1, false, search);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchTransactions(selectedFilter, next, true, search);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirmId || deleting) return;
    setDeleting(true);
    try {
      await deleteTransactionApi(deleteConfirmId);
      setDeleteConfirmId(null);
      setPage(1);
      fetchTransactions(selectedFilter, 1, false);
      showToast("Transaction deleted.", "success");
    } catch {
      showToast("Failed to delete transaction.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const openSearch = () => {
    setSearchOpen(true);
    Animated.timing(searchAnim, { toValue: 1, duration: 220, useNativeDriver: false }).start(
      () => searchInputRef.current?.focus()
    );
  };

  const closeSearch = () => {
    setSearch("");
    Animated.timing(searchAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start(() =>
      setSearchOpen(false)
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#C44736"]} tintColor="#C44736" />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.title}>Transactions</Text>
            <Text style={styles.subtitle}>Track your income and expenses.</Text>
          </View>
          <TouchableOpacity
            style={styles.importButton}
            onPress={() => router.push("/import-transactions")}
          >
            <Ionicons name="cloud-upload-outline" size={18} color="#C44736" />
            <Text style={styles.importText}>Import</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.transactionCount}>
          {localTransactions.length} transaction
          {localTransactions.length !== 1 ? "s" : ""}
          {selectedFilter !== "All" ? ` · ${selectedFilter}` : ""}
        </Text>

        {/* Filters + search toggle */}
        <View style={styles.filterRow}>
          {["All", "Income", "Expense"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.filterButton, selectedFilter === item && styles.selectedFilter]}
              onPress={() => handleFilterChange(item)}
            >
              <Text style={[styles.filterText, selectedFilter === item && styles.selectedFilterText]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={[styles.searchToggle, searchOpen && styles.searchToggleActive]}
            onPress={searchOpen ? closeSearch : openSearch}
          >
            <Ionicons
              name="search-outline"
              size={16}
              color={searchOpen ? "#FFFFFF" : "#6B7280"}
            />
          </TouchableOpacity>
        </View>

        {/* Animated search bar */}
        <Animated.View
          style={{
            height: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 48] }),
            opacity: searchAnim,
            marginBottom: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 16] }),
            overflow: "hidden",
          }}
        >
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search transactions..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity
              onPress={() => (search ? setSearch("") : closeSearch())}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* List */}
        {localLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#C44736" />
          </View>
        ) : localError ? (
          <ErrorState onRetry={() => fetchTransactions(selectedFilter, 1, false)} />
        ) : localTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptyText}>Start by adding your first transaction.</Text>
          </View>
        ) : (
          <>
            {localTransactions.map((transaction) => {
              const id = transaction.transaction_id;
              const isIncome = transaction.type === "income";
              return (
                <Card key={id} style={styles.transactionCard}>
                  <TouchableOpacity
                    style={styles.transactionItem}
                    onPress={() => router.push(`/transaction-detail?id=${id}`)}
                    onLongPress={() => setDeleteConfirmId(id)}
                    delayLongPress={500}
                  >
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.transactionTitle} numberOfLines={2}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.transactionMeta} numberOfLines={1}>
                        {[
                          transaction.category,
                          transaction.tax_deductible ? "Deductible" : null,
                          transaction.withholding_applicable ? "WHT" : null,
                        ]
                          .filter(Boolean)
                          .join("  ·  ")}
                      </Text>
                    </View>

                    <View style={{ alignItems: "flex-end", flexShrink: 0 }}>
                      <Text style={[styles.amount, { color: isIncome ? "#22C55E" : "#C44736" }]}>
                        {isIncome ? "+ " : "- "}GH¢ {Number(transaction.amount).toFixed(2)}
                      </Text>
                      <Text style={styles.date}>
                        {transaction.transaction_date
                          ? new Date(transaction.transaction_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "No Date"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Card>
              );
            })}

            {/* Load more */}
            {hasMore && (
              <TouchableOpacity style={styles.loadMoreBtn} onPress={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? (
                  <ActivityIndicator size="small" color="#C44736" />
                ) : (
                  <Text style={styles.loadMoreText}>Load more</Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/add-transaction")}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Delete confirmation modal */}
      <Modal visible={!!deleteConfirmId} transparent animationType="fade" onRequestClose={() => setDeleteConfirmId(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <Ionicons name="trash-outline" size={24} color="#C44736" />
            </View>
            <Text style={styles.modalTitle}>Delete Transaction?</Text>
            <Text style={styles.modalText}>This action cannot be undone.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setDeleteConfirmId(null)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={handleDeleteConfirmed}
                disabled={deleting}
              >
                <Text style={styles.confirmDeleteText}>{deleting ? "Deleting…" : "Delete"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EDE8",
    paddingHorizontal: 16,
    paddingTop: 44,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },

  title: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },

  importButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FCE8E6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 9,
  },

  importText: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    marginLeft: 4,
  },

  transactionCount: {
    color: "#9CA3AF",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 16,
  },

  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  filterButton: {
    backgroundColor: "#EDE8E3",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 24,
    marginRight: 8,
  },

  selectedFilter: { backgroundColor: "#C44736" },

  filterText: {
    color: "#111827",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },

  selectedFilterText: { color: "#FFFFFF" },

  searchToggle: {
    backgroundColor: "#ede8e3",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },

  searchToggleActive: { backgroundColor: "#C44736" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 4,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },

  transactionCard: { marginBottom: 10 },

  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  transactionTitle: {
    fontSize: 14,
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  transactionMeta: {
    color: "#9CA3AF",
    marginTop: 5,
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

  loadMoreBtn: {
    alignItems: "center",
    paddingVertical: 14,
    marginBottom: 8,
  },

  loadMoreText: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
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
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },

  // Delete modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },

  modalIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 6,
  },

  modalText: {
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 20,
  },

  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#EDE8E3",
    alignItems: "center",
  },

  cancelText: {
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    fontSize: 14,
  },

  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#C44736",
    alignItems: "center",
  },

  confirmDeleteText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
