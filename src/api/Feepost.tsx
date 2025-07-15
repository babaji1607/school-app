import { GLOBAL_URL } from "../../utils";

export interface FeePost {
    student_id: string;
    title: string;
    other_fee: Record<string, number>;
    deadline: string;
    is_paid: boolean;
    mode: "online" | "offline";
    id: string;
    creation_date: string;
}

export interface FeePostResponse {
    total: number;
    offset: number;
    limit: number;
    items: FeePost[];
}
export async function getFeePostsByStudent(
    studentId: string,
    token: string,
    offset: number = 0,
    limit: number = 10
): Promise<{ success: boolean; data?: FeePostResponse; message?: string }> {
    const url = `${GLOBAL_URL}/feepost/by-student?student_id=${studentId}&offset=${offset}&limit=${limit}`;

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            return {
                success: false,
                message: error?.detail || `HTTP ${res.status} - ${res.statusText}`,
            };
        }

        const data: FeePostResponse = await res.json();
        return {
            success: true,
            data,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Network error",
        };
    }
}



type UpdateStatusPayload = {
    mode: "online" | "offline";
    is_paid: boolean;
};

export async function updateFeePostStatus(
    feePostId: string,
    payload: UpdateStatusPayload,
    token: string
): Promise<void> {
    const url = `${GLOBAL_URL}/feepost/${feePostId}/status`;

    try {
        // const token = localStorage.getItem('token')
        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(
                `Failed to update status: ${response.status} ${errorData?.detail || response.statusText
                }`
            );
        }

        console.log("Fee post status updated successfully.");
    } catch (error) {
        console.error("Error updating fee post status:", error);
        throw error;
    }
}
