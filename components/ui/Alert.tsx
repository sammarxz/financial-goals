import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

interface AlertProps {
  children: React.ReactNode;
  variant?: "default" | "destructive" | "success";
  style?: ViewStyle;
}

interface AlertTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export const Alert = React.forwardRef<View, AlertProps>(
  ({ children, variant = "default", style, ...props }, ref) => {
    const getVariantStyle = () => {
      switch (variant) {
        case "destructive":
          return styles.destructive;
        case "success":
          return styles.success;
        default:
          return styles.default;
      }
    };

    return (
      <View
        ref={ref}
        style={[styles.alert, getVariantStyle(), style]}
        {...props}
      >
        {children}
      </View>
    );
  }
);

export const AlertTitle = React.forwardRef<Text, AlertTitleProps>(
  ({ children, style, ...props }, ref) => (
    <Text ref={ref} style={[styles.title, style]} {...props}>
      {children}
    </Text>
  )
);

export const AlertDescription = React.forwardRef<Text, AlertTitleProps>(
  ({ children, style, ...props }, ref) => (
    <Text ref={ref} style={[styles.description, style]} {...props}>
      {children}
    </Text>
  )
);

const styles = StyleSheet.create({
  alert: {
    width: "100%",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    flexDirection: "column",
    borderWidth: 1,
  },
  // Variant styles
  default: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  destructive: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },
  success: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },
  // Text styles
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    opacity: 0.9,
  },
});

Alert.displayName = "Alert";
AlertTitle.displayName = "AlertTitle";
AlertDescription.displayName = "AlertDescription";
