import React, { useContext } from "react";
import Roadmap from "@/components/Roadmap/Roadmap";
import { BusinessContext } from "../layouts/BusinessLayout";

function BusinessSetup() {
  const { currentPath, setCurrnetPath, handleBusinessOverview, crScoketMessage, setCRSocketMessage, handleCurrentInnerPath } = useContext(BusinessContext);

  return (
    <Roadmap
      currentPath={currentPath}
      setCurrnetPath={setCurrnetPath}
      handleBusinessOverview={handleBusinessOverview}
      crScoketMessage={crScoketMessage}
      sendExtMessage={setCRSocketMessage}
      handleCurrentInnerPath={handleCurrentInnerPath}
    />
  );
}

export default BusinessSetup;
