import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AppStateProvider } from "./003_provider/AppStateProvider";
import { AppSettingProvider, useAppSetting } from "./003_provider/AppSettingProvider";

const AppStateProviderWrapper = () => {
    const { applicationSetting } = useAppSetting();
    const [firstTach, setFirstTouch] = React.useState<boolean>(false);
    if (!applicationSetting || !firstTach) {
        return (
            <>
                <div
                    onClick={() => {
                        setFirstTouch(true);
                    }}
                >
                    Start
                </div>
            </>
        );
    } else {
        return (
            <AppStateProvider>
                <App />
            </AppStateProvider>
        );
    }
};

const container = document.getElementById("app")!;
const root = createRoot(container);
root.render(
    <AppSettingProvider>
        <AppStateProviderWrapper></AppStateProviderWrapper>
    </AppSettingProvider>
);
