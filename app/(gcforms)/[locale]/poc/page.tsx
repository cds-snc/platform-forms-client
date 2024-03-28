import React from "react";
import { Metadata } from "next";
import { TestComponent } from "./TestComponent";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Test",
  };
}

export default async function Page() {
  return (
    <div className="mt-10">
      <TestComponent />
    </div>
  );
}
