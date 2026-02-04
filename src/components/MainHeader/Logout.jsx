import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { logoutUser } from "@/service/general.service";
import { MainContext } from "@/App";
import { useContext } from "react";

export function LogoutDialog({ open, setOpen }) {
  const { token } = useContext(MainContext);

  const handleLogout = async () => {
    await logoutUser(token);
    window.location.href = `/login`;
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none">
        <div className="relative w-full">
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="flex flex-col items-center px-6 py-8">
          <div className="w-48 h-48 relative mb-4">
            <img src="/images/logout_img.png" alt="Logout illustration" priority className="w-full" />
          </div>

          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-semibold text-center">Logout</DialogTitle>
            <DialogDescription className="text-base mt-2 text-center">Are you sure you want to logout?</DialogDescription>
          </DialogHeader>

          <div className="flex gap-4 w-full mt-8">
            <Button onClick={handleLogout} className="flex-1 py-3 text-white bg-[#4CBFBE] hover:bg-[#3DAFAE] text-center rounded-md w-full block h-auto">
              Yes
            </Button>
            <Button variant="outline" className="flex-1 py-3 border-[#4CBFBE] border text-[#4CBFBE] text-center rounded-md w-full block h-auto" onClick={() => setOpen(false)}>
              No
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
