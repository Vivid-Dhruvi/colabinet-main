import React from "react";

function TimeCounter() {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <span className="block break-words break-all font-normal text-xs xl:text-sm text-gray-500 leading-none">
      {formatDate(currentTime)}
    </span>
  );
}

function formatDate(date) {
  const day = date.getDate();
  const daySuffix = getOrdinalSuffix(day);
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${day}${daySuffix} ${month} ${year} ${time}`;
}

function getOrdinalSuffix(day) {
  if (day >= 11 && day <= 13) {
    return "th";
  }

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export default TimeCounter;
