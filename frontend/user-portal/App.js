import React from "react";
import RootNavigator from "./src/core/navigation/RootNavigator";
import { LanguageProvider } from "./src/state/language";

export default function App() {
  return (
    <LanguageProvider>
      <RootNavigator />
    </LanguageProvider>
  );
}