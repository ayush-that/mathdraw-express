import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";
import { Theme } from "@swc-react/theme";
import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import "@spectrum-web-components/tabs/sp-tabs.js";
import "@spectrum-web-components/tabs/sp-tab.js";
import "@spectrum-web-components/tabs/sp-tab-panel.js";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "sp-tabs": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        selected?: string;
        ref?: React.Ref<any>;
      };
      "sp-tab": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        value?: string;
        label?: string;
      };
      "sp-tab-panel": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        value?: string;
      };
    }
  }
}

import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

import ImageTab from "./ImageTab";
import GenerateTab from "./GenerateTab";
import WriteTab from "./WriteTab";

const MathDraw = ({ addOnUISdk }: { addOnUISdk: AddOnSDKAPI }) => {
  const [selectedTab, setSelectedTab] = useState("image");
  const tabsRef = useRef<any>(null);

  useEffect(() => {
    const handleTabChange = (event: any) => {
      setSelectedTab(event.target.selected);
    };

    if (tabsRef.current) {
      tabsRef.current.addEventListener("change", handleTabChange);
    }

    return () => {
      if (tabsRef.current) {
        tabsRef.current.removeEventListener("change", handleTabChange);
      }
    };
  }, []);

  const renderTabContent = () => {
    switch (selectedTab) {
      case "image":
        return <ImageTab addOnUISdk={addOnUISdk} />;
      case "generate":
        return <GenerateTab addOnUISdk={addOnUISdk} />;
      case "write":
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
        <sp-tabs
          ref={tabsRef}
          selected={selectedTab}
          style={{ marginBottom: "14px" }}
        >
          <sp-tab value="image" label="Image">
            Image
          </sp-tab>
          <sp-tab value="generate" label="Generate">
            Generate
          </sp-tab>
          <sp-tab value="write" label="Write">
            Write
          </sp-tab>
        </sp-tabs>

        {renderTabContent()}
      </div>
    </Theme>
  );
};

const App = ({ addOnUISdk }: { addOnUISdk: AddOnSDKAPI }) => {
  return <MathDraw addOnUISdk={addOnUISdk} />;
};

export default App;
