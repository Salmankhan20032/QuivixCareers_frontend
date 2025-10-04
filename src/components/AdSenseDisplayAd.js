// src/components/AdSenseDisplayAd.js

import React, { useEffect } from "react";

const AdSenseDisplayAd = ({
  slotId,
  adFormat = "auto",
  style = { display: "block" },
}) => {
  useEffect(() => {
    try {
      // This tells AdSense to find and fill the ad unit.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []); // Run this effect only once when the component mounts

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client={process.env.REACT_APP_ADSENSE_CLIENT_ID}
      data-ad-slot={slotId}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
    ></ins>
  );
};

export default AdSenseDisplayAd;
