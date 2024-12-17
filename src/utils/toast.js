import { toast } from "react-toastify";

export const showToast = (message, type = "info") => {
  console.log(`Attempting to show toast: ${message} (${type})`);
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "warning":
      toast.warn(message);
      break;
    default:
      toast.info(message);
  }
};
