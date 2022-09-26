import MapButton from "../MapButton";

interface SaveButtonProps {
  isRecording: boolean;
  locationArrLength: number;
  handlePress: () => void;
}

function SaveButton({
  isRecording,
  locationArrLength,
  handlePress,
}: SaveButtonProps) {
  if (!isRecording && locationArrLength >= 2) {
    return (
      <MapButton
        label="Save"
        backgroundColor="blue"
        handlePress={handlePress}
      />
    );
  }
  return null;
}

export default SaveButton;
