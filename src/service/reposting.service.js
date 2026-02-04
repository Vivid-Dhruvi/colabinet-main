import { getOriginUrl } from "@/lib/config";

export const getReportingDetails = async (token) => {
  const url = `${getOriginUrl()}/api/business/report`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error_meessage = await response.json();
      throw new Error(error_meessage.message);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const createBusinessArea = async (token, data) => {
  const url = `${getOriginUrl()}/api/business-area/store`;

  const formData = new FormData();
  formData.append("name", data.name);
  if (data.logo) {
    formData.append("logo", data.logo);
  }

  if (data.template_id) {
    formData.append("template_id", data.template_id);
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error_meessage = await response.json();
      throw new Error(error_meessage.message);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const createBusinessSearch = async (token, data) => {
  const { workFlowID, search } = data;
  const url = `${getOriginUrl()}/api/workflow/job/form/details?workFlowID=${workFlowID}&search=${search}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error_meessage = await response.json();
      throw new Error(error_meessage.message);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const updateBusinessArea = async (token, data, id) => {
  const url = `${getOriginUrl()}/api/business-area/update/${id}`;

  const formData = new FormData();
  formData.append("name", data.name);
  if (data.logo) {
    formData.append("logo", data.logo);
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error_meessage = await response.json();
      throw new Error(error_meessage.message);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const deleteBusinessArea = async (token, id) => {
  const url = `${getOriginUrl()}/api/business-area/delete/${id}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error_meessage = await response.json();
      throw new Error(error_meessage.message);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getBusinessAreaTemplate = async (token) => {
  const url = `${getOriginUrl()}/api/business-overview/templates`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error_meessage = await response.json();
      throw new Error(error_meessage.message);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getNNotificationList = async (token) => {
  const url = `${getOriginUrl()}/api/notifications-list`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error_meessage = await response.json();
      throw new Error(error_meessage.message);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const changeCompleteStatus = async (token, data) => {
  const url = `${getOriginUrl()}/api/save/card/completed/flag`;

  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error_meessage = await response.json();
      throw new Error(error_meessage.message);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const createWorkFlow = async (token, data) => {
  const url = `${getOriginUrl()}/api/create/workflow`;

  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error_meessage = await response.json();
      throw new Error(error_meessage.message);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const manualChainedWorkflow = async (token, data) => {
  const url = `${getOriginUrl()}/api/chain/workflow`;

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error_meessage = await response.json();
      throw new Error(error_meessage.message);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
