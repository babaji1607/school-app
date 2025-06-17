import { GLOBAL_URL } from "../../utils"

export const getAllReceipts = async (
    page: number,
    limit: number,
    token: string,
    onSucess = (data: any) => { },
    onError = () => { }
) => {
    try {
        const url = `${GLOBAL_URL}/fee-receipts?page=${page}&limit=${limit}`;

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


export const createFeeReceipt = (
    data,
    token,
    onSuccess,
    onError
) => {
    if (!token) {
        onError({ message: 'Authentication token is missing.' });
        return;
    }

    fetch(`${GLOBAL_URL}/fee-receipts/`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    })
        .then(async (response) => {
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.detail || response.statusText);
            }

            onSuccess(responseData);
        })
        .catch((error) => {
            onError({ message: error.message });
        });
};


export const fetchFeeReceiptsByStudent = (
    studentId,
    page,
    limit,
    token,
    onSuccess,
    onError
) => {
    if (!token) {
        onError({ message: 'Authentication token is missing.' });
        return;
    }

    const url = `${GLOBAL_URL}/fee-receipts/student/${studentId}?page=${page}&limit=${limit}`;

    fetch(url, {
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
