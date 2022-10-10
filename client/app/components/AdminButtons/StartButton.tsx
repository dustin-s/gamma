import MapButton from "../MapButton";

interface StartButtonProps {
  isRecording: boolean;
  locationArrLength: number;
  handlePress: () => void;
}

function StartButton({
  isRecording,
  locationArrLength,
  handlePress,
}: StartButtonProps) {
  if (!isRecording && locationArrLength > 0) {
    return (
      <MapButton
        label="Start"
        backgroundColor="green"
        handlePress={handlePress}
      />
    );
  }
  return null;
}

export default StartButton;
