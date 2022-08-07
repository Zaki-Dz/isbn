import { useState, useEffect } from "react";
import {
	View,
	Text,
	StatusBar,
	AsyncStorage,
	KeyboardAvoidingView,
	Keyboard,
	Pressable,
	Image,
	Modal,
} from "react-native";
import styled from "styled-components/native";
import { BarCodeScanner } from "expo-barcode-scanner";
import * as XLSX from "xlsx/xlsx";
import * as FileSystem from "expo-file-system";
import "react-native-reanimated";
import { MotiView } from "moti";
import scanning from "../assets/scanning-animation.gif";

const Home = ({ route }) => {
	const [finalData, setFinalData] = useState([]);
	const [book, setBook] = useState();
	const [arrivedQuantity, setArrivedQuantity] = useState(null);
	const [scannedQuantity, setScannedQuantity] = useState(0);
	const [ISBN, setISBN] = useState();

	const [newFinalData, setNewFinalData] = useState([]);
	const [newISBN, setNewISBN] = useState();
	const [newArrivedQuantity, setNewArrivedQuantity] = useState(0);

	const [hasPermission, setHasPermission] = useState(null);
	const [scanned, setScanned] = useState(false);

	const [modalVisibility, setModalVisibility] = useState(false);

	const storeData = async (value) => {
		const jsonValue = JSON.stringify(value);

		await AsyncStorage.setItem("fileData", jsonValue);
	};

	const storeNewData = async (value) => {
		const jsonValue = JSON.stringify(value);

		await AsyncStorage.setItem("newFileData", jsonValue);
	};

	const getNewData = async () => {
		const jsonValue = await AsyncStorage.getItem("newFileData");

		return jsonValue != null ? JSON.parse(jsonValue) : null;
	};

	const handleBarCodeScanned = ({ type, data }) => {
		setScanned(true);

		let ended = false;

		let founded = false;

		route.params.allBooks.map((item, i) => {
			if (item.ISBN == data) {
				setBook(item);

				setArrivedQuantity(item["QTE LIV"]);

				setISBN(data);

				founded = true;
			}

			if (route.params.allBooks.length - 1 == i) {
				ended = true;
			}
		});

		if (ended && !founded) {
			setModalVisibility(true);
		}
	};

	const handleQuantity = (e) => {
		setArrivedQuantity(e);

		setScannedQuantity(e);
	};

	const handleButton = () => {
		book &&
			route.params.allBooks.map((item) => {
				if (item.ISBN == book.ISBN) {
					item.ARRIVED_QTE = arrivedQuantity;

					return item;
				}
			});

		Keyboard.dismiss();

		storeData(route.params.allBooks);

		setFinalData(route.params.allBooks);

		setScanned(false);

		setBook();

		setArrivedQuantity(null);

		setScannedQuantity(0);

		setISBN();
	};

	const handleNewButton = () => {
		setModalVisibility(false);
		setScanned(false);

		let ended = false;

		let founded = false;

		Keyboard.dismiss();

		// parcourer l file li kayen ida fih wela lala
		route.params.allBooks.map((item, i) => {
			if (item.ISBN == newISBN) {
				setBook(item);

				setArrivedQuantity(item["QTE LIV"]);

				setISBN(newISBN);

				founded = true;
			}

			if (route.params.allBooks.length - 1 == i) {
				ended = true;
			}
		});

		if (ended && !founded) {
			let data = { ISBN: newISBN, "QTE LIV": newArrivedQuantity };

			// chof ida kayen file ta3 not found wela makach
			getNewData().then((res) => {
				let innerEnded = false;

				let innerFounded = false;

				if (res && res.length != 0) {
					// ida kayen nparcourih ou nchof ida fih isbn li ktebto
					res.map((item, i) => {
						if (item.ISBN == newISBN) {
							item["QTE LIV"] =
								parseInt(item["QTE LIV"]) + parseInt(newArrivedQuantity);

							innerFounded = true;
						}

						if (res.length - 1 == i) {
							innerEnded = true;
						}
					});

					if (innerEnded && !innerFounded) {
						storeNewData([...res, data]);

						setNewFinalData([...res, data]);
					} else {
						storeNewData(res);

						setNewFinalData(res);
					}
				} else {
					// ida makach nekhdem file jdid ou ndir data dakhlo
					setNewFinalData([data]);

					storeNewData([data]);
				}
			});
		}
	};

	return (
		<SHome behaviour="height">
			<StatusBar hidden />

			<Modal animationType="slide" transparent={true} visible={modalVisibility}>
				<ModalContainer>
					<SModal>
						<ModalTitle>Livre introuvable !</ModalTitle>

						<SInput
							type="number"
							placeholder="ISBN"
							onChangeText={(e) => setNewISBN(e)}
							keyboardType="numeric"
						/>

						<SInput
							type="number"
							placeholder="Quantity"
							onChangeText={(e) => setNewArrivedQuantity(e)}
							keyboardType="numeric"
						/>

						<View>
							<SButton ok onPress={handleNewButton}>
								<ButtonText ok>Ajouter</ButtonText>
							</SButton>

							<SButton
								onPress={() => {
									setModalVisibility(false);
									setScanned(false);
								}}
							>
								<ButtonText>Annuler</ButtonText>
							</SButton>
						</View>
					</SModal>
				</ModalContainer>
			</Modal>

			<ScannerContainer>
				<Pressable onPress={() => Keyboard.dismiss()}>
					<BarCodeScanner
						style={{
							width: "100%",
							height: "100%",
						}}
						onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
					/>
				</Pressable>
			</ScannerContainer>

			<Content>
				<SInput
					type="number"
					placeholder="Quantitée scannée"
					onChangeText={handleQuantity}
					value={arrivedQuantity}
					keyboardType="numeric"
				/>

				{book ? (
					<MotiView
						from={{ scale: 0 }}
						animate={{ scale: scanned ? 1 : 0 }}
						transition={{ type: "timing" }}
					>
						<SButton onPress={handleButton} success>
							<ButtonText>Ok</ButtonText>
						</SButton>

						<Card>
							<Result>{book.TITRE}</Result>
						</Card>

						<Card>
							<Result size={2}>
								{book.ARRIVED_QTE == null
									? 0 + " / " + book["QTE LIV"]
									: book.ARRIVED_QTE + " / " + book["QTE LIV"]}
							</Result>
						</Card>

						<Card style={{ flexDirection: "column" }}>
							{book["CODE CLIENT"].split("+").map((client) => {
								let size;

								let len = book["CODE CLIENT"].split("+").length;

								if (len == 1) {
									size = 3;
								} else if (len == 2) {
									size = 2;
								} else if (len > 2) {
									size = 1;
								}

								return (
									<Result color="red" size={size}>
										{len > 1
											? client.split("/")[1] + " = " + client.split("/")[0]
											: client}
									</Result>
								);
							})}
						</Card>
					</MotiView>
				) : (
					<Image
						source={scanning}
						style={{ width: 100, height: 100, alignSelf: "center" }}
					/>
				)}
			</Content>
		</SHome>
	);
};

export default Home;

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

const SInput = styled.TextInput`
	padding-vertical: 5px;
	padding-horizontal: 10px;
	border-width: 1px;
	border-style: solid;
	border-color: dodgerblue;
	border-radius: 10px;
	margin-bottom: 10px;
	background-color: #fff;
	align-self: stretch;
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
