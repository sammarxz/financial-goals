import React from "react";

import { useUserStore } from "../stores/userStore";
import { useNotificationStore } from "../stores/notificationStore";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useUserStore();
  useNotificationStore();

  return <>{children}</>;
}
