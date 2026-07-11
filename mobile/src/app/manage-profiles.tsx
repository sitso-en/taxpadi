import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import BottomSheet from "@/components/BottomSheet";
import { useToast } from "@/context/ToastContext";
import {
  createProfile,
  updateProfile,
  deleteProfile,
  getProfiles,
  switchProfile,
} from "@/services/profile.service";

type Profile = {
  profileId: string;
  label: string;
  taxpayerCategory: string;
  tin: string | null;
  activeProfile: boolean;
  createdAt: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  individual: "Individual",
  sole_trader: "Sole Trader",
  small_business: "Small Business",
};

const CATEGORIES = ["individual", "sole_trader", "small_business"] as const;

export default function ManageProfilesScreen() {
  const { showToast } = useToast();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<string>("individual");
  const [tin, setTin] = useState("");

  const [editTarget, setEditTarget] = useState<Profile | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editCategory, setEditCategory] = useState<string>("individual");
  const [editTin, setEditTin] = useState("");
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getProfiles();
      const raw: any[] = res.data?.profiles ?? res.profiles ?? [];
      // API serializes snake_case — map to the local Profile shape
      setProfiles(
        raw.map((p) => ({
          profileId: p.profile_id,
          label: p.label,
          taxpayerCategory: p.taxpayer_category,
          tin: p.tin ?? null,
          activeProfile: p.active_profile ?? false,
          createdAt: p.created_at,
        }))
      );
    } catch {
      showToast("Failed to load profiles.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSwitch = async (id: string) => {
    setSwitching(id);
    try {
      await switchProfile(id);
      setProfiles((prev) =>
        prev.map((p) => ({ ...p, activeProfile: p.profileId === id }))
      );
      showToast("Profile switched successfully.", "success");
    } catch {
      showToast("Failed to switch profile.", "error");
    } finally {
      setSwitching(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.profileId);
    setDeleteTarget(null);
    try {
      await deleteProfile(deleteTarget.profileId);
      setProfiles((prev) => prev.filter((p) => p.profileId !== deleteTarget.profileId));
      showToast("Profile deleted.", "success");
    } catch {
      showToast("Failed to delete profile.", "error");
    } finally {
      setDeleting(null);
    }
  };

  const openEdit = (profile: Profile) => {
    setEditTarget(profile);
    setEditLabel(profile.label);
    setEditCategory(profile.taxpayerCategory);
    setEditTin(profile.tin ?? "");
  };

  const handleEdit = async () => {
    if (!editTarget || !editLabel.trim()) {
      showToast("Profile label is required.", "error");
      return;
    }
    setEditing(true);
    try {
      await updateProfile(editTarget.profileId, {
        label: editLabel.trim(),
        taxpayerCategory: editCategory,
        tin: editTin.trim() || undefined,
      });
      setProfiles((prev) =>
        prev.map((p) =>
          p.profileId === editTarget.profileId
            ? { ...p, label: editLabel.trim(), taxpayerCategory: editCategory, tin: editTin.trim() || null }
            : p
        )
      );
      setEditTarget(null);
      showToast("Profile updated.", "success");
    } catch {
      showToast("Failed to update profile.", "error");
    } finally {
      setEditing(false);
    }
  };

  const handleCreate = async () => {
    if (!label.trim()) {
      showToast("Profile label is required.", "error");
      return;
    }
    setCreating(true);
    try {
      await createProfile({
        label: label.trim(),
        taxpayerCategory: category,
        tin: tin.trim() || undefined,
      });
      setShowCreate(false);
      setLabel("");
      setTin("");
      setCategory("individual");
      showToast("Profile created.", "success");
      load();
    } catch {
      showToast("Failed to create profile.", "error");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#C44736" />
      </View>
    );
  }

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
        <Text style={styles.title}>Profiles</Text>
      </View>

      <Text style={styles.subtitle}>
        Switch between different tax profiles — personal, business, or sole trader.
      </Text>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowCreate(true)}>
        <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>New Profile</Text>
      </TouchableOpacity>

      {profiles.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="person-outline" size={44} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No profiles yet</Text>
          <Text style={styles.emptySubtitle}>Tap "New Profile" to get started.</Text>
        </View>
      ) : (
        profiles.map((profile) => (
          <View
            key={profile.profileId}
            style={[styles.card, profile.activeProfile && styles.activeCard]}
          >
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={profile.activeProfile ? "#C44736" : "#6B7280"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLabel}>{profile.label}</Text>
                <Text style={styles.cardCategory}>
                  {CATEGORY_LABELS[profile.taxpayerCategory] ?? profile.taxpayerCategory}
                </Text>
                {profile.tin ? (
                  <Text style={styles.cardTin}>TIN · {profile.tin}</Text>
                ) : null}
              </View>
              {profile.activeProfile && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => openEdit(profile)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ marginLeft: 8 }}
              >
                <Ionicons name="create-outline" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {!profile.activeProfile && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.switchBtn, switching === profile.profileId && { opacity: 0.7 }]}
                  onPress={() => handleSwitch(profile.profileId)}
                  disabled={switching !== null}
                >
                  {switching === profile.profileId ? (
                    <ActivityIndicator size="small" color="#C44736" />
                  ) : (
                    <>
                      <Ionicons name="swap-horizontal-outline" size={16} color="#C44736" />
                      <Text style={styles.switchBtnText}>Switch to this</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteBtn, deleting === profile.profileId && { opacity: 0.7 }]}
                  onPress={() => setDeleteTarget(profile)}
                  disabled={deleting !== null}
                >
                  {deleting === profile.profileId ? (
                    <ActivityIndicator size="small" color="#6B7280" />
                  ) : (
                    <Ionicons name="trash-outline" size={18} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}

      {/* Edit profile sheet */}
      <BottomSheet visible={!!editTarget} onClose={() => setEditTarget(null)} avoidKeyboard>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Edit Profile</Text>

          <Text style={styles.inputLabel}>Label</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Personal, Business"
            placeholderTextColor="#9CA3AF"
            value={editLabel}
            onChangeText={setEditLabel}
          />

          <Text style={styles.inputLabel}>Category</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.categoryChip, editCategory === c && styles.categoryChipActive]}
                onPress={() => setEditCategory(c)}
              >
                <Text style={[styles.categoryChipText, editCategory === c && styles.categoryChipTextActive]}>
                  {CATEGORY_LABELS[c]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>TIN (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. C0012345678"
            placeholderTextColor="#9CA3AF"
            value={editTin}
            onChangeText={setEditTin}
            autoCapitalize="characters"
          />

          <TouchableOpacity
            style={[styles.saveBtn, (!editLabel.trim() || editing) && { opacity: 0.6 }]}
            onPress={handleEdit}
            disabled={!editLabel.trim() || editing}
            activeOpacity={0.85}
          >
            {editing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <ConfirmModal
        visible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        iconName="trash-outline"
        title="Delete Profile?"
        message={`"${deleteTarget?.label}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />

      {/* Create profile modal */}
      <Modal
        visible={showCreate}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreate(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { alignItems: "stretch" }]}>
            <Text style={styles.modalTitle}>New Profile</Text>
            <Text style={styles.modalText}>Give your profile a name and category.</Text>

            <TextInput
              style={styles.input}
              placeholder="Label (e.g. Personal, Business)"
              placeholderTextColor="#9CA3AF"
              value={label}
              onChangeText={setLabel}
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.categoryChip, category === c && styles.categoryChipActive]}
                  onPress={() => setCategory(c)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === c && styles.categoryChipTextActive,
                    ]}
                  >
                    {CATEGORY_LABELS[c]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="TIN (optional)"
              placeholderTextColor="#9CA3AF"
              value={tin}
              onChangeText={setTin}
              autoCapitalize="characters"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowCreate(false);
                  setLabel("");
                  setTin("");
                  setCategory("individual");
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmDeleteButton, { backgroundColor: "#C44736" }]}
                onPress={handleCreate}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmDeleteText}>Create</Text>
                )}
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

  centered: {
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 24,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginLeft: 10,
  },

  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
    lineHeight: 18,
  },

  addButton: {
    backgroundColor: "#C44736",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    marginLeft: 8,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ECECEC",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  activeCard: {
    borderWidth: 2,
    borderColor: "#C44736",
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  cardLabel: {
    fontSize: 15,
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  cardCategory: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },

  cardTin: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },

  activeBadge: {
    backgroundColor: "#FCE8E6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  activeBadgeText: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },

  actions: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },

  switchBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FCE8E6",
    borderRadius: 10,
    paddingVertical: 10,
  },

  switchBtnText: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    marginLeft: 6,
  },

  deleteBtn: {
    width: 42,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
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
    marginTop: 8,
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

  input: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#111827",
    marginBottom: 14,
  },

  inputLabel: {
    fontFamily: "Inter_500Medium",
    color: "#374151",
    fontSize: 13,
    marginBottom: 8,
    alignSelf: "flex-start",
  },

  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
    width: "100%",
  },

  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#EDE8E3",
  },

  categoryChipActive: {
    backgroundColor: "#C44736",
  },

  categoryChipText: {
    fontFamily: "Inter_500Medium",
    color: "#111827",
    fontSize: 12,
  },

  categoryChipTextActive: {
    color: "#FFFFFF",
  },

  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: "#C44736",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#C44736",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});