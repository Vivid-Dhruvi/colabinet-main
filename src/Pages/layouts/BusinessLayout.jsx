import BusinessChat from "@/components/BusinessOverview/BusinessChat";
import React, { useContext, useEffect, useState } from "react";
import IntroColabi from "@/components/General/IntroColabi";
import { getMyMembers, updateViewPopup } from "@/service/general.service";
import { getOriginUrl, stages, videoLinks } from "@/lib/config";
import { MainHeader } from "@/components/MainHeader/MainHeader";
import { MainContext } from "@/App";
import { skipIntoView } from "@/service/general.service";
import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { businessOverviewPermissionKeys, businessSetupPermissionKeys, cn, isUserAllow, isUserAllowAny } from "@/lib/utils";
import { getBusinessAreaTemplate } from "@/service/reposting.service";
import WalkThroughPopup from "@/components/BusinessOverview/DisplayWalkThrough";
import { StageMobile } from "@/components/Roadmap/StagesMobile";

export const BusinessContext = React.createContext();

function BusinessLayout() {
  const { user, token } = useContext(MainContext);
  const location = useLocation();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const current_sidebar_status = sessionStorage.getItem("sidebar-state") || 1;
  const [sidebarOpen, setSidebarOpen] = React.useState(current_sidebar_status == 1 ? true : false);
  const [common, setCommon] = React.useState({
    clients: [],
    freelancers: [],
    teams: [],
  });
  const [open, setOpen] = React.useState(false);
  const [reportData, setReportData] = React.useState(null);
  const [isBusinessOverview] = React.useState(location.pathname == "/business/overview" ? true : false);
  const isAppView = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(location.search).has("isapp");
  }, [location.search]);
  const [currentPath, setCurrnetPath] = React.useState(sessionStorage.getItem("business-iframe-url") || null);
  const [messageConent, setMessageContent] = React.useState(0);
  const [crScoketMessage, setCRSocketMessage] = React.useState(null);
  const [refreshData, setRefreshData] = React.useState(false);
  const [businessTemplate, setBusinessTemplate] = React.useState([]);
  const [selectedBusinessTemplate, setSelectedBusinessTemplate] = React.useState("0");
  const [currentInnerPath, setCurrentInnerPath] = React.useState(null);
  const [guide, setGuide] = React.useState({
    video: "colabi_video.mp4",
    open: false,
  });
