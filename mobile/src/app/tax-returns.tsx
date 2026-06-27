import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTaxReturns } from "../context/TaxReturnsContext";

export default function TaxReturnsScreen() {
  const {
    currentReturnFiled,
    filingSteps,
    previousReturns,
    fileCurrentReturn,
    toggleStep,
  } = useTaxReturns();

  const currentYear =
    new Date().getFullYear();

  const currentTaxYear = `FY ${currentYear}/${
    currentYear + 1
  }`;

  const dueDate = `Apr 30, ${
    currentYear + 1
  }`;

  const allStepsCompleted =
    filingSteps.every(
      (step) => step.completed
    );

  const handleFileReturn = () => {
    if (currentReturnFiled) {
      Alert.alert(
        "Already Filed",
        "You have already filed this year's return."
      );

      return;
    }

    if (!allStepsCompleted) {
      Alert.alert(
        "Incomplete Filing",
        "Please complete all filing steps before submitting your return."
      );

      return;
    }

    fileCurrentReturn();

    Alert.alert(
      "Success",
      "Your tax return has been filed successfully."
    );
  };

  const handleDownload =
    async (
      taxYear: string,
      filedDate: string
    ) => {
      try {
        const html = `
          <html>
            <body style="font-family: Arial; padding: 30px;">
              <h1 style="color:#C44736;">
                TaxPadi Tax Return
              </h1>

              <hr />

              <h2>Return Details</h2>

              <p>
                <strong>Tax Year:</strong>
                ${taxYear}
              </p>

              <p>
                <strong>Status:</strong>
                Filed
              </p>

              <p>
                <strong>Filed Date:</strong>
                ${new Date(
                  filedDate
                ).toLocaleDateString()}
              </p>

              <p>
                <strong>Generated:</strong>
                ${new Date().toLocaleString()}
              </p>

              <br />

              <h3>
                Filing Steps Completed
              </h3>

              <ul>
                ${filingSteps
                  .map(
                    (step) =>
                      `<li>${step.title}</li>`
                  )
                  .join("")}
              </ul>

              <br />

              <p>
                This document was generated
                by TaxPadi.
              </p>
            </body>
          </html>
        `;

        const { uri } =
          await Print.printToFileAsync(
            {
              html,
            }
          );

        if (
          await Sharing.isAvailableAsync()
        ) {
          await Sharing.shareAsync(
            uri
          );
        } else {
          Alert.alert(
            "Download Complete",
            `PDF saved to:\n${uri}`
          );
        }
      } catch (error) {
        console.log(error);

        Alert.alert(
          "Error",
          "Failed to generate PDF."
        );
      }
    };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={
        false
      }
      contentContainerStyle={{
        paddingBottom: 120,
      }}
    >
      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color="#111827"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Tax Returns
        </Text>
      </View>

      {/* Current Return */}

      <View style={styles.returnCard}>
        <Text style={styles.taxYear}>
          {currentTaxYear}
        </Text>

        <Text style={styles.returnTitle}>
          Annual Income Tax Return
        </Text>

        <View style={styles.row}>
          <View
            style={[
              styles.statusBadge,
              currentReturnFiled && {
                backgroundColor:
                  "#DCFCE7",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                currentReturnFiled && {
                  color: "#15803D",
                },
              ]}
            >
              {currentReturnFiled
                ? "Filed"
                : "Not Filed"}
            </Text>
          </View>

          <Text style={styles.dueDate}>
            Due: {dueDate}
          </Text>
        </View>
      </View>

      {/* File Button */}

      <TouchableOpacity
        style={[
          styles.fileButton,
          currentReturnFiled && {
            backgroundColor:
              "#9CA3AF",
          },
        ]}
        onPress={
          handleFileReturn
        }
      >
        <Text
          style={
            styles.fileButtonText
          }
        >
          {currentReturnFiled
            ? "Return Filed"
            : "File Return Now"}
        </Text>
      </TouchableOpacity>

      {/* Filing Steps */}

      <Text
        style={styles.sectionLabel}
      >
        FILING STEPS
      </Text>

      <View style={styles.stepsCard}>
        {filingSteps.map(
          (item) => (
            <TouchableOpacity
              key={item.step}
              style={
                styles.stepRow
              }
              activeOpacity={0.8}
              onPress={() =>
                toggleStep(
                  item.step
                )
              }
            >
              <View
                style={[
                  styles.stepCircle,
                  item.completed &&
                    styles.completedCircle,
                ]}
              >
                {item.completed ? (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.stepNumber
                    }
                  >
                    {item.step}
                  </Text>
                )}
              </View>

              <Text
                style={
                  styles.stepTitle
                }
              >
                {item.title}
              </Text>

              {item.completed ? (
                <Text
                  style={
                    styles.doneText
                  }
                >
                  ✓ Done
                </Text>
              ) : (
                <Text
                  style={
                    styles.pendingText
                  }
                >
                  Tap
                </Text>
              )}
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Previous Returns */}

      <Text
        style={styles.sectionLabel}
      >
        PREVIOUS RETURNS
      </Text>

      <View
        style={styles.previousCard}
      >
        {previousReturns.length ===
        0 ? (
          <Text
            style={
              styles.emptyText
            }
          >
            No returns filed yet.
          </Text>
        ) : (
          previousReturns.map(
            (item) => (
              <View
                key={item.id}
                style={
                  styles.previousRow
                }
              >
                <View>
                  <Text
                    style={
                      styles.previousYear
                    }
                  >
                    {item.taxYear}
                  </Text>

                  <Text
                    style={
                      styles.previousDate
                    }
                  >
                    {new Date(
                      item.filedDate
                    ).toLocaleDateString()}
                  </Text>
                </View>

                <View
                  style={
                    styles.rightSection
                  }
                >
                  <Text
                    style={
                      styles.filedText
                    }
                  >
                    ✓ Filed
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      handleDownload(
                        item.taxYear,
                        item.filedDate
                      )
                    }
                  >
                    <Text
                      style={
                        styles.downloadText
                      }
                    >
                      Download
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          )
        )}
      </View>
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
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginLeft: 10,
  },

  returnCard: {
    backgroundColor: "#C44736",
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
  },

  taxYear: {
    color: "#FDECEC",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  returnTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginVertical: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusBadge: {
    backgroundColor: "#FCE8E6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    color: "#C44736",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  dueDate: {
    color: "#FFFFFF",
    fontFamily: "Inter_400Regular",
  },

  fileButton: {
    backgroundColor: "#C44736",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 28,
  },

  fileButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },

  sectionLabel: {
    color: "#C44736",
    fontSize: 11,
    marginBottom: 12,
    fontFamily: "Inter_600SemiBold",
  },

  stepsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  completedCircle: {
    backgroundColor: "#34A853",
  },

  stepNumber: {
    color: "#6B7280",
    fontFamily: "Inter_600SemiBold",
  },

  stepTitle: {
    flex: 1,
    color: "#111827",
    fontFamily: "Inter_500Medium",
  },

  doneText: {
    color: "#34A853",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  pendingText: {
    color: "#6B7280",
    fontSize: 12,
  },

  previousCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
  },

  previousRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginBottom: 20,
  },

  previousYear: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  previousDate: {
    color: "#6B7280",
    marginTop: 4,
    fontSize: 12,
  },

  rightSection: {
    alignItems: "flex-end",
  },

  filedText: {
    color: "#34A853",
    fontFamily: "Inter_600SemiBold",
  },

  downloadText: {
    color: "#C44736",
    marginTop: 6,
    fontFamily: "Inter_500Medium",
  },

  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    paddingVertical: 20,
    fontFamily: "Inter_400Regular",
  },
});
