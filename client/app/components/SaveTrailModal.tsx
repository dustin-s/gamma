import React, { SetStateAction, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
  Switch,
} from "react-native";

interface SaveTrailModalProps {
  modalVisible: boolean;
  setModalVisible(value: SetStateAction<boolean>): void;
}

const SaveTrailModal = ({
  modalVisible,
  setModalVisible,
}: SaveTrailModalProps) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [isClosed, setIsClosed] = useState(false);

  return (
    // <View style={styles.centeredView}>
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
            <View style={styles.controlGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.txtInput}
                placeholder="Name"
                value={name}
                onChangeText={(value) => setName(value)}
              />
            </View>
            {/* <View style={styles.controlGroup}> */}
            <View style={styles.multiControlGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.txtInput}
                multiline
                numberOfLines={4}
                placeholder="Description"
                value={description}
                onChangeText={(value) => setDescription(value)}
              />
            </View>
            <View style={styles.controlGroup}>
              <Text style={styles.label}>Difficulty</Text>
              <TextInput
                style={styles.txtInput}
                placeholder="Description"
                value={difficulty}
                onChangeText={(value) => setDifficulty(value)}
              />
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
            <Pressable
              style={styles.button}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.btnTextStyle}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
    //  </View>
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
    fontWeight: "500",
    marginRight: 5,
  },
  txtInput: {
    // this will cause the input to fill the entire space use "marginEnd" to limit its size
    flexGrow: 1,
    borderWidth: 1,
    fontSize: 20,
    paddingHorizontal: 5,
  },
  button: {
    marginTop: 25,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: "#2196F3",
  },
  btnTextStyle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default SaveTrailModal;
