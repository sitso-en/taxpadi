import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const ACCENTS: Record<ToastType, string> = {
  success: "#2FA968",
  error: "#E5574A",
  info: "#6681AD",
};

const ICONS: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: "checkmark-circle",
  error: "alert-circle",
  info: "information-circle",
};

const DURATION = 3000;

function ToastRow({
  toast,
  onHide,
}: {
  toast: ToastItem;
  onHide: (id: number) => void;
}) {
  const translateY = useRef(new Animated.Value(24)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissed = useRef(false);

  const hide = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 12,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => onHide(toast.id));
  }, [onHide, opacity, translateY, toast.id]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 9,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(hide, DURATION);
    return () => clearTimeout(timer);
  }, [hide, opacity, translateY]);

  return (
    <Animated.View
      style={[styles.toast, { opacity, transform: [{ translateY }] }]}
    >
      <Pressable style={styles.toastInner} onPress={hide}>
        <View style={[styles.iconWrap, { backgroundColor: ACCENTS[toast.type] }]}>
          <Ionicons name={ICONS[toast.type]} size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.text} numberOfLines={3}>
          {toast.message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function ToastContainer({
  toasts,
  onHide,
}: {
  toasts: ToastItem[];
  onHide: (id: number) => void;
}) {
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      style={[styles.container, { bottom: Math.max(insets.bottom, 16) + 16 }]}
      pointerEvents="box-none"
    >
      {toasts.map((toast) => (
        <ToastRow key={toast.id} toast={toast} onHide={onHide} />
      ))}
    </View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback(
    (message: string, type: ToastType = "error") => {
      const id = ++nextId.current;
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const hideToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <View style={styles.fill}>
        {children}
        <ToastContainer toasts={toasts} onHide={hideToast} />
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    gap: 10,
    zIndex: 9999,
  },
  toast: {
    borderRadius: 16,
    backgroundColor: "#22262B",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  toastInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    color: "#F5F5F4",
    fontFamily: "Inter_500Medium",
    fontSize: 13.5,
    lineHeight: 19,
  },
});