import { X } from "lucide-react";
import "./DisplayWalkThrough.css";
import React from "react";
import { Button } from "../ui/button";

export default function WalkThroughPopup({ current_stage, onClose, current_page }) {
  const [overviewVideo, setOverviewVideo] = React.useState(null);

  const handleClose = () => {
    onClose?.();
  };

  React.useEffect(() => {
    if (current_stage && current_stage.video_url) {
      setOverviewVideo(current_stage);
    }
  }, [current_stage]);

  if (!current_stage) return null;

  const filteredStages = current_stage.option_videos || [];

  return (
    <div className="business-setup-popup">
      {/* Left Content Section */}
      <div className="business-setup-left">
        <button onClick={handleClose} className="close-btn-mb" aria-label="Close">
          <X className="size-full block text-[#4B5563]" />
        </button>
        <div className="mb-6">
          <span className="business-setup-subtitle">{overviewVideo?.subtitle || current_stage?.subtitle}</span>
          <h1 className="business-setup-title">{overviewVideo?.title}</h1>
          <p>{overviewVideo?.description}</p>
        </div>

        {/* Image or Video Section */}
        {overviewVideo?.video_url && (
          <div className="business-setup-video">
            <iframe src={overviewVideo?.video_url} frameborder="0" width={"100%"} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>
          </div>
        )}

        {/* Additional content area */}
        {/* <div className="build-your-business-brain">
          <p>
            This experience guides you through the essential first steps. You'll learn how to structure your setup and establish the foundation for success.
          </p>
        </div> */}
        <div className="flex justify-center mt-1">
          <Button
            className="bg-[#FA8B64] hover:bg-[#e07a5a] cursor-pointer"
            onClick={handleClose}
          >
            Click Here To Start Stage {current_stage?.number || ""}
          </Button>
        </div>
      </div>

      {/* Right Sidebar Section */}
      <div className="business-setup-right">
        <div className="business-setup-r-head">
          <h2>
           {overviewVideo?.right_title} <span>{overviewVideo?.right_subtitle}</span>
          </h2>
          <button onClick={handleClose} className="close-btn" aria-label="Close">
            <X />
          </button>
        </div>

        {/* Stages List */}
        <div className="business-setup-r-main">
          {filteredStages.map((stage, index) => (
            <div key={index} className="business-setup-r-inner">
              {stage.subtitle && stage.number && (
                <p>
                  Stage {stage.number}: {stage.subtitle}
                </p>
              )}
              <div className="business-setup-r-card" onClick={() => setOverviewVideo(stage)}>
                {stage.image && <img src={stage.image || "/placeholder.svg"} alt={stage.title} />}
                <div className="business-setup-r-card-ctn">
                  <h3 className="ellipses-2">{stage.title}</h3>
                  <p className="ellipses-3">{stage.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {overviewVideo?.sub_option && (
          <div className="clb-back-btn">
            <button className="business-setup-r-btn" onClick={() => setOverviewVideo(current_stage)}>
              {current_page == "business-setup"
                ? "← Back To Stage 1 Business Setup"
                : current_page === "business-overview"
                  ? "← Back To Business Overview Video"
                  : "← Back To Business Dashboard Video"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
