import React from "react";

export default function AdminButtons() {
  return (
    <View>
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
                handlePress={handleStopRecoding}
              />
            )}

            {!isRecording && locationArr.length > 0 && (
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
    </View>
  );
}