const [type] = useState(
    location.pathname.includes("business/setup")
      ? "business-setup"
      : location.pathname.includes("business/overview")
        ? "business-overview"
        : location.pathname.includes("workflow/On-boarding") ||
            location.pathname.includes("workflow/details") ||
            location.pathname.includes("view/instance")
          ? "ai-workflow"
          : "general-support",
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      sessionStorage.setItem("sidebar-state", 0);
    }
  }, [isMobile]);

  useEffect(() => {
    const currentPath = window.location.pathname + window.location.search;

    const handlePopState = (event) => {
      if (currentPath) {
        event.preventDefault();
        setCurrentInnerPath(null);
        setCurrnetPath(null);
      }
      window.history.pushState(null, "", currentPath);
    };

    window.history.pushState(null, "", currentPath);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [setCurrnetPath]);

  useEffect(() => {
    if (user) {
      if (user?.role_id == 7) {
        const hasBusinessOverviewAccess = isUserAllowAny(user,businessOverviewPermissionKeys);
        const hasBusinessSetupAccess = isUserAllowAny(user, businessSetupPermissionKeys);

        if ((isBusinessOverview && !hasBusinessOverviewAccess) || (!isBusinessOverview && !hasBusinessSetupAccess)) {
          window.location.href = getOriginUrl() + "/ai-dashboard";
        }
      }

      if (user?.colabi_overview_video_seen == 0 && (user?.role_id == 2 || (user?.role_id == 7 && user?.permission_type == 1))) {
        setOpen(true);
        skipIntoView(token);
      }
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      const my_timeout = setTimeout(async () => {
        const entiry = await getMyMembers(token).then((res) => {
          if (res.success) {
            return res.data;
          }
          return null;
        });
        setCommon(entiry);
      }, 300);
      return () => {
        clearTimeout(my_timeout);
      };
    }
  }, [token]);

  useEffect(() => {
    window.parent.postMessage({ type: "redirecthandle" }, "*");
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === "iframe" || event.data.type === "redirecthandle") {
        setMessageContent((x) => x + 1);
        if (event.data.type === "iframe") {
          sessionStorage.removeItem("business-iframe-url");
        }
      }
      if (event.data.type === "URL_CHANGE") {
        sessionStorage.setItem("business-iframe-url", event.data?.payload?.text);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [setMessageContent]);

  useEffect(() => {
    if (messageConent > 1) {
      setCurrentInnerPath(null);
      setCurrnetPath(null);
    }
  }, [messageConent]);

  const handleBusinessOverview = () => {
    const params = new URLSearchParams(window.location.search);
    window.location.href = `${getOriginUrl()}/business/overview?${params.toString()}`;
  };

  const handlePath = () => {
    const params = new URLSearchParams(window.location.search);
    window.location.href = `${getOriginUrl()}/business/setup?${params.toString()}`;
  };

  const handleProfile = () => {
    setCurrnetPath(`${getOriginUrl()}/private-profile?reactframe=true`);
  };

  const handlePermission = () => {
    setCurrnetPath(`${getOriginUrl()}/users/permissions/view?reactframe=true`);
  };

  const handleShowVideo = (open, number) => {
    let video = stages[0];
    if (number) {
      video = stages.find((stage) => stage.number === number) || stages[0];
    } else {
      if (isBusinessOverview) {
        video = stages[1];
      }
    }

    setGuide((prev) => ({
      ...prev,
      open: open,
      ...video,
    }));
  };

  const handleRedirectWorkflow = (url) => {
    setCurrnetPath(url);
  };

  useEffect(() => {
    const timeOut = setTimeout(() => {
      const fetchBusinessTemplate = async () => {
        try {
          const response = await getBusinessAreaTemplate(token);
          const data = await response.data;
          setBusinessTemplate(data.templates);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchBusinessTemplate();
    }, 300);
    return () => clearTimeout(timeOut);
  }, []);

  const handleCurrentInnerPath = (currentLink) => {
    sessionStorage.setItem("business-iframe-url", currentLink);
    setCurrentInnerPath(currentLink);
  };

  const handleBusinessTemplateChange = (templateId) => {
    if(templateId === "suggested"){
      setSidebarOpen(true);
      sessionStorage.setItem("sidebar-state", 1);
    }
    setSelectedBusinessTemplate(templateId);
  }
 const handleStageChange = (stage) => {
    sessionStorage.removeItem("business-iframe-url");
    if (stage == 1) {
      if (handlePath) {
        handlePath("");
      }
    } else if (stage == 2) {
      handleBusinessOverview();
    } else if (stage == 3) {
      window.location.href = `${getOriginUrl()}/ai-dashboard`;
    }
 }
  return (
    <BusinessContext.Provider
      value={{
        handleProfile,
        handlePermission,
        handleBusinessOverview,
        handlePath,
        handleShowVideo,
        setCurrnetPath,
        setCRSocketMessage,
        setReportData,
        setSidebarOpen,
        common,
        reportData,
        sidebarOpen,
        currentPath,
        crScoketMessage,
        isMobile,
        refreshData,
        setRefreshData,
        handleRedirectWorkflow,
        businessTemplate,
        selectedBusinessTemplate,
        handleBusinessTemplateChange,
        handleCurrentInnerPath,
        guide
      }}
    >
      {!isAppView && <MainHeader isBusinessOverview={isBusinessOverview} />}
      <div className="min-h-[350px] h-svh flex flex-wrap pt-12 md:pt-12 lg:pt-16 clb_bg">
        {(!currentInnerPath ||
          (!currentInnerPath.includes("chatlayer/workflow-creation") &&
            !currentInnerPath.includes("workflow/On-boarding") &&
            !currentInnerPath.includes("workflow/details"))) && (
          <BusinessChat
            sidebarOpen={sidebarOpen}
            setSidebarOpen={(val) => {
              setSidebarOpen(val);
              sessionStorage.setItem("sidebar-state", val == true ? 1 : 0);
            }}
            guide={guide}
            isMobile={isMobile}
            reportData={reportData}
            currentPath={currentPath}
            setCurrnetPath={setCurrnetPath}
            handleShowVideo={handleShowVideo}
            handlePath={handlePath}
            setRefreshData={setRefreshData}
            selectedBusinessTemplate={selectedBusinessTemplate}
            handleBusinessTemplateChange={handleBusinessTemplateChange}
            businessTemplate={businessTemplate}
            setCurrentInnerPath={setCurrentInnerPath}
          />
        )}

        {!isMobile && (
          <div className="relative w-2/4 grow text-5xl font-semibold overflow-auto h-full flex flex-col">
            <Outlet />
          </div>
        )}
      </div>
      {guide.open && (
        <span className="fixed hidden lg:block bottom-0 right-0 min-w-screen h-full bg-black/10 backdrop-blur-sm pointer-events-none z-15"></span>
      )}
      {guide.open && (
        <>
          {location.pathname.includes("ai-dashboard") &&
          (user?.role_id === 6 ||
            (user?.role_id === 7 && user?.permission_type === 0)) ? (
            <>
              <div className="clb-video-block clb-walkthrough-video-block">
                <button
                  className={"clb-video-btn"}
                  onClick={() => handleShowVideo(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <iframe
                  src={
                    user?.role_id == 7
                      ? user?.permission_type === 0
                        ? guide.team_member_vurl
                        : guide.member_vurl
                      : guide.non_member_vurl
                  }
                  frameborder="0"
                  width={"100%"}
                  className="overflow-hidden h-56 sm:h-60 md:h-56 lg:h-[315px] xl:h-[460px] 2xl:h-[540px] rounded-2xl lg:min-w-lg xl:min-w-3xl 2xl:min-w-4xl w-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </>
          ) : (
            <div
              className={cn(
                "clb-video-block",
                !sidebarOpen ? "full-video-popup" : "",
              )}
            >
              <WalkThroughPopup
                current_stage={guide}
                onClose={() => handleShowVideo(false)}
                current_page={type}
              />
            </div>
          )}
        </>
      )}
      {isMobile && <StageMobile
              currentStage={
                type === "business-setup"
                  ? 0
                  : type === "business-overview"
                    ? 1
                    : 2
              }
              handleStageChange={handleStageChange}
              currentPath={currentPath}
            />}

      <IntroColabi
        open={open}
        setIsOpen={setOpen}
        handleSkipSubmit={() => {
          handleShowVideo(true);
          setSidebarOpen(false);
          sessionStorage.setItem("sidebar-state", 0);

          if (token) {
            updateViewPopup(token, {
              view_business_setup_popup: "1",
            });
          }
        }}
      />
    </BusinessContext.Provider>
  );
}

export default BusinessLayout;
