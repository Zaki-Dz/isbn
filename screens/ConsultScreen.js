import { useState, useEffect } from "react";
import { StatusBar, Image, Modal, Text } from "react-native";
import styled from "styled-components/native";
import { BarCodeScanner } from "expo-barcode-scanner";
import "react-native-reanimated";
import { MotiView } from "moti";
import scanning from "../assets/scanning-animation.gif";

import { ref, set, onValue, update, increment } from "firebase/database";
import { db, auth } from "../firebase";

const ConsultScreen = ({ route }) => {
  const [ISBN, setISBN] = useState();
  const [book, setBook] = useState();
  const [clients, setClients] = useState([]);

  const [scanned, setScanned] = useState(false);

  const [modalVisibility, setModalVisibility] = useState(false);

  useEffect(() => {
    const reference = ref(db, "books/" + ISBN);

    onValue(reference, (snapshot) => {
      const data = snapshot.val();

      setBook(data);
    });
  }, [ISBN]);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);

    const reference = ref(db, "books/" + data);

    onValue(reference, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        setISBN(data.ISBN);

        setClients([]);

        data?.CLIENT.split("+").map((client) =>
          setClients((prev) => [
            ...prev,
            { name: client.split("/")[1], qte: client.split("/")[0] },
          ])
        );
      } else {
        setModalVisibility(true);
      }
    });
  };

  const handleButton = () => {
    setScanned(false);

    setISBN();
    setBook();
  };

  return (
    <SHome behaviour="height">
      <StatusBar hidden />

      <Modal animationType="slide" transparent={true} visible={modalVisibility}>
        <ModalContainer>
          <SModal>
            <ModalTitle>Livre introuvable !</ModalTitle>

            <SButton
              onPress={() => {
                setModalVisibility(false);
                setScanned(false);
              }}
            >
              <ButtonText>Ok</ButtonText>
            </SButton>
          </SModal>
        </ModalContainer>
      </Modal>

      <ScannerContainer>
        <BarCodeScanner
          style={{
            width: "100%",
            height: "100%",
          }}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
      </ScannerContainer>

      <Content>
        {book && (
          <MotiView
            from={{ scale: 0 }}
            animate={{ scale: scanned ? 1 : 0 }}
            transition={{ type: "timing" }}
          >
            <SButton onPress={handleButton} success>
              <ButtonText>Ok</ButtonText>
            </SButton>

            <Card>
              <Result>{book.TITLE}</Result>
            </Card>

            <Card>
              <Result size={2}>{book.ARRIVED_QTE + " / " + book.QTE}</Result>
            </Card>

            <Card style={{ flexDirection: "column" }}>
              {clients.map((client) => {
                let size;

                let len = clients.length;

                if (len == 1) {
                  size = 3;
                } else if (len == 2) {
                  size = 2;
                } else if (len > 2) {
                  size = 1;
                }

                let result;

                let total = book.ARRIVED_QTE;

                if (total > client.qte) {
                  total -= client.qte;

                  result = (
                    <Result key={client} color="red" size={size}>
                      {client.name + " = " + client.qte + "/" + client.qte}
                    </Result>
                  );
                } else {
                  result = (
                    <Result key={client} color="red" size={size}>
                      {client.name + " = " + total + "/" + client.qte}
                    </Result>
                  );

                  total = 0;
                }

                return result;
              })}
            </Card>
          </MotiView>
        )}
      </Content>
    </SHome>
  );
};

export default ConsultScreen;

const SHome = styled.KeyboardAvoidingView`
  flex: 1;
`;

const ScannerContainer = styled.View`
  flex: 1;
  background-color: black;
`;

const Content = styled.View`
  position: absolute;
  width: 100%;
  bottom: 0;
  padding-vertical: 10px;
  padding-horizontal: 20px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  background-color: #fff;
`;

const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  background-color: #000a;
`;

const SModal = styled.View`
  align-items: center;
  justify-content: center;
  margin: 32px;
  padding: 16px;
  background-color: white;
`;

const ModalTitle = styled.Text`
  font-weight: bold;
  font-size: 24px;
  margin-bottom: 8px;
`;

const ModalDescription = styled.Text`
  font-size: 20px;
  margin-bottom: 16px;
  text-align: center;
`;

const SButton = styled.TouchableOpacity`
  background-color: ${(props) =>
    props.success ? "#119fe1" : props.ok ? "#1cc38f" : "#011a53"};
  padding-horizontal: 16px;
  padding-vertical: 8px;
  border-radius: 10px;
  margin-bottom: 10px;
`;

const ButtonText = styled.Text`
  color: white;
  text-align: center;
  text-transform: uppercase;
`;

const Card = styled.View`
  border-radius: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #eef;
  width: 100%;
`;

const Result = styled.Text`
  flex: 1;
  font-weight: bold;
  text-align: center;
  font-size: ${(props) => (props.size ? 18 * props.size + "px" : "18px")};
  color: ${(props) => (props.color ? props.color : "#119fe1")};
`;

const SText = styled.Text`
  flex: 1;
  font-weight: bold;
  text-align: center;
  font-size: 18px;
  color: #119fe1;
`;
