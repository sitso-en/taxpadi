import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, View } from "react-native";
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

function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      style={[styles.container, { bottom: Math.max(insets.bottom, 16) + 16 }]}
      pointerEvents="none"
    >
      {toasts.map((toast) => (
        <View
          key={toast.id}
          style={[
            styles.toast,
            toast.type === "success"
              ? styles.success
              : toast.type === "info"
              ? styles.info
              : styles.error,
          ]}
        >
          <Text style={styles.text} numberOfLines={3}>
            {toast.message}
          </Text>
        </View>
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
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2500);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      <View style={styles.fill}>
        {children}
        <ToastContainer toasts={toasts} />
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
    gap: 8,
    zIndex: 9999,
  },
  toast: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  success: {
    backgroundColor: "#676e65",
    borderLeftWidth: 4,
    borderLeftColor: "#38b95b",
  },
  error: {
    backgroundColor: "#676e65",
    borderLeftWidth: 4,
    borderLeftColor: "#C44736",
  },
  info: {
    backgroundColor: "#676e65",
    borderLeftWidth: 4,
    borderLeftColor: "#6681ad",
  },
  text: {
    color: "#FFFFFF",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 20,
  },
});
