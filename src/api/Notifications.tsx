import { GLOBAL_URL } from "../../utils"

export const getNotificationHistory = async (
    // page: number,
    // limit: number,  have to implement
    token: string,
    onSucess = (data: any) => { },
    onError = () => { }
) => {
    try {
        const url = `${GLOBAL_URL}/notifications/all`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        });

        const data = await response.json();

        if (response.status === 200) {
            onSucess(data);
        } else {
            onError();
        }

        return {
            data: data,
            status: response.status
        };
    } catch (e) {
        console.log(e);
        onError();
        return {};
    }
}


export const fetchNotificationsByType = (
    type_name,
    token,
    onSuccess,
    onError
) => {
    if (!token) {
        onError({ message: 'Authentication token is missing.' });
        return;
    }

    fetch(`${GLOBAL_URL}/notifications/by-type/${type_name}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    })
        .then(async (response) => {
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || response.statusText);
            }

            onSuccess(data);
        })
        .catch((error) => {
            onError({ message: error.message });
        });
};




export const fetchNotificationById = (
    recipient_id,
    token,
    onSuccess,
    onError
) => {
    if (!token) {
        onError({ message: 'Authentication token is missing.' });
        return;
    }

    fetch(`${GLOBAL_URL}/notifications/by-id/${recipient_id}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    })
        .then(async (response) => {
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || response.statusText);
            }

            onSuccess(data);
        })
        .catch((error) => {
            onError({ message: error.message });
        });
};

