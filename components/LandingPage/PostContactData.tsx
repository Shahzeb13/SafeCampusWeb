import axios from "axios";
import toast from "react-hot-toast";

interface ContactData {
    name: string;
    institution: string;
    email: string;
    message: string;
}

export const postContactData = async (data: ContactData) => {
    try {
        const response = await axios.post("http://localhost:5000/api/landing/contact", data);
        if (response.data.success) {
            toast.success(response.data.message);
            return true;
        }
        return false;
    } catch (error: any) {
        const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
        toast.error(errorMsg);
        console.error("Submission error:", error);
        return false;
    }
};