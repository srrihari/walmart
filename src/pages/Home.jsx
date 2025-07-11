import React from "react";
import Recommend from "../components/Recommend";
import RecentlyPurchased from "../components/RecentlyPuchased";
import FeatureBox from "../components/FeatureBox";

export default function Home() {
  return (
    <>
      <FeatureBox />
      <Recommend />
      <RecentlyPurchased />
    </>
  );
}
