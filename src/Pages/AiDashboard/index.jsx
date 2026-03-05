import { MainContext } from "@/App";
import BusinessChat from "@/components/BusinessOverview/BusinessChat";
import WalkThroughPopup from "@/components/BusinessOverview/DisplayWalkThrough";
import IntroColabi from "@/components/General/IntroColabi";
import { StageMobile } from "@/components/Roadmap/StagesMobile";
import { getOriginUrl, stages, videoLinks } from "@/lib/config";
import { cn, notallowUserToAccess } from "@/lib/utils";
import { skipIntoView, updateViewPopup } from "@/service/general.service";
import React, { useContext, useEffect, useState } from "react";

function AiDashBoard() {
  const current_sidebar_status = sessionStorage.getItem("sidebar-state") || 1;
  const { user, token } = useContext(MainContext);

  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = React.useState(current_sidebar_status == 1 ? true : false);
  const [guide, setGuide] = useState({
    video: user?.role_id == 7 ? videoLinks.dash_board.member : videoLinks.dash_board.non_member,
    open: false,
  });
  const [open, setOpen] = React.useState(false);
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
  const handleBusinessOverview = () => {
    const params = new URLSearchParams(window.location.search);
    window.location.href = `${getOriginUrl()}/business/overview?${params.toString()}`;
  };

  const handlePath = () => {
    const params = new URLSearchParams(window.location.search);
    window.location.href = `${getOriginUrl()}/business/setup?${params.toString()}`;
  };
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (user && user?.view_dashboard_popup == 0 && !notallowUserToAccess(user, [6])) {
      setSidebarOpen(false);
      localStorage.setItem("sidebar-state", 0);
      setGuide({
        open: true,
        ...stages[2],
      });

      if (token) {
        updateViewPopup(token, {
          view_dashboard_popup: "1",
        });
      }
    }
  }, [user]);

  useEffect(() => {
    const reactRoot = document.getElementById("react_root");
    if (reactRoot) {
      reactRoot.classList.add("col-main-wrap");
    }
    return () => {
      const reactRoot = document.getElementById("react_root");
      if (reactRoot) {
        reactRoot.classList.remove("col-main-wrap");
      }
    };
  }, []);

  useEffect(() => {
    const reactRoot = document.getElementById("react_root");
    if (reactRoot) {
      if (!sidebarOpen) {
        reactRoot.classList.add("main-side-collapse", "z-10");
      } else {
        reactRoot.classList.remove("main-side-collapse", "z-10");
      }
    }
  }, [sidebarOpen]);

  useEffect(() => {
      if (user) {
        if (user?.colabi_overview_video_seen == 0 && user?.role_id == 7 && user?.permission_type == 1) {
          setOpen(true);
          skipIntoView(token);
        }
      }
    }, [user]);

  const handleShowVideo = (open, number) => {
    //setSidebarOpen(open);
    //localStorage.setItem("sidebar-state", 1);
    let video = stages[2];
    if (number) {
      video = stages.find((stage) => stage.number === number) || stages[0];
    }

    setGuide((prev) => ({
      ...prev,
      open: open,
      ...video,
    }));
  };

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      sessionStorage.setItem("sidebar-state", 0);
    }
  }, [isMobile]);

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
    user &&
    user?.role_id != 6 && (
      <>
      <div className="clb-aside-wrapper">
        {guide.open && <span className="clb-guide-block"></span>}
        <BusinessChat
          sidebarOpen={sidebarOpen}
          setSidebarOpen={(val) => {
            setSidebarOpen(val);
            sessionStorage.setItem("sidebar-state", val == true ? 1 : 0);
          }}
          guide={guide}
          isMobile={isMobile}
          handleShowVideo={handleShowVideo}
        />
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
      </div>
      </>
    )
  );
}

export default AiDashBoard;
