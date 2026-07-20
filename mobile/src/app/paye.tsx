import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomSheet from "@/components/BottomSheet";
import {
  getPayeRecords,
  getPayeEmployees,
  addPayeEmployee,
  updatePayeEmployee,
  remitPayeRecord,
  deactivatePayeEmployee,
  getPayeAnnualReturn,
} from "@/services/paye.service";
import { usePrivacy } from "@/context/PrivacyContext";
import { useToast } from "@/context/ToastContext";
import { getUserFriendlyError } from "@/utils/error";
import SubscriptionGate from "@/components/SubscriptionGate";
import { useSubscription } from "@/context/SubscriptionContext";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const fmt = (n: number) =>
  `GH¢ ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type MonthlyGroup = {
  key: string;
  month: number;
  year: number;
  total: number;
  allRemitted: boolean;
  pendingIds: string[];
};

export default function PAYEScreen() {
  const { isPro } = useSubscription();
  const { amountsHidden, toggleAmountsHidden } = usePrivacy();
  const { showToast } = useToast();
  const [summary, setSummary] = useState<any>(null);
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyGroup[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [remittingKey, setRemittingKey] = useState<string | null>(null);

  // Add employee modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingEmployee, setAddingEmployee] = useState(false);
  const [addError, setAddError] = useState("");
  const [empName, setEmpName] = useState("");
  const [empPosition, setEmpPosition] = useState("");
  const [empSalary, setEmpSalary] = useState("");
  const [empTransport, setEmpTransport] = useState("");
  const [empHousing, setEmpHousing] = useState("");
  const [empSsnit, setEmpSsnit] = useState("");
  const [empStartDate, setEmpStartDate] = useState(new Date());
  const [showEmpDatePicker, setShowEmpDatePicker] = useState(false);

  // Deactivate employee modal
  const [deactivateEmployee, setDeactivateEmployee] = useState<any | null>(null);
  const [deactivateEndDate, setDeactivateEndDate] = useState(new Date());
  const [showDeactivateDatePicker, setShowDeactivateDatePicker] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  // Edit employee sheet
  const [editEmployee, setEditEmployee] = useState<any | null>(null);
  const [editEmpName, setEditEmpName] = useState("");
  const [editEmpPosition, setEditEmpPosition] = useState("");
  const [editEmpSalary, setEditEmpSalary] = useState("");
  const [editEmpTransport, setEditEmpTransport] = useState("");
  const [editEmpHousing, setEditEmpHousing] = useState("");
  const [editEmpSsnit, setEditEmpSsnit] = useState("");
  const [editingEmployee, setEditingEmployee] = useState(false);
  const [editEmpError, setEditEmpError] = useState("");

  // Annual return sheet
  const [showAnnualReturn, setShowAnnualReturn] = useState(false);
  const [annualYear, setAnnualYear] = useState(new Date().getFullYear());
  const [annualData, setAnnualData] = useState<any>(null);
  const [annualLoading, setAnnualLoading] = useState(false);

  const loadRecords = async () => {
    const res = await getPayeRecords();
    setSummary(res.data?.summary ?? null);
    const records: any[] = res.data?.records ?? [];
    const grouped: Record<string, MonthlyGroup> = {};
    for (const r of records) {
      const key = `${r.month}-${r.year}`;
      if (!grouped[key]) {
        grouped[key] = { key, month: r.month, year: r.year, total: 0, allRemitted: true, pendingIds: [] };
      }
      grouped[key].total += r.paye_deducted;
      if (!r.remitted) {
        grouped[key].allRemitted = false;
        grouped[key].pendingIds.push(r.paye_id);
      }
    }
    setMonthlyHistory(Object.values(grouped).sort((a, b) => b.year - a.year || b.month - a.month));
  };

  const loadEmployees = async () => {
    const res = await getPayeEmployees({ status: "active" });
    setEmployees(res.data?.employees ?? []);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([loadRecords(), loadEmployees()]);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (!isPro) return (
    <SubscriptionGate
      feature="PAYE"
      description="Manage employee payroll, calculate monthly PAYE deductions, and remit directly to the GRA."
      icon="cash-outline"
    />
  );

  const resetAddForm = () => {
    setEmpName(""); setEmpPosition(""); setEmpSalary("");
    setEmpTransport(""); setEmpHousing(""); setEmpSsnit("");
    setEmpStartDate(new Date()); setAddError("");
  };

  const handleAddEmployee = async () => {
    if (!empName.trim()) { setAddError("Name is required."); return; }
    if (!empSalary.trim() || Number(empSalary) <= 0) { setAddError("Enter a valid gross salary."); return; }
    setAddingEmployee(true);
    setAddError("");
    try {
      await addPayeEmployee({
        full_name: empName.trim(),
        position: empPosition.trim() || undefined,
        gross_salary: Number(empSalary),
        transport_allowance: empTransport ? Number(empTransport) : undefined,
        housing_allowance: empHousing ? Number(empHousing) : undefined,
        social_security_no: empSsnit.trim() || undefined,
        start_date: empStartDate.toISOString().split("T")[0],
      });
      showToast("Employee added successfully.", "success");
      setShowAddModal(false);
      resetAddForm();
      await loadEmployees();
    } catch (error: any) {
      setAddError(getUserFriendlyError(error));
    } finally {
      setAddingEmployee(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateEmployee || deactivating) return;
    setDeactivating(true);
    try {
      await deactivatePayeEmployee(
        deactivateEmployee.employee_id,
        deactivateEndDate.toISOString().split("T")[0]
      );
      showToast(`${deactivateEmployee.full_name} deactivated.`, "success");
      setDeactivateEmployee(null);
      await loadEmployees();
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setDeactivating(false);
    }
  };

  const handleRemitMonth = async (item: MonthlyGroup) => {
    if (remittingKey) return;
    setRemittingKey(item.key);
    try {
      await Promise.all(item.pendingIds.map((id) => remitPayeRecord(id)));
      showToast(`PAYE for ${MONTH_NAMES[item.month - 1]} ${item.year} marked as remitted.`, "success");
      await loadRecords();
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setRemittingKey(null);
    }
  };

  const openEditEmployee = (emp: any) => {
    setEditEmployee(emp);
    setEditEmpName(emp.full_name ?? "");
    setEditEmpPosition(emp.position ?? "");
    setEditEmpSalary(String(emp.gross_salary ?? ""));
    setEditEmpTransport(emp.transport_allowance ? String(emp.transport_allowance) : "");
    setEditEmpHousing(emp.housing_allowance ? String(emp.housing_allowance) : "");
    setEditEmpSsnit(emp.social_security_no ?? "");
    setEditEmpError("");
  };

  const handleEditEmployee = async () => {
    if (!editEmployee) return;
    if (!editEmpName.trim()) { setEditEmpError("Name is required."); return; }
    if (!editEmpSalary.trim() || Number(editEmpSalary) <= 0) { setEditEmpError("Enter a valid gross salary."); return; }
    setEditingEmployee(true);
    setEditEmpError("");
    try {
      await updatePayeEmployee(editEmployee.employee_id, {
        full_name: editEmpName.trim(),
        position: editEmpPosition.trim() || undefined,
        gross_salary: Number(editEmpSalary),
        transport_allowance: editEmpTransport ? Number(editEmpTransport) : undefined,
        housing_allowance: editEmpHousing ? Number(editEmpHousing) : undefined,
        social_security_no: editEmpSsnit.trim() || undefined,
      });
      showToast("Employee updated.", "success");
      setEditEmployee(null);
      await loadEmployees();
    } catch (error: any) {
      setEditEmpError(getUserFriendlyError(error));
    } finally {
      setEditingEmployee(false);
    }
  };

  const fetchAnnualReturn = async (year: number) => {
    setAnnualLoading(true);
    setAnnualData(null);
    try {
      const res = await getPayeAnnualReturn(String(year));
      setAnnualData(res.data ?? res);
    } catch {
      showToast("Could not load annual return.", "error");
    } finally {
      setAnnualLoading(false);
    }
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <View style={styles.divider} />
    </>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>PAYE</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#C44736" style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Summary hero */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>OUTSTANDING PAYE</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
              <Text style={styles.summaryAmount}>
                {amountsHidden ? "••••••" : fmt(summary?.total_outstanding ?? 0)}
              </Text>
              <TouchableOpacity onPress={toggleAmountsHidden} style={{ marginLeft: 12 }}>
                <Ionicons
                  name={amountsHidden ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Breakdown */}
          <View style={styles.infoCard}>
            <Row label="PAYE Deducted" value={amountsHidden ? "••••••" : fmt(summary?.total_paye_deducted ?? 0)} />
            <Row label="PAYE Remitted" value={amountsHidden ? "••••••" : fmt(summary?.total_remitted ?? 0)} />
            <Row label="Outstanding PAYE" value={amountsHidden ? "••••••" : fmt(summary?.total_outstanding ?? 0)} />
          </View>

          {/* Employee Register */}
          <View style={styles.sectionRow}>
            <Text style={styles.section}>Employee Register</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
              <Ionicons name="add" size={14} color="#C44736" />
              <Text style={styles.addBtnText}>Add Employee</Text>
            </TouchableOpacity>
          </View>

          {employees.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No employees yet</Text>
              <Text style={styles.emptySubtitle}>
                Add employees to start tracking PAYE deductions automatically.
              </Text>
            </View>
          ) : (
            employees.map((emp) => (
              <View key={emp.employee_id} style={styles.employeeCard}>
                <View style={styles.employeeAvatar}>
                  <Text style={styles.employeeAvatarText}>
                    {emp.full_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.employeeName}>{emp.full_name}</Text>
                  <Text style={styles.employeePosition}>{emp.position ?? "No position"}</Text>
                  <Text style={styles.employeePaye}>
                    Monthly PAYE: {amountsHidden ? "••••" : fmt(emp.monthly_paye ?? 0)}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 4 }}>
                  <TouchableOpacity
                    style={styles.deactivateBtn}
                    onPress={() => openEditEmployee(emp)}
                  >
                    <Ionicons name="create-outline" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deactivateBtn}
                    onPress={() => { setDeactivateEmployee(emp); setDeactivateEndDate(new Date()); }}
                  >
                    <Ionicons name="person-remove-outline" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {/* Monthly PAYE History */}
          <View style={[styles.sectionRow, { marginTop: 8 }]}>
            <Text style={styles.section}>PAYE History</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => { setShowAnnualReturn(true); fetchAnnualReturn(annualYear); }}
            >
              <Ionicons name="bar-chart-outline" size={14} color="#C44736" />
              <Text style={styles.addBtnText}>Annual Return</Text>
            </TouchableOpacity>
          </View>

          {monthlyHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No PAYE records yet</Text>
              <Text style={styles.emptySubtitle}>
                PAYE records appear here once employees are added and payroll is processed.
              </Text>
            </View>
          ) : (
            monthlyHistory.map((item) => (
              <View key={item.key} style={styles.historyCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTitle}>
                    {MONTH_NAMES[item.month - 1]} {item.year}
                  </Text>
                  <Text style={[styles.historyStatus, { color: item.allRemitted ? "#16A34A" : "#D97706" }]}>
                    {item.allRemitted ? "All Remitted" : `${item.pendingIds.length} pending`}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 8 }}>
                  <Text style={styles.historyAmount}>{amountsHidden ? "••••••" : fmt(item.total)}</Text>
                  {!item.allRemitted && (
                    <TouchableOpacity
                      style={[styles.remitBtn, remittingKey === item.key && { opacity: 0.5 }]}
                      onPress={() => handleRemitMonth(item)}
                      disabled={!!remittingKey}
                    >
                      <Text style={styles.remitBtnText}>
                        {remittingKey === item.key ? "Remitting…" : "Remit All"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </>
      )}

      {/* Edit Employee Sheet */}
      <BottomSheet visible={!!editEmployee} onClose={() => setEditEmployee(null)} avoidKeyboard>
        <ScrollView style={styles.sheetContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sheetTitle}>Edit Employee</Text>
          <Text style={styles.sheetSub}>Changes apply from the next payroll period.</Text>

          <Text style={styles.fieldLabel}>FULL NAME *</Text>
          <TextInput
            style={[styles.fieldInput, editEmpError && !editEmpName.trim() ? styles.fieldInputError : null]}
            placeholder="e.g. Ama Owusu"
            placeholderTextColor="#9CA3AF"
            value={editEmpName}
            onChangeText={(t) => { setEditEmpName(t); setEditEmpError(""); }}
          />

          <Text style={styles.fieldLabel}>POSITION</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g. Accountant"
            placeholderTextColor="#9CA3AF"
            value={editEmpPosition}
            onChangeText={setEditEmpPosition}
          />

          <Text style={styles.fieldLabel}>GROSS SALARY (GHS) *</Text>
          <TextInput
            style={[styles.fieldInput, editEmpError && !editEmpSalary.trim() ? styles.fieldInputError : null]}
            placeholder="e.g. 2500"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={editEmpSalary}
            onChangeText={(t) => { setEditEmpSalary(t); setEditEmpError(""); }}
          />

          <Text style={styles.fieldLabel}>TRANSPORT ALLOWANCE (GHS)</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g. 200"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={editEmpTransport}
            onChangeText={setEditEmpTransport}
          />

          <Text style={styles.fieldLabel}>HOUSING ALLOWANCE (GHS)</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g. 300"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={editEmpHousing}
            onChangeText={setEditEmpHousing}
          />

          <Text style={styles.fieldLabel}>SSNIT NUMBER</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="Optional"
            placeholderTextColor="#9CA3AF"
            value={editEmpSsnit}
            onChangeText={setEditEmpSsnit}
            autoCapitalize="characters"
          />

          {editEmpError ? <Text style={styles.fieldError}>{editEmpError}</Text> : null}

          <TouchableOpacity
            style={[styles.button, editingEmployee && { opacity: 0.7 }]}
            onPress={handleEditEmployee}
            disabled={editingEmployee}
          >
            <Text style={styles.buttonText}>{editingEmployee ? "Saving…" : "Save Changes"}</Text>
          </TouchableOpacity>
          <View style={{ height: 20 }} />
        </ScrollView>
      </BottomSheet>

      {/* Annual Return Sheet */}
      <BottomSheet visible={showAnnualReturn} onClose={() => setShowAnnualReturn(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>PAYE Annual Return</Text>

          {/* Year picker */}
          <View style={styles.yearPicker}>
            <TouchableOpacity
              onPress={() => { const y = annualYear - 1; setAnnualYear(y); fetchAnnualReturn(y); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={20} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.yearText}>{annualYear}</Text>
            <TouchableOpacity
              onPress={() => {
                if (annualYear >= new Date().getFullYear()) return;
                const y = annualYear + 1; setAnnualYear(y); fetchAnnualReturn(y);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-forward" size={20} color={annualYear >= new Date().getFullYear() ? "#D1D5DB" : "#374151"} />
            </TouchableOpacity>
          </View>

          {annualLoading ? (
            <ActivityIndicator color="#C44736" style={{ marginTop: 32, marginBottom: 32 }} />
          ) : !annualData ? (
            <Text style={styles.annualEmpty}>No data available for {annualYear}.</Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {/* Totals */}
              <View style={styles.annualTotalsCard}>
                <View style={styles.annualTotalRow}>
                  <Text style={styles.annualTotalLabel}>Total Gross Salary</Text>
                  <Text style={styles.annualTotalVal}>{fmt(annualData.total_gross_salary ?? 0)}</Text>
                </View>
                <View style={styles.annualTotalRow}>
                  <Text style={styles.annualTotalLabel}>Total PAYE Deducted</Text>
                  <Text style={styles.annualTotalVal}>{fmt(annualData.total_paye_deducted ?? 0)}</Text>
                </View>
                <View style={styles.annualTotalRow}>
                  <Text style={styles.annualTotalLabel}>Total Remitted</Text>
                  <Text style={[styles.annualTotalVal, { color: "#16A34A" }]}>{fmt(annualData.total_remitted ?? 0)}</Text>
                </View>
                <View style={[styles.annualTotalRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.annualTotalLabel}>Outstanding</Text>
                  <Text style={[styles.annualTotalVal, { color: "#C44736" }]}>{fmt(annualData.outstanding ?? 0)}</Text>
                </View>
              </View>

              {/* Per-employee breakdown */}
              {(annualData.employees ?? []).length > 0 && (
                <>
                  <Text style={styles.annualBreakdownTitle}>Employee Breakdown</Text>
                  {(annualData.employees ?? []).map((emp: any, i: number) => (
                    <View key={emp.employee_id ?? i} style={styles.annualEmpRow}>
                      <View style={styles.employeeAvatar}>
                        <Text style={styles.employeeAvatarText}>{(emp.full_name ?? "?").charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.annualEmpName}>{emp.full_name}</Text>
                        <Text style={styles.annualEmpPaye}>PAYE: {fmt(emp.total_paye ?? 0)}</Text>
                      </View>
                      <Text style={styles.annualEmpGross}>{fmt(emp.total_gross_salary ?? 0)}</Text>
                    </View>
                  ))}
                </>
              )}
              <View style={{ height: 24 }} />
            </ScrollView>
          )}
        </View>
      </BottomSheet>

      {/* Add Employee Modal */}
      <BottomSheet visible={showAddModal} onClose={() => { setShowAddModal(false); resetAddForm(); }} avoidKeyboard>
        <ScrollView style={styles.sheetContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.sheetTitle}>Add Employee</Text>
            <Text style={styles.sheetSub}>Employee's monthly PAYE will be calculated automatically.</Text>

            <Text style={styles.fieldLabel}>FULL NAME *</Text>
            <TextInput
              style={[styles.fieldInput, addError && !empName.trim() ? styles.fieldInputError : null]}
              placeholder="e.g. Ama Owusu"
              placeholderTextColor="#9CA3AF"
              value={empName}
              onChangeText={(t) => { setEmpName(t); setAddError(""); }}
            />

            <Text style={styles.fieldLabel}>POSITION</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. Accountant"
              placeholderTextColor="#9CA3AF"
              value={empPosition}
              onChangeText={setEmpPosition}
            />

            <Text style={styles.fieldLabel}>GROSS SALARY (GHS) *</Text>
            <TextInput
              style={[styles.fieldInput, addError && !empSalary.trim() ? styles.fieldInputError : null]}
              placeholder="e.g. 2500"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={empSalary}
              onChangeText={(t) => { setEmpSalary(t); setAddError(""); }}
            />

            <Text style={styles.fieldLabel}>TRANSPORT ALLOWANCE (GHS)</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. 200"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={empTransport}
              onChangeText={setEmpTransport}
            />

            <Text style={styles.fieldLabel}>HOUSING ALLOWANCE (GHS)</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. 300"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={empHousing}
              onChangeText={setEmpHousing}
            />

            <Text style={styles.fieldLabel}>SSNIT NUMBER</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="Optional"
              placeholderTextColor="#9CA3AF"
              value={empSsnit}
              onChangeText={setEmpSsnit}
              autoCapitalize="characters"
            />

            <Text style={styles.fieldLabel}>START DATE *</Text>
            <TouchableOpacity style={styles.fieldInput} onPress={() => setShowEmpDatePicker(true)}>
              <Text style={{ color: "#374151", fontFamily: "Inter_400Regular" }}>
                {empStartDate.toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" })}
              </Text>
            </TouchableOpacity>

            {showEmpDatePicker && Platform.OS !== "web" && (
              <DateTimePicker
                value={empStartDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, d) => { setShowEmpDatePicker(false); if (d) setEmpStartDate(d); }}
                maximumDate={new Date()}
              />
            )}

            {addError ? <Text style={styles.fieldError}>{addError}</Text> : null}

            <TouchableOpacity
              style={[styles.button, addingEmployee && { opacity: 0.7 }]}
              onPress={handleAddEmployee}
              disabled={addingEmployee}
            >
              <Text style={styles.buttonText}>{addingEmployee ? "Adding…" : "Add Employee"}</Text>
            </TouchableOpacity>
            <View style={{ height: 20 }} />
        </ScrollView>
      </BottomSheet>

      {/* Deactivate Employee Modal */}
      <Modal
        visible={!!deactivateEmployee}
        transparent
        animationType="fade"
        onRequestClose={() => setDeactivateEmployee(null)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconBox}>
              <Ionicons name="person-remove-outline" size={22} color="#C44736" />
            </View>
            <Text style={styles.confirmTitle}>Deactivate {deactivateEmployee?.full_name}?</Text>
            <Text style={styles.confirmSub}>Historical PAYE records will be preserved.</Text>

            <Text style={styles.fieldLabel}>END DATE</Text>
            <TouchableOpacity style={[styles.fieldInput, { marginBottom: 20 }]} onPress={() => setShowDeactivateDatePicker(true)}>
              <Text style={{ color: "#374151", fontFamily: "Inter_400Regular" }}>
                {deactivateEndDate.toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" })}
              </Text>
            </TouchableOpacity>

            {showDeactivateDatePicker && Platform.OS !== "web" && (
              <DateTimePicker
                value={deactivateEndDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, d) => { setShowDeactivateDatePicker(false); if (d) setDeactivateEndDate(d); }}
              />
            )}

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setDeactivateEmployee(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, deactivating && { opacity: 0.7 }]}
                onPress={handleDeactivate}
                disabled={deactivating}
              >
                <Text style={styles.deleteText}>{deactivating ? "Deactivating…" : "Deactivate"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EDE8",
    paddingHorizontal: 16,
    paddingTop: 44,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    marginLeft: 10,
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },

  summaryCard: {
    backgroundColor: "#C44736",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },

  summaryLabel: {
    color: "#FDECEC",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },

  summaryAmount: {
    color: "#FFFFFF",
    fontSize: 34,
    fontFamily: "Inter_700Bold",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
  },

  divider: {
    height: 1,
    backgroundColor: "#EDE8E3",
  },

  label: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
  },

  value: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  section: {
    fontSize: 16,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },

  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  historyTitle: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  historyStatus: {
    marginTop: 4,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },

  historyAmount: {
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },

  button: {
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FDECEC",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addBtnText: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },

  // Employee card
  employeeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  employeeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  employeeAvatarText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#C44736",
  },
  employeeName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
  },
  employeePosition: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginTop: 2,
  },
  employeePaye: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#374151",
    marginTop: 4,
  },
  deactivateBtn: {
    padding: 8,
  },

  // Remit button
  remitBtn: {
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#16A34A",
  },
  remitBtnText: {
    color: "#16A34A",
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },

  sheetContent: {
    paddingHorizontal: 22,
    paddingBottom: 24,
    maxHeight: "90%",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 4,
  },
  sheetSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginBottom: 20,
  },
  fieldLabel: {
    color: "#C44736",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  fieldInput: {
    backgroundColor: "#EDE8E3",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#111827",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  fieldInputError: { borderColor: "#EF4444" },
  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: -10,
    marginBottom: 14,
  },

  // Deactivate modal
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  confirmCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  confirmIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
  },
  confirmSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
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
  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#C44736",
    alignItems: "center",
  },
  deleteText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },

  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },

  // Year picker
  yearPicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingVertical: 12,
    marginBottom: 16,
  },
  yearText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  // Annual return
  annualEmpty: {
    textAlign: "center",
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginVertical: 32,
  },
  annualTotalsCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  annualTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  annualTotalLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
  },
  annualTotalVal: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  annualBreakdownTitle: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#C44736",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  annualEmpRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  annualEmpName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
  },
  annualEmpPaye: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginTop: 2,
  },
  annualEmpGross: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#374151",
  },
});