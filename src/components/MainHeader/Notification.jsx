import { MainContext } from "@/App";
import { getNNotificationList } from "@/service/reposting.service";
import * as Popover from "@radix-ui/react-popover";
import { useContext, useEffect, useState } from "react";

export function NotificationPopup() {
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const { token } = useContext(MainContext);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNNotificationList(token);
        setNotificationCount(data?.data?.notification_count || 0);
        let notification_list = data?.data?.notifications?.data || [];
        if (notification_list.length > 0) {
          notification_list = notification_list.filter((noti) => !noti.is_read);
          setNotifications(notification_list);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [token]);

  function timeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - new Date(date)) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (let unit in intervals) {
      const value = Math.floor(seconds / intervals[unit]);
      if (value >= 1) {
        return value + " " + unit + (value > 1 ? "s" : "") + " ago";
      }
    }
    return "just now";
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" className="ml-auto flex items-center justify-center size-6 md:size-8 p-0 outline-none border-0 cursor-pointer relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-full">
            <path
              fillRule="evenodd"
              d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="absolute -top-1 -right-1 md:top-0 md:right-0 size-4 rounded-full border border-solid border-white bg-green-400 text-white flex items-center justify-center !font-small leading-none text-[10px]">
            {notificationCount}
          </span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-96 rounded-lg border border-gray-200 bg-white shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          align="end"
          sideOffset={8}
        >
          <div className="p-0">
            <div className="flex flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-base font-medium text-gray-900">Notifications</h3>
            </div>
            {notifications.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                <div>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="border-b border-solid border-gray-200 group cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-start gap-3 px-5 py-2.5">
                        <div className="flex-1 min-w-0 space-y-1">
                          <p
                            className="text-sm font-medium text-gray-900 leading-none text-ellipsis max-w-full overflow-hidden whitespace-nowrap"
                            title={notification.descriptions}
                          >
                            {notification.descriptions}
                          </p>
                          <a href={notification?.redirect?.url} className="inline-block text-xs leading-none text-[#3d9ca5]/80 hover:text-[#3d9ca5]">
                            {notification.redirect?.text}
                          </a>
                          <p className="text-[13px] leading-none text-gray-500">{timeAgo(notification.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div>
                    <a
                      href="/notifications"
                      className="cursor-pointer flex items-center justify-center py-3 px-4 text-sm font-medium text-black transition-colors duration-200 rounded-lg hover:bg-blue-50"
                    >
                      View All Notifications
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-2 py-4">
                <div className="text-[16px] text-gray-500 text-center">No notification found</div>
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
