import Flow from "@/components/Flow/Flow";
import React, { useContext, useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { BusinessContext } from "../layouts/BusinessLayout";
import { getReportingDetails } from "@/service/reposting.service";
import { MainContext } from "@/App";
import MainLoader from "@/components/General/MainLoader";

function BusinessOverview() {
  const { currentPath, setCurrnetPath, reportData, setReportData, sidebarOpen, setSidebarOpen, setSelectedBusinessTemplate, refreshData, setRefreshData } =
    useContext(BusinessContext);
  const { token } = useContext(MainContext);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (token) {
      const my_timeout = setTimeout(() => {
        handleGetData();
      }, 300);
      return () => {
        clearTimeout(my_timeout);
      };
    }
  }, [token]);

  useEffect(() => {
    if (refreshData) {
      handleGetData(true);
      setRefreshData(false);
      setSelectedBusinessTemplate("suggested");
    }
  }, [refreshData]);

  useEffect(() => {
    if (reportData && !currentPath) {
      handleGetData(true);
    }
  }, [currentPath]);

  const handleGetData = async (refetch) => {
    if (!refetch) {
      setLoading(true);
    }
    const data = await getReportingDetails(token);
    if (data.success) {
      if (!refetch) {
        setLoading(false);
      }
      setReportData(data?.data);
    }
  };

  return (
    <>
      {loading && <MainLoader />}

      <ReactFlowProvider>
        <Flow
          handleGetData={handleGetData}
          reportData={reportData}
          currentPath={currentPath}
          setCurrnetPath={setCurrnetPath}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={(val) => {
            setSidebarOpen(val);
            sessionStorage.setItem("sidebar-state", val == true ? 1 : 0);
          }}
        />
      </ReactFlowProvider>
    </>
  );
}

export default BusinessOverview;
