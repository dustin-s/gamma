import MapButton from "../MapButton";

interface POIButtonProps {
  trailId: number | null;
  isAddingTrail: boolean;
  locationArrLength: number;
  handlePress: () => void;
}

function POIButton({
  trailId,
  isAddingTrail,
  locationArrLength,
  handlePress,
}: POIButtonProps) {
  if (trailId || (isAddingTrail && locationArrLength > 0)) {
    return (
      <MapButton
        label="Add Pt of Interest"
        backgroundColor="purple"
        handlePress={handlePress}
      />
    );
  }
  return null;
}

export default POIButton;
