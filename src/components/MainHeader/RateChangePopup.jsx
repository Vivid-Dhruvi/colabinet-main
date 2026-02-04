import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getBusinessType } from "@/service/general.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "../ui/input";
import { MainContext } from "@/App";

export function RateChangePopup({ open, setOpen, submitDetails }) {
  const { token } = useContext(MainContext);
  const [businessType, setBusinessType] = useState(null);
  const [hoursRate, setHoursRate] = useState(0);
  const [btypes, setBTypes] = useState([]);
  const [error, setError] = useState({
    hourRate: "",
    businessType: "",
  });

  useEffect(() => {
    getBusinessType(token).then((res) => {
      setBusinessType(res[0].id);
      setBTypes(res);
    });
  }, []);

  const handleAddRate = () => {
    submitDetails({ role_id: 5, interested_rate: Number(hoursRate), business_role: businessType });
  };

  const handleSelect = (value) => {
    setBusinessType(value);
    setError((prev) => ({ ...prev, businessType: "" }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden border-none rounded-[32px]">
          <div className="flex flex-col items-center px-8 py-8 pt-6">
            <img src="/images/dashboard_switcher.png" alt="Become a Freelancer" className="w-20 h-20 mb-4" />

            <DialogHeader className="text-center mb-4">
              <DialogTitle className="text-[28px] font-bold text-[#1A2B3B] leading-tight mb-2">Become a Freelancer on Colabi</DialogTitle>
              <p className="text-[#6B7280] leading-relaxed text-center text-md">
                Are you interested in completing work for other businesses on Colabi? Just share a few quick details to set up your freelancer profile.
              </p>
            </DialogHeader>

            <div className="w-full space-y-6 mt-2">
              <div className="space-y-2">
                <label htmlFor="role" className="text-base font-semibold text-[#1A2B3B]">
                  Role
                </label>
                <Select onValueChange={handleSelect} value={businessType}>
                  <SelectTrigger className="w-full !h-12 border-[#D1D5DB] rounded-xl text-[#6B7280]">
                    <SelectValue placeholder="Select how you'd like to offer your services" />
                  </SelectTrigger>
                  <SelectContent>
                    {btypes.map((ba) => (
                      <SelectItem value={ba.id} key={ba.id}>
                        {ba.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[#6B7280] text-[12px] leading-tight">Choose the type of work arrangement that best describes how you operate.</p>
                {error?.businessType && <p className="text-red-500 text-xs mt-1">{error.businessType}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="hourly-rate" className="text-base font-semibold text-[#1A2B3B]">
                  Hourly Rate (USD)
                </label>
                <Input
                  id="hourly-rate"
                  placeholder="$ e.g., 40"
                  value={hoursRate}
                  onChange={(e) => setHoursRate?.(e.target.value)}
                  className="w-full h-12 border-[#D1D5DB] rounded-xl placeholder:text-[#9CA3AF]"
                />
                <p className="text-[#6B7280] text-[12px] leading-tight">Used as a general guideline so businesses know what to expect when offering tasks.</p>
              </div>
            </div>

            <div className="flex gap-4 w-full mt-6">
              <Button
                className="flex-1 h-12 text-white bg-gradient-to-r from-[#62AAB4] to-[#14B8A6] hover:bg-[#3DAFAE] rounded-[8px] text-lg font-semibold"
                onClick={handleAddRate}
              >
                Save & Continue
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12 border-[#D1D5DB] text-[#6B7280] rounded-[8px] text-lg font-semibold bg-transparent"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </div>

            <p className="text-[#6B7280] text-[13px] mt-4 text-center">You can update these details anytime from your Freelancer Settings.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
