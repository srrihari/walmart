import React from "react";
import Recommend from "../components/Recommend";
import RecentlyPurchased from "../components/RecentlyPuchased";

export default function Home() {
  return (
    <>
      <Recommend />
      <RecentlyPurchased />
    </>
  );
}
