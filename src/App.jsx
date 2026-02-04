import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import WebFont from "webfontloader";
import { getUsesrDetails, loginusercheck } from "./service/general.service";
import AiDashBoard from "./Pages/AiDashboard";
import BusinessLayout from "./Pages/layouts/BusinessLayout";
import BusinessOverview from "./Pages/BusinessOverview";
import BusinessSetup from "./Pages/BusinessSetup";

export const MainContext = React.createContext();
export const ChatContext = React.createContext();

function App() {
  const [user, setUser] = React.useState(null);
  const [token, setToken] = React.useState(null);

  const [visulizerValue, setVisulizerValue] = React.useState(0);
  const [voiceConversationEnabled, setVoiceConversationEnabled] = React.useState(false);
  const recognitionRef = React.useRef(null);
  const synthRef = React.useRef(window.speechSynthesis || null);
  const currentUtteranceRef = React.useRef(null);
  const isEnabledRef = React.useRef(false);
  const isMountedRef = React.useRef(true);
  const isRecognitionActiveRef = React.useRef(false);

  useEffect(() => {
    // setToken('122804|KxYLuI4T19I8ACLMyq0myBccSf0olbNgj7Gjq0Jq80b38c54')
    loginusercheck().then((res) => {
      if (res.success) {
        setToken(res.auth_token);
      } else {
        setToken(null);
      }
    });
  }, []);

  useEffect(() => {
    if (token) {
      const my_timeout = setTimeout(loadUser, 300);
      return () => {
        clearTimeout(my_timeout);
      };
    }
  }, [token]);

  const loadUser = async () => {
    const data = await getUsesrDetails(token);
    const user_data = data?.user;
    if (data.success) {
      const plan_combine = {
        ...data.user,
        ...(user_data?.role_id == 7 ? { user_permission: data?.permissions, permission_type: data?.permission_type } : {}),
        active_plan_status: data?.active_plan_status,
        company_hash: data?.marketingPlan?.hash_id,
      };
      setUser(plan_combine);
    }
  };

  useEffect(() => {
    WebFont.load({
      google: {
        families: ["Poppins:400,700"],
      },
    });
  }, []);

  return (
    <MainContext.Provider value={{ user_id: user?.id, user, token, loadUser }}>
      <ChatContext.Provider
        value={{
          voiceConversationEnabled,
          setVoiceConversationEnabled,
          recognitionRef,
          synthRef,
          currentUtteranceRef,
          isEnabledRef,
          isMountedRef,
          isRecognitionActiveRef,
          setVisulizerValue,
          visulizerValue,
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/business" element={<BusinessLayout />}>
              <Route path="setup" element={<BusinessSetup />} />
              <Route path="overview" element={<BusinessOverview />} />
            </Route>
            <Route path="/ai-dashboard" element={<AiDashBoard />} />
            <Route path="/workflow/On-boarding/:id" element={<AiDashBoard />} />
            <Route path="/workflow/details/:id" element={<AiDashBoard />} />
            <Route path="/view/instance/:id" element={<AiDashBoard />} />
            <Route path="/task/dashboard" element={<AiDashBoard />} />
            <Route path="/task/calendar" element={<AiDashBoard />} />
            <Route path="/customers" element={<AiDashBoard />} />
            <Route path="/messages" element={<AiDashBoard />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors />
      </ChatContext.Provider>
    </MainContext.Provider>
  );
}

export default App;
