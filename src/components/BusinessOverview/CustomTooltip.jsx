import React, { useId, useState } from "react";
import "./CustomTooltip.css";
import { cn } from "@/lib/utils";

export default function CustomTooltip({ variant, content, children }) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();

  const childWithAria = React.isValidElement(children)
    ? React.cloneElement(children, {
        "aria-describedby":
          [children.props["aria-describedby"], isVisible ? tooltipId : null].filter(Boolean).join(" ") || undefined,
      })
    : children;

  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);

  return (
    <div
      className="custom-tooltip"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onTouchStart={show}
      onTouchEnd={hide}
      onTouchCancel={hide}
    >
      {childWithAria}

      {isVisible && (
        <div id={tooltipId} role="tooltip" className={cn("custom-tooltip__content", variant ? variant : "")}>
          <div className="custom-tooltip__bubble">
            {content}
            <span className="custom-tooltip__arrow" />
          </div>
        </div>
      )}
    </div>
  );
}
