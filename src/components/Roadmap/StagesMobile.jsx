import { cn } from "@/lib/utils";

const stages = ["Setup", "Overview", "Dashboard"];

export function StageMobile({ currentStage, handleStageChange }) {
  return (
    <div className="border-t-2 border-solid border-[#E7E9ED] rounded-t-2xl p-1.5 text-center flex flex-col items-center gap-1 z-10 bg-white">
      
      <h5 className="text-[#1E1E23] text-[13px] font-medium -tracking-wide text-center">
        Stage {currentStage + 1} of {stages.length}
      </h5>

      <ul className="flex flex-wrap items-end justify-center gap-3">
        {stages.map((stage, index) => {
          const stageNumber = index;
          const isActive = stageNumber === currentStage;
          const isCompleted = stageNumber < currentStage;

          return (
            <div key={stage} className="flex items-end gap-3" onClick={() => handleStageChange(index + 1)}>
              <li
                className={cn(
                  "p-1.5 w-fit -tracking-wider font-semibold text-[11px] border-b-2 border-solid transition-all duration-200",
                  isActive && "border-[#5CA28E] text-[#1E1E23]",
                  isCompleted && "border-[#5CA28E]",
                  !isActive && !isCompleted && "border-[#E5E7EB] text-[#9CA3AF]"
                )}
              >
                {stage}
              </li>

              {index < stages.length - 1 && (
                <span className={cn("h-0.5 w-3 bg-[#E5E7EB] shrink-0 mb-3.5", isCompleted && "bg-[#5CA28E]")}></span>
              )}
            </div>
          );
        })}
      </ul>
    </div>
  );
}