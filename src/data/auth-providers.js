import React from "react";

import { Github as GitHubIcon } from "mdi-material-ui";
import { Google as GoogleIcon } from "mdi-material-ui";

const authProviders = [
  {
    id: "google.com",
    color: "#ea4335",
    icon: <GoogleIcon />,
    name: "Google",
  },
  {
    id: "github.com",
    color: "#24292e",
    icon: <GitHubIcon />,
    name: "GitHub",
    scopes: ["repo"],
  },
  // {
  //   id: "microsoft.com",
  //   color: "#0078d7",
  //   icon: <MicrosoftIcon />,
  //   name: "Microsoft",
  // }
];

export default authProviders;
