import { getOriginUrl } from "@/lib/config";

export const skipIntoView = async (token) => {
  const url = `${getOriginUrl()}/api/save/colabi-overview-video-status`;

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

export const UpdateProfile = async (token, payload) => {
  const url = `${getOriginUrl()}/api/user/name/image/update`;

  const formData = new FormData();
  formData.append("name", payload.name);
  if (payload.logo) {
    formData.append("avatar", payload.logo);
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
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

export const saveDraftDetails = async (token, body) => {
  const url = `${getOriginUrl()}/api/save/canvas/workflows`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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

export const saveCardPosition = async (token, data) => {
  const url = `${getOriginUrl()}/api/save/card/position`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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

export const getUsesrDetails = async (token) => {
  const url = `${getOriginUrl()}/api/user/profile`;

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

export const getUsesrParmission = async (token) => {
  const url = `${getOriginUrl()}/api/user/permissions`;

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

export const saveCardCollapse = async (token, data) => {
  const url = `${getOriginUrl()}/api/save/card/collapse`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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

export const saveBusinessPlan = async (token, data) => {
  const url = `${getOriginUrl()}/api/save/business-plan`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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

export const getMyMembers = async (token) => {
  const url = `${getOriginUrl()}/api/get/members`;

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

    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getBusinessType = async (token) => {
  const url = `${getOriginUrl()}/api/get/business-type`;

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

export const addHourlyRate = async (token, data) => {
  const url = `${getOriginUrl()}/api/switch-account`;

  const queryParams = new URLSearchParams(data).toString();
  const urlWithParams = `${url}?${queryParams}`;

  try {
    const response = await fetch(urlWithParams, {
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

    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const deleteWorkFlowService = async (token, id) => {
  const url = `${getOriginUrl()}/api/delete/workflow/${id}`;

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

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteWorkFlowTask = async (token, id) => {
  const url = `${getOriginUrl()}/api/delete/task/${id}`;

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

    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const changeWorkFlowView = async (token, uuid, data) => {
  const url = `${getOriginUrl()}/api/update/canvas_view/${uuid}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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

export const updateViewPopup = async (token, data) => {
  const url = `${getOriginUrl()}/api/user/update-view`;

  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error_meessage = await response.json();
      throw new Error(error_meessage.message);
    }

    const result = await response.json();
    if (result.success) {
      return result?.data?.transferable_workflows || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const uploadFileService = async (token, formData) => {
  const url = `${getOriginUrl()}/api/cloud/file/store`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error_meessage = await response.json();
      throw new Error(error_meessage.message);
    }

    const result = await response.json();
    if (result.success) {
      return result?.data || {};
    }
    return [];
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const handleWorkflowStatusChange = async (token, body) => {
  const url = `${getOriginUrl()}/api/workflow/status/save`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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

export const getUserLimits = async (token) => {
  const url = `${getOriginUrl()}/api/user/check-limits?key=workflow`;

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

export const loginusercheck = async () => {
  const url = `${getOriginUrl()}/user/auth/token`;

  try {
    const response = await fetch(url, {
      method: "GET",
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

export const logoutUser = async (token) => {
  const url = `${getOriginUrl()}/api/logout/user`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
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

export const getWorkFlowdetails = async (token, body) => {
  const url = `${getOriginUrl()}/api/get/workflow/details?${body.workflow_id ? `workflow_id=${body.workflow_id}` : ""}${body.instance_id ? `instance_id=${body.instance_id}` : ""}`;

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

    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const changeWorkflowType = async (token, body) => {
  let url = `${getOriginUrl()}/api/change/workflow/type`;
  //add qyery params
  url += `?uuid=${body.uuid}&workflow_type=${body.workflow_type}`;

  try {
    const response = await fetch(url, {
      method: "get",
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
