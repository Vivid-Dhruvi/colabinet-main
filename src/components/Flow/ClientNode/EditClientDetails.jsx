import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FlowContext } from "../Flow";
import { UpdateProfile } from "@/service/general.service";
import { MainContext } from "@/App";

export function EditClientDetails({ open, setIsOpen, value }) {
  const [useName, setUserName] = useState("");
  const { token } = useContext(MainContext);
  const { handleUserProfile } = useContext(FlowContext);
  const [icon, setIcon] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUserName(value?.name);
  }, [value]);

  const validateInputs = () => {
    if (!useName.trim()) {
      setError("Name is required");
      return false;
    }

    if (icon) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(icon.type)) {
        setError("Only JPG and PNG images are allowed");
        return false;
      }

      const maxSizeInMB = 2;
      if (icon.size / 1024 / 1024 > maxSizeInMB) {
        setError("Icon must be less than 2MB");
        return false;
      }
    }

    setError("");
    return true;
  };

  const handleSubmit = () => {
    if (!validateInputs()) return;

    setLoading(true);

    const payload = {
      name: useName,
      ...(icon && { logo: icon }),
    };

    UpdateProfile(token, payload)
      .then((res) => {
        if (res.success) {
          handleUserProfile(res.data);
          setIsOpen(false);
          setError("");
        }
      })
      .catch((err) => {
        setError("An error occurred. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog open={open} onOpenChange={() => setIsOpen(false)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Company Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="edit-business-area" className="text-sm font-medium">
              Company Name
            </label>
            <Input id="edit-business-area" placeholder="Company Name" value={useName} onChange={(e) => setUserName(e.target.value)} className="w-full" />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-business-area-icon" className="text-sm font-medium">
              User Profile
            </label>
            <Input id="edit-business-area-icon" type="file" accept=".jpg,.jpeg,.png" onChange={(e) => setIcon(e.target.files[0])} className="w-full" />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            Update
            {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent ml-2" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
