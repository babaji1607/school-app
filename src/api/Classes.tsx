import { GLOBAL_URL } from "../../utils";

export const createClassroom = async (token, classroomData, onSuccess, onError) => {
    try {
        const response = await fetch(`${GLOBAL_URL}/classrooms/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(classroomData)
        });

        if (response.ok) {
            const data = await response.json();
            onSuccess(data);
        } else {
            const errorData = await response.json();
            onError({
                status: response.status,
                message: errorData?.detail || 'Failed to create classroom',
                data: errorData
            });
        }
    } catch (error) {
        onError({
            status: null,
            message: error.message || 'Network error',
            error
        });
    }
};


export const getAllClassrooms = async (token, offset = 0, limit = 100, onSuccess, onError) => {
    try {
        const url = new URL(`${GLOBAL_URL}/classrooms/showall`);
        url.searchParams.append('offset', offset);
        url.searchParams.append('limit', limit);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            onSuccess(data);
        } else {
            const errorData = await response.json();
            onError({
                status: response.status,
                message: errorData?.detail || 'Failed to fetch classrooms',
                data: errorData
            });
        }
    } catch (error) {
        onError({
            status: null,
            message: error.message || 'Network error',
            error
        });
    }
};

export const deleteClassroom = async (token, classroomId, onSuccess, onError) => {
    try {
        const url = `${GLOBAL_URL}/classrooms/classroom/${classroomId}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json(); // or response.text() if empty response expected
            onSuccess(data);
        } else {
            const errorData = await response.json();
            onError({
                status: response.status,
                message: errorData?.detail || 'Failed to delete classroom',
                data: errorData
            });
        }
    } catch (error) {
        onError({
            status: null,
            message: error.message || 'Network error',
            error
        });
    }
};

export const  fetchClassroomsByTeacher = async (token, teacherId, onSuccess, onError) => {
  const url = `${GLOBAL_URL}/classrooms/by-teacher/${teacherId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      // Trigger error callback with structured error
      return onError({
        status: response.status,
        message: data?.detail || 'Failed to fetch classrooms'
      });
    }

    onSuccess(data);

  } catch (error) {
    // Handle unexpected errors like network issues
    onError({
      status: 500,
      message: error.message || 'An unexpected error occurred'
    });
  }
};
