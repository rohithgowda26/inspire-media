"use client";

import { useEffect, useState } from "react";

const format = () =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true })
    .format(new Date())
    .toUpperCase();

/** Live India time (IST, 12-hour) for the phone mockups' status bar. */
export function PhoneClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(format());
    const id = window.setInterval(() => setTime(format()), 10_000);
    return () => window.clearInterval(id);
  }, []);

  return <span suppressHydrationWarning>{time || " "}</span>;
}
