// src/utils/toast.js
import { toast } from "sonner";
import { Info, AlertCircle, XCircle, CheckCircle } from "lucide-react";
import "./toast.css";
const ToastIcon = ({ icon: Icon }) => (
  <div className="toast-icon">
    <Icon size={20} strokeWidth={2} />
  </div>
);

const createToastContent = (message, Icon) => (
  <div className="toast-content">
    <ToastIcon icon={Icon} />
    <span className="toast-message">{message}</span>
  </div>
);

export const showToast = (message, type = "info") => {
  const config = {
    duration: 3000,
    className: `sonner-toast-custom toast-${type}`,
    position: "top-right",
  };

  switch (type) {
    case "info":
      toast(createToastContent(message, Info), config);
      break;

    case "warning":
      toast(createToastContent(message, AlertCircle), config);
      break;

    case "error":
      toast(createToastContent(message, XCircle), config);
      break;

    case "success":
      toast(createToastContent(message, CheckCircle), config);
      break;

    default:
      toast(createToastContent(message, Info), {
        ...config,
        className: `sonner-toast-custom toast-info`,
      });
  }
};
