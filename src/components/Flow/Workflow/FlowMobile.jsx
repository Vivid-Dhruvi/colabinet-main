import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import React, { useContext, useEffect } from "react";
import Flow from "../Flow";
import { ReactFlowProvider } from "@xyflow/react";
import { BusinessContext } from "@/Pages/layouts/BusinessLayout";
import { getReportingDetails } from "@/service/reposting.service";
import { MainContext } from "@/App";
import { getOriginUrl } from "@/lib/config";

function FlowMobile({ reportData, currentPath, setCurrnetPath, sidebarOpen, setSidebarOpen, openAccordion, setOpenAccordion }) {
  const { setReportData } = useContext(BusinessContext);
  const { token } = useContext(MainContext);
  const [loading, setLoading] = React.useState(false);

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

  return (
    <div className="w-full border border-solid border-[#9CA3AF] rounded-md md:p-2 md:hidden flex flex-col gap-2.5 grow">
      <Accordion className="grow flex flex-col" type="single" value={openAccordion} collapsible>
        <AccordionItem value="item-1" className={"grow flex flex-col [&>div[data-state]]:flex [&>div[data-state]]:flex-col [&>div[data-state]]:grow"}>
          <div
            onClick={() => setOpenAccordion(openAccordion ? "" : "item-1")}
            className={"flex flex-wrap gap-1 items-center bg-[#F7FAFF] rounded-t-md h-fit p-2 text-sm hover:no-underline font-semibold text-[#5E5E69] relative"}
          >
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="block size-5 shrink-0">
              <path
                d="M4.06104 20.035C3.51104 20.035 3.0402 19.8392 2.64854 19.4475C2.25687 19.0559 2.06104 18.585 2.06104 18.035V6.03503C2.06104 5.48503 2.25687 5.0142 2.64854 4.62253C3.0402 4.23087 3.51104 4.03503 4.06104 4.03503H9.23604C9.5027 4.03503 9.75687 4.08503 9.99854 4.18503C10.2402 4.28503 10.4527 4.4267 10.636 4.61003L12.061 6.03503H21.061C21.3444 6.03503 21.5819 6.13087 21.7735 6.32253C21.9652 6.5142 22.061 6.7517 22.061 7.03503C22.061 7.31837 21.9652 7.55587 21.7735 7.74753C21.5819 7.9392 21.3444 8.03503 21.061 8.03503H7.91104C6.8777 8.03503 5.9777 8.36003 5.21104 9.01003C4.44437 9.66003 4.06104 10.485 4.06104 11.485V18.035L6.03604 11.46C6.16937 11.0267 6.4152 10.6809 6.77354 10.4225C7.13187 10.1642 7.5277 10.035 7.96104 10.035H20.861C21.5444 10.035 22.0819 10.3059 22.4735 10.8475C22.8652 11.3892 22.9694 11.9767 22.786 12.61L20.986 18.61C20.8527 19.0434 20.6069 19.3892 20.2485 19.6475C19.8902 19.9059 19.4944 20.035 19.061 20.035H4.06104Z"
                fill="#8C8E9D"
              />
            </svg>
            <p className="w-1/3 grow font-semibold text-[12px]">Your Business Overview</p>
            <button className="font-medium flex items-center justify-between gap-3 bg-[#007d88] text-white px-2 py-1 rounded-full shadow-md transition">
              <span className="text-[10px] flex gap-1">{openAccordion === "item-1" ? "Switch To Chat Mode" : "Switch To Manual Mode"}</span>
              <img src="/images/chat-switch.png" className="h-3.5 max-w-full block" alt="chat icon" />
            </button>
          </div>
          <AccordionContent className={"shadow-[inset_0_4px_4px_0_rgba(0,0,0,0.1)] grow flex flex-col"}>
            <div className="h-[calc(100vh-320px)] grow overflow-auto">
              <ReactFlowProvider>
                <Flow
                  reportData={reportData}
                  currentPath={currentPath}
                  setCurrnetPath={setCurrnetPath}
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={(val) => {
                    setSidebarOpen(val);
                    sessionStorage.setItem("sidebar-state", val == true ? 1 : 0);
                  }}
                  handleGetData={handleGetData}
                />
              </ReactFlowProvider>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div
        className="flex flex-row items-center shrink-0 gap-2.5 md:gap-4 text-xs px-2 pb-2"
        onClick={() => {
          window.location.href = `${getOriginUrl()}/ai-dashboard`;
        }}
      >
        <Button className={"bg-[#F88B62] text-[#F5D8C3]"}>&gt; Step 3</Button>
        <p className="text-[#8C8C92] font-semibold leading-normal">Next Step: Business Overview-See Your Business In One View</p>
      </div>
    </div>
  );
}

export default FlowMobile;
