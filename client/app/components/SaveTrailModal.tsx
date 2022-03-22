import React, { SetStateAction, useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
  Switch,
  Alert,
} from "react-native";
import { SaveTrailData } from "../interfaces/SaveTrailData";
import SlideSelector from "./SlideSelector";

interface SaveTrailModalProps {
  modalVisible: boolean;
  setModalVisible(value: SetStateAction<boolean>): void;
  saveTrail({}: SaveTrailData): void;
  doCancel(): void;
}

const SaveTrailModal = ({
  modalVisible,
  setModalVisible,
  saveTrail,
  doCancel,
}: SaveTrailModalProps) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [difficulty, setDifficulty] = useState<"easy" | "moderate" | "hard">(
    "easy"
  );
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    if (modalVisible) {
      console.log("\nModal visible");
      console.log(`name: ${name}`);
      console.log(`description: ${description}`);
      console.log(`difficulty: ${difficulty}`);
      console.log(`isClosed: ${isClosed}`);
    }
  }, [modalVisible]);

  const handleCancel = () => {
    console.log("cancel was pressed on the modal");
    // do warning modal
    // doCancel();

    return Alert.alert(
      "Cancel",
      "Are you sure you want to cancel? This will delete your current trail data.",
      [
        {
          text: "No",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            // reset modal's states
            setName("");
            setDescription("");
            setDifficulty("easy");

            doCancel();
          },
        },
      ]
    );
  };

  const handleSubmit = () => {
    console.log("SaveTrailModal handleSubmit: reached");
    const saveData = {
      name,
      description,
      difficulty,
      isClosed,
    };
    console.log(saveData);

    saveTrail(saveData);
    setModalVisible(!modalVisible);
  };

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.header}>
              <Text style={styles.headerLabel}>Save Trail</Text>
              <Pressable
                style={styles.closeBtn}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.closeBtnText}>X</Text>
              </Pressable>
            </View>
            <View style={styles.controlGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.txtInput}
                placeholder="Name"
                value={name}
                onChangeText={(value) => setName(value)}
              />
            </View>
            <View style={styles.multiControlGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.txtInput, { textAlignVertical: "top" }]}
                multiline={true}
                numberOfLines={4}
                placeholder="Description"
                value={description}
                onChangeText={(value) => setDescription(value)}
              />
            </View>
            <View style={styles.controlGroup}>
              <SlideSelector
                data={[
                  {
                    label: "Easy",
                    colorSelected: "green",
                    colorNotSelected: "lightgreen",
                    textColorSelected: "black",
                    value: "easy",
                  },
                  {
                    label: "Moderate",
                    colorSelected: "orange",
                    colorNotSelected: "gold",
                    textColorSelected: "black",
                    value: "moderate",
                  },
                  {
                    label: "Hard",
                    colorSelected: "red",
                    colorNotSelected: "lightpink",
                    textColorSelected: "black",
                    value: "hard",
                  },
                ]}
                onSelect={setDifficulty}
                selected={difficulty}
              />
              {/* <Text style={styles.label}>Difficulty</Text>
              <TextInput
                style={styles.txtInput}
                placeholder={difficulty}
                value={difficulty}
                onChangeText={(value) => {
                  if (
                    value === "easy" ||
                    value === "moderate" ||
                    value === "hard"
                  )
                    setDifficulty(value);
                }}
              /> */}
            </View>
            <View style={styles.controlGroup}>
              <Text style={styles.label}>Closed?</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isClosed ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => setIsClosed(!isClosed)}
                value={isClosed}
              />
            </View>
            <View style={styles.btnBar}>
              <Pressable
                style={[styles.button, styles.cancelBtn]}
                onPress={handleCancel}
              >
                <Text style={styles.btnTextStyle}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.saveBtn]}
                onPress={handleSubmit}
              >
                <Text style={styles.btnTextStyle}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    width: "90%",
    paddingHorizontal: 10,
    paddingVertical: 25,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    paddingBottom: 25,
  },
  headerLabel: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  closeBtn: {
    position: "absolute",
    right: 10,
    top: 5,
  },
  closeBtnText: {
    color: "red",
  },
  controlGroup: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  multiControlGroup: {
    minHeight: 50,
    padding: 5,
  },
  label: {
    fontSize: 20,
    marginRight: 5,
  },
  txtInput: {
    // this will cause the input to fill the entire space use "marginEnd" to limit its size
    flexGrow: 1,
    borderWidth: 1,
    fontSize: 20,
    paddingHorizontal: 5,
  },

  btnBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 10,
    elevation: 2,
    width: "45%",
  },
  saveBtn: {
    backgroundColor: "#00bf00",
  },
  cancelBtn: {
    backgroundColor: "red",
  },
  btnTextStyle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default SaveTrailModal;
