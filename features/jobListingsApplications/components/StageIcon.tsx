import { ApplicationStage } from "@/db/schema";
import {
  CircleCheckIcon,
  CircleHelpIcon,
  CircleXIcon,
  HandshakeIcon,
  SpeechIcon,
} from "lucide-react";
import { ComponentProps } from "react";

export function StageIcon({
  stage,
  ...props
}: { stage: ApplicationStage } & ComponentProps<typeof CircleHelpIcon>) {
  const Icon = getIcon(stage);

  return <Icon {...props} />;
}

function getIcon(stage: ApplicationStage) {
  switch (stage) {
    case "applied":
      return CircleHelpIcon;
    case "interested":
      return CircleCheckIcon;
    case "denied":
      return CircleXIcon;
    case "interviewed":
      return SpeechIcon;
    case "hired":
      return HandshakeIcon;
    default:
      throw new Error(`Unknown stage: ${stage satisfies never}`);
  }
}
