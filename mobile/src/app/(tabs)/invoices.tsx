import { router } from "expo-router";
import React, { useMemo, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useInvoices,
  InvoiceStatus,
} from "../../context/InvoiceContext";

export default function InvoicesScreen() {
  const {
    invoices,
    updateInvoiceStatus,
  } = useInvoices();

  const [selectedFilter, setSelectedFilter] =
    React.useState("All");

  // Automatically mark overdue invoices

  useEffect(() => {
    const today = new Date();

    invoices.forEach((invoice) => {
      const dueDate = new Date(
        invoice.dueDate
      );

      if (
        invoice.status !== "Paid" &&
        invoice.status !== "Draft" &&
        dueDate < today
      ) {
        updateInvoiceStatus(
          invoice.id,
          "Overdue"
        );
      }
    });
  }, [invoices]);

  // Filter invoices

  const filteredInvoices = useMemo(() => {
    if (selectedFilter === "All") {
      return invoices;
    }

    return invoices.filter(
      (invoice) =>
        invoice.status === selectedFilter
    );
  }, [invoices, selectedFilter]);

  // Summary cards

  const totalAmount = invoices.reduce(
    (sum, invoice) =>
      sum + invoice.amount,
    0
  );

  const paidAmount = invoices
    .filter(
      (invoice) =>
        invoice.status === "Paid"
    )
    .reduce(
      (sum, invoice) =>
        sum + invoice.amount,
      0
    );

  const unpaidAmount = invoices
    .filter(
      (invoice) =>
        invoice.status !== "Paid"
    )
    .reduce(
      (sum, invoice) =>
        sum + invoice.amount,
      0
    );

  const getStatusColor = (
    status: InvoiceStatus
  ) => {
    switch (status) {
      case "Paid":
        return "#34A853";

      case "Sent":
        return "#4285F4";

      case "Overdue":
        return "#EA4335";

      case "Draft":
        return "#B7791F";

      default:
        return "#6B7280";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.title}>
            Invoices
          </Text>
        </View>

        {/* Summary */}

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text
              style={styles.summaryLabel}
            >
              Total
            </Text>

            <Text
              style={styles.summaryAmount}
            >
              GH¢{" "}
              {totalAmount.toFixed(0)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text
              style={styles.summaryLabel}
            >
              Paid
            </Text>

            <Text
              style={styles.summaryAmount}
            >
              GH¢{" "}
              {paidAmount.toFixed(0)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text
              style={styles.summaryLabel}
            >
              Unpaid
            </Text>

            <Text
              style={styles.summaryAmount}
            >
              GH¢{" "}
              {unpaidAmount.toFixed(0)}
            </Text>
          </View>
        </View>

        {/* Filters */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          style={styles.filterContainer}
        >
          {[
            "All",
            "Draft",
            "Sent",
            "Paid",
            "Overdue",
          ].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterButton,
                selectedFilter ===
                  item &&
                  styles.selectedFilterButton,
              ]}
              onPress={() =>
                setSelectedFilter(item)
              }
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter ===
                    item &&
                    styles.selectedFilterText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Invoice List */}

        {filteredInvoices.length ===
        0 ? (
          <View style={styles.emptyCard}>
            <Text
              style={styles.emptyTitle}
            >
              No invoices found
            </Text>

            <Text
              style={styles.emptyText}
            >
              No invoices match this
              filter.
            </Text>
          </View>
        ) : (
          filteredInvoices.map(
            (invoice) => (
              <View
                key={invoice.id}
                style={
                  styles.invoiceItem
                }
              >
                <View
                  style={styles.leftSection}
                >
                  <Text
                    style={[
                      styles.invoiceStatus,
                      {
                        color:
                          getStatusColor(
                            invoice.status
                          ),
                      },
                    ]}
                  >
                    {invoice.status}
                  </Text>

                  <View>
                    <Text
                      style={
                        styles.invoiceNumber
                      }
                    >
                      {
                        invoice.invoiceNumber
                      }
                    </Text>

                    <Text
                      style={
                        styles.customerName
                      }
                    >
                      {
                        invoice.customerName
                      }
                    </Text>

                    <Text
                      style={styles.date}
                    >
                      Due:{" "}
                      {invoice.dueDate}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    alignItems:
                      "flex-end",
                  }}
                >
                  <Text
                    style={[
                      styles.amount,
                      {
                        color:
                          getStatusColor(
                            invoice.status
                          ),
                      },
                    ]}
                  >
                    GH¢{" "}
                    {invoice.amount.toFixed(
                      2
                    )}
                  </Text>

                  {invoice.status !==
                    "Paid" && (
                    <TouchableOpacity
                      style={
                        styles.payButton
                      }
                      onPress={() =>
                        updateInvoiceStatus(
                          invoice.id,
                          "Paid"
                        )
                      }
                    >
                      <Text
                        style={
                          styles.payButtonText
                        }
                      >
                        Mark Paid
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )
          )
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          router.push(
            "/create-invoice"
          )
        }
      >
        <Text style={styles.fabText}>
          +
        </Text>
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

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontFamily:
      "Inter_700Bold",
    color: "#111827",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginBottom: 20,
  },

  summaryCard: {
    width: "31%",
    backgroundColor: "#C44736",
    borderRadius: 14,
    padding: 12,
  },

  summaryLabel: {
    color: "#FDECEC",
    fontSize: 12,
    marginBottom: 6,
  },

  summaryAmount: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily:
      "Inter_700Bold",
  },

  filterContainer: {
    marginBottom: 20,
  },

  filterButton: {
    backgroundColor: "#EFEFEF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },

  selectedFilterButton: {
    backgroundColor: "#C44736",
  },

  filterText: {
    color: "#666",
  },

  selectedFilterText: {
    color: "#FFFFFF",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 30,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontFamily:
      "Inter_600SemiBold",
  },

  emptyText: {
    color: "#666",
  },

  invoiceItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent:
      "space-between",
  },

  leftSection: {
    flexDirection: "row",
    flex: 1,
  },

  invoiceStatus: {
    width: 70,
    fontFamily:
      "Inter_600SemiBold",
  },

  invoiceNumber: {
    color: "#9CA3AF",
    marginBottom: 4,
  },

  customerName: {
    fontSize: 16,
    fontFamily:
      "Inter_600SemiBold",
  },

  amount: {
    fontSize: 18,
    fontFamily:
      "Inter_700Bold",
  },

  date: {
    marginTop: 4,
    color: "#9CA3AF",
  },

  payButton: {
    marginTop: 10,
    backgroundColor: "#34A853",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  payButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily:
      "Inter_600SemiBold",
  },

  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
  },

  fabText: {
    color: "#FFFFFF",
    fontSize: 30,
  },
});

