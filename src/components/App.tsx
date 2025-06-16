import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";
import { Theme } from "@swc-react/theme";
import React, { useState } from "react";
import "./App.css";

import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

import ImageTab from "./ImageTab";
import GenerateTab from "./GenerateTab";
import ExportTab from "./ExportTab";
import WriteTab from "./WriteTab";

const tabLabels = ["Image", "Generate", "Export", "Write"];

const MathDraw = ({ addOnUISdk }: { addOnUISdk: AddOnSDKAPI }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabClick = (index: number) => {
    setSelectedTab(index);
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return <ImageTab addOnUISdk={addOnUISdk} />;
      case 1:
        return <GenerateTab />;
      case 2:
        return <ExportTab />;
      case 3:
        return <WriteTab addOnUISdk={addOnUISdk} />;
      default:
        return <ImageTab addOnUISdk={addOnUISdk} />;
    }
  };

  return (
    <Theme system="express" scale="medium" color="light">
      <div
        className="container"
        style={{ minWidth: 280, maxWidth: 320, padding: 12 }}
      >
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Input type</span>
        </div>

        <div
          style={{
            display: "flex",
            borderRadius: 6,
            border: "1px solid #ccc",
            marginBottom: 12,
            overflow: "hidden",
            width: "100%",
          }}
        >
          {tabLabels.map((label, idx) => (
            <button
              key={label}
              onClick={() => handleTabClick(idx)}
              style={{
                flex: 1,
                padding: "6px 2px",
                border: "none",
                background: selectedTab === idx ? "#e6e6fa" : "white",
                color: selectedTab === idx ? "#6b46c1" : "#666",
                fontWeight: selectedTab === idx ? 600 : 400,
                cursor: "pointer",
                fontSize: 10,
                transition: "all 0.2s ease",
                minWidth: 0,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {renderTabContent()}
      </div>
    </Theme>
  );
};

const App = ({ addOnUISdk }: { addOnUISdk: AddOnSDKAPI }) => {
  return <MathDraw addOnUISdk={addOnUISdk} />;
};

export default App;
