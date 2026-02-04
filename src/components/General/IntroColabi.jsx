import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { videoLinks } from "@/lib/config";
import { ArrowRight } from "lucide-react";

function IntroColabi({ open, setIsOpen, handleSkipSubmit }) {
  const handleSkip = async () => {
    setIsOpen(false);
    handleSkipSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={() => handleSkip(false)}>
      <DialogContent className="max-w-[96%] md:max-w-2xl max-h-[96svh] p-0 border-0 overflow-visible shadow-[0px_25px_50px_0px_#00000040] gap-0 [&>button]:size-6 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:opacity-100 [&>button>svg]:size-full [&>button]:rounded-full [&>button]:-top-2.5 [&>button]:-right-2.5 [&>button]:text-white [&>button]:bg-[#49b8bf]">
        <DialogHeader className={"bg-[linear-gradient(99.35deg,_#FA8B64_8.18%,_#49B8BF_95.42%)] py-11 gap-2.5 rounded-t-lg"}>
          <img src="/images/fullhand.png" className="w-20 mx-auto" />
          <DialogTitle className="text-center text-white font-bold text-2xl lg:text-3xl">Welcome to Colabi!</DialogTitle>
          <p className="max-w-[482px] mx-auto text-white font-normal text-base lg:text-lg leading-normal text-center mb-0">
            I'm Colabi-roo, your AI guide. Watch this short video to understand the big idea behind Colabi.
          </p>
        </DialogHeader>

        <div className="popupBody text-center p-8 flex flex-col gap-4">
          <div className="relative">
            <iframe
              title="vimeo-player"
              src={videoLinks.intro_video}
              width="100%"
              height="360"
              frameborder="0"
              referrerpolicy="strict-origin-when-cross-origin"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              className="rounded-2xl aspect-video overflow-hidden"
              allowFullScreen
            ></iframe>
          </div>
          {/* <Button className="w-full py-4 text-lg font-semibold bg-[#FA8B64] hover:bg-[#fa8b64] text-white rounded-xl" onClick={handleSkip}>
              Watch the Overview
            </Button>

            <Button
              variant={"ghost"}
              onClick={() => setLearnMoreColabi(false)}
              className={"underline w-full block font-medium text-[#2BA7B3] hover:bg-transparent 2xl:text-xl mt-2"}
            >
              Learn more about how Colabi works
            </Button> */}
          <Button className={"bg-[#fa8b64] hover:bg-[#fa8b64] text-white rounded-lg p-2"} onClick={handleSkip}>
            <ArrowRight />
          </Button>
        </div>

        {/* <div className="popupBody text-center px-8 py-8 flex flex-col">
            <video id="overviewVideo" className="rounded-2xl" width="100%" controls autoPlay muted playsInline>
              <source src="colabi_video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <ul className="flex flex-wrap items-center justify-center gap-2 lg:gap-3 2xl:gap-4 mt-6">
              <li>
                <Button
                  className={
                    "bg-[#F6F7F7] text-sm xl:text-base 2xl:text-lg font-normal border-[#DCDCDD] text-[#2F2F2F] hover:bg-[#F6F7F7] hover:border-[#DCDCDD] hover:text-[#2F2F2F]"
                  }
                >
                  What is Colabi?
                </Button>
              </li>
              <li>
                <Button
                  className={
                    "bg-[#F6F7F7] text-sm xl:text-base 2xl:text-lg font-normal border-[#DCDCDD] text-[#2F2F2F] hover:bg-[#F6F7F7] hover:border-[#DCDCDD] hover:text-[#2F2F2F]"
                  }
                >
                  How Workflows Work
                </Button>
              </li>
              <li>
                <Button
                  className={
                    "bg-[#F6F7F7] text-sm xl:text-base 2xl:text-lg font-normal border-[#DCDCDD] text-[#2F2F2F] hover:bg-[#F6F7F7] hover:border-[#DCDCDD] hover:text-[#2F2F2F]"
                  }
                >
                  Meet Your Al Team
                </Button>
              </li>
              <li>
                <Button
                  className={
                    "bg-[#F6F7F7] text-sm xl:text-base 2xl:text-lg font-normal border-[#DCDCDD] text-[#2F2F2F] hover:bg-[#F6F7F7] hover:border-[#DCDCDD] hover:text-[#2F2F2F]"
                  }
                >
                  Your Dashboard
                </Button>
              </li>
            </ul>
            <Button
              onClick={() => setLearnMoreColabi(true)}
              className={
                "bg-[#2BA7B3] text-[#B8E0E4] border border-solid border-transparent hover:bg-[#F6F7F7] hover:text-[#2F2F2F] hover:border-[#2F2F2F] 2xl:min-w-[263px] 2xl:text-xl 2xl:py-4 mt-6 2xl:mt-8 block ml-auto"
              }
            >
              Back
            </Button>
          </div> */}
      </DialogContent>
    </Dialog>
  );
}

export default IntroColabi;
