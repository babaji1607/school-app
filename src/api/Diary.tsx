import { GLOBAL_URL } from "../../utils";

export interface DiaryItem {
  id: string;
  title: string;
  description: string;
  classname: string;
  file_url: string;
  creation_date: string;
}

export interface DiaryResponse {
  total: number;
  offset: number;
  limit: number;
  items: DiaryItem[];
}


export const getDiaryByClass = async (
  classname: string,
  offset: number,
  limit: number,
  token: string,
  onSuccess: (data: DiaryResponse) => void = () => { },
  onError: (error?: any) => void = () => { }
): Promise<{ data?: DiaryResponse; status?: number }> => {
  try {
    const url = `${GLOBAL_URL}/diary/by-class?classname=${encodeURIComponent(
      classname
    )}&offset=${offset}&limit=${limit}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data: DiaryResponse = await response.json();

    if (response.ok) {
      onSuccess(data);
      return { data, status: response.status };
    } else {
      onError(data);
      return { data, status: response.status };
    }
  } catch (error) {
    console.error("Fetch diary by class failed:", error);
    onError(error);
    return {};
  }
};


export async function uploadDiaryEntry({
  title,
  classname,
  teacherName,
  description,
  file,
  token,
}: {
  title: string;
  classname: string;
  teacherName: string;
  description?: string;
  file: File | null;
  token: string;
}): Promise<void> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("classname", classname);
  formData.append("teacher_name", teacherName); // This must match what the FastAPI backend expects
  if (description) formData.append("description", description);
  if (file) {
    formData.append("raw_file", file);
  }

  try {
    const response = await fetch(`${GLOBAL_URL}/diary/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // ❌ DO NOT manually set 'Content-Type' when using FormData
        // browser will set it with proper boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to upload diary: ${response.status} - ${errorBody.detail || response.statusText}`
      );
    }

    const result = await response.json();
    console.log("✅ Diary uploaded successfully:", result);
  } catch (error) {
    console.error("❌ Error uploading diary:", error instanceof Error ? error.message : error);
  }
}



type DiaryEntry = {
  id: string;
  title: string;
  description?: string;
  classname: string;
  teacher_name: string;
  file_url?: string;
  creation_date: string;
};

type DiaryPaginationResponse = {
  total: number;
  offset: number;
  limit: number;
  items: DiaryEntry[];
};

export async function fetchDiaryEntriesByTeacher({
  teacherName,
  token,
  offset = 0,
  limit = 10,
}: {
  teacherName: string;
  token: string;
  offset?: number;
  limit?: number;
}): Promise<DiaryPaginationResponse | null> {
  const url = new URL(`${GLOBAL_URL}/diary/by-teacher`);
  url.searchParams.append("teacher_name", teacherName);
  url.searchParams.append("offset", offset.toString());
  url.searchParams.append("limit", limit.toString());

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to fetch diary entries: ${response.status} - ${errorBody.detail || response.statusText}`
      );
    }

    const data: DiaryPaginationResponse = await response.json();
    console.log("✅ Diary entries fetched:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching diary entries:", error instanceof Error ? error.message : error);
    return null;
  }
}
