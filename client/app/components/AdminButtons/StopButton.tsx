import MapButton from "../MapButton";

interface StopButtonProps {
  isRecording: boolean;
  locationArrLength: number;
  handlePress: () => void;
}

function StopButton({
  isRecording,
  locationArrLength,
  handlePress,
}: StopButtonProps) {
  if (isRecording && locationArrLength > 0) {
    return (
      <MapButton label="Stop" backgroundColor="red" handlePress={handlePress} />
    );
  }
  return null;
}

export default StopButton;
