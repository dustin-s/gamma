import { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { AuthContext } from "../../utils/authContext";
import MapButton from "../MapButton";

interface AdminButtonsProps {
  addingTrail: boolean;
  isRecording: boolean;
  hasLocations: boolean;
  trailId: number | null;
  handleAddTrail: () => void;
  handleStartRecording: () => void;
  handleStopRecording: () => void;
  handleSave: () => void;
  handleAddPOI: () => void;
}

export default function AdminButtons({
  addingTrail,
  isRecording,
  hasLocations,
  trailId,
  handleAddTrail,
  handleStartRecording,
  handleStopRecording,
  handleSave,
  handleAddPOI,
}: AdminButtonsProps) {
  // Authorization
  const { auth } = useContext(AuthContext);

  if (!auth.userData?.user.userId) {
    return null;
  }

  return (
    <View style={styles.btnContainer}>
      {!addingTrail ? (
        <MapButton
          label="Add Trail"
          handlePress={handleAddTrail}
          backgroundColor="blue"
        />
      ) : (
        <>
          {!isRecording && (
            <MapButton
              label="Start"
              backgroundColor="green"
              handlePress={handleStartRecording}
            />
          )}

          {isRecording && (
            <MapButton
              label="Stop"
              backgroundColor="red"
              handlePress={handleStopRecording}
            />
          )}

          {!isRecording && hasLocations && (
            <MapButton
              label="Save"
              backgroundColor="blue"
              handlePress={handleSave}
            />
          )}
        </>
      )}
      {(addingTrail || trailId) && (
        <MapButton
          label="Add Pt of Interest"
          backgroundColor="purple"
          handlePress={handleAddPOI}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    width: "100%",
    margin: 10,
  },
});
