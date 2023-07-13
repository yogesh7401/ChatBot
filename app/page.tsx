"use client";
import { useState } from "react";
import Chat from "./components/chat";
import Document from "./components/document";

export default function Home() {
  const [tab, setTab] = useState("chat");

  return (
    <div className="min-h-screen bg-white">
      <div className="text-4xl py-2 shadow-lg border-b">
        <div className="container mx-auto">
          <h1>ChatBot</h1>
        </div>
      </div>
      <div className="container mx-auto pt-[20px]">
        <div className="flex">
          <p
            onClick={() => setTab("chat")}
            className={`p-2 px-5 ml-6 cursor-pointer ${
              tab === "chat" ? "font-bold" : "font-semibold text-gray-400"
            } `}
          >
            AI ChatBot
          </p>
          <p
            onClick={() => setTab("document")}
            className={`p-2 px-5 cursor-pointer ${
              tab === "document" ? "font-bold" : "font-semibold text-gray-400"
            } `}
          >
            Document Q&A
          </p>
        </div>
        {tab === "chat" ? <Chat /> : <Document />}
      </div>
    </div>
  );
}
