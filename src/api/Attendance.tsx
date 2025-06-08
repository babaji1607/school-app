import { GLOBAL_URL } from "../../utils"

export const getAttendanceSessions = async (
    page: number,
    limit: number,
    token: string,
    class_name?: string,
    date?: string,            // Expected in 'YYYY-MM-DD' format
    teacher_id?: string,
    onSuccess = (data: any) => { },
    onError = () => { }
) => {
    try {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (class_name) queryParams.append("class_name", class_name);
        if (date) queryParams.append("date", date);
        if (teacher_id) queryParams.append("teacher_id", teacher_id);

        const url = `${GLOBAL_URL}/attendance/sessions/?${queryParams.toString()}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.status === 200) {
            onSuccess(data);
        } else {
            onError();
        }

        return {
            data,
            status: response.status,
        };
    } catch (e) {
        console.error("Error fetching attendance sessions:", e);
        onError();
        return {};
    }
};

export const submitAttendance = async (token, date, teacherId, subject, className, students, onSuccess, onError) => {
    const url = `${GLOBAL_URL}/attendance/`;

    const payload = {
        date,
        teacher_id: teacherId,
        subject,
        class_name: className,
        records: students.map(student => ({
            student_id: student.id,
            status: student.status,
            student_name: student.name
        }))
    };
    // console.log(JSON.stringify(payload))
    // return

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            return onError({
                status: response.status,
                message: data?.detail || 'Failed to submit attendance'
            });
        }

        onSuccess(data);
    } catch (error) {
        console.error('Error submitting attendance:', error);
        onError({
            status: 500,
            message: error.message || 'An unexpected error occurred'
        });
    }
};
