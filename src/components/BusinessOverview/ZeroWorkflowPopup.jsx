import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wrench, Check, Brain } from "lucide-react";

const ZeroWorkflowPopup = ({ open, onClose, onSelect }) => {
  const [selectedOption, setSelectedOption] = React.useState(null);

  const handleContinue = () => {
    if (selectedOption) {
      onSelect(selectedOption);
    }
  };

  const CheckItem = ({ text, active }) => (
    <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200
          ${active ? "bg-teal-500" : "bg-gray-300"}
        `}
      >
        <Check className="w-2.5 h-2.5 text-white" />
      </div>
      {text}
    </li>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          w-[95%] max-w-lg sm:max-w-3xl
          max-h-[90vh] overflow-y-auto
          rounded-2xl p-0
        "
      >
        <div className="px-4 py-6 sm:px-8 sm:py-8">

          {/* Stage */}
          <p className="text-[10px] sm:text-xs tracking-wider text-gray-400 text-center mb-2">
            STAGE 2 — BUSINESS OVERVIEW
          </p>

          {/* Title */}
          <h2 className="text-lg sm:text-2xl font-bold text-center mb-3 sm:mb-4 leading-snug">
            How would you like to build your business?
          </h2>

          <p className="text-xs text-gray-400 text-center mb-6 sm:mb-8 px-2">
            Choose how you'd like to create your structure and workflows.
            You can switch anytime.
          </p>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

            {/* AI Card */}
            <div
              onClick={() => setSelectedOption("ai")}
              className={`relative cursor-pointer rounded-xl border p-4 sm:p-6 transition-all duration-200
                ${
                  selectedOption === "ai"
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-200 hover:border-teal-400"
                }`}
            >
              {/* Badge */}
              <div className="absolute -top-2 left-4">
                <span className="bg-teal-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              </div>

              <div className="flex items-start gap-3 mt-3">
                <div
                  className={`p-2 rounded-md transition-all duration-200
                    ${
                      selectedOption === "ai"
                        ? "bg-teal-500"
                        : "bg-gray-100"
                    }`}
                >
                  <Brain
                    className={`w-4 h-4 ${
                      selectedOption === "ai"
                        ? "text-white"
                        : "text-gray-500"
                    }`}
                  />
                </div>

                <h3 className="text-sm sm:text-base font-semibold leading-snug">
                  Build with Your AI Business Coach
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-500 mt-3 mb-4">
                Get guided structure and workflow suggestions tailored to your business.
              </p>

              <ul className="space-y-2">
                <CheckItem
                  text="AI-guided business structure"
                  active={selectedOption === "ai"}
                />
                <CheckItem
                  text="Smart workflow suggestions"
                  active={selectedOption === "ai"}
                />
                <CheckItem
                  text="Strategy based on your setup data"
                  active={selectedOption === "ai"}
                />
              </ul>
            </div>

            {/* Manual Card */}
            <div
              onClick={() => setSelectedOption("manual")}
              className={`cursor-pointer rounded-xl border p-4 sm:p-6 transition-all duration-200
                ${
                  selectedOption === "manual"
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-200 hover:border-teal-400"
                }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-md transition-all duration-200
                    ${
                      selectedOption === "manual"
                        ? "bg-teal-500"
                        : "bg-gray-100"
                    }`}
                >
                  <Wrench
                    className={`w-4 h-4 ${
                      selectedOption === "manual"
                        ? "text-white"
                        : "text-gray-500"
                    }`}
                  />
                </div>

                <h3 className="text-sm sm:text-base font-semibold leading-snug">
                  Build It Yourself
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-500 mt-3 mb-4">
                Manually create your structure and workflows at your own pace.
              </p>

              <ul className="space-y-2">
                <CheckItem
                  text="Full manual control"
                  active={selectedOption === "manual"}
                />
                <CheckItem
                  text="Start from scratch"
                  active={selectedOption === "manual"}
                />
                <CheckItem
                  text="Add workflows directly"
                  active={selectedOption === "manual"}
                />
              </ul>
            </div>
          </div>

          {/* Continue */}
          <div className="text-center">
            <Button
              onClick={handleContinue}
              disabled={!selectedOption}
              className={`w-full sm:w-auto px-8 py-4 sm:py-6 text-sm sm:text-lg rounded-xl font-semibold transition-all duration-200
                ${
                  selectedOption
                    ? "bg-[#F28C63] hover:bg-[#e67e55] text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
            >
              Continue
            </Button>

            <p className="text-xs text-gray-400 mt-4 text-center">
              You can easily change this from within the business overview
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ZeroWorkflowPopup;