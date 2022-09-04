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

import { ref, set, onValue, update, increment } from "firebase/database";
import { db, auth } from "../firebase";

const Home = ({ route }) => {
	const [ISBN, setISBN] = useState();
	const [book, setBook] = useState();
	const [arrivedQuantity, setArrivedQuantity] = useState(0);
	const [last, setLast] = useState(0);

	const [scanned, setScanned] = useState(false);

	const [modalVisibility, setModalVisibility] = useState(false);
	const [newISBN, setNewISBN] = useState();
	const [newArrivedQuantity, setNewArrivedQuantity] = useState();

	useEffect(() => {
		const reference = ref(db, "books/" + ISBN);

		onValue(reference, (snapshot) => {
			const data = snapshot.val();

			setBook(data);

			setLast(data?.LAST);
		});
	}, [ISBN]);

	const handleBarCodeScanned = ({ type, data }) => {
		setScanned(true);

		const reference = ref(db, "books/" + data);

		onValue(reference, (snapshot) => {
			const res = snapshot.val();

			if (res) {
				setISBN(res.ISBN);
			} else {
				setModalVisibility(true);
			}
		});
	};

	const handleQuantity = (e) => {
		setArrivedQuantity(e);
	};

	const handleButton = () => {
		let total = parseInt(arrivedQuantity);

		update(ref(db, "books/" + book.ISBN), {
			ARRIVED_QTE: increment(total),
			LAST: total,
		});

		Keyboard.dismiss();

		setArrivedQuantity();

		setBook();

		setISBN();

		setScanned(false);
	};

	const handleNewButton = () => {
		setModalVisibility(false);
		setScanned(false);

		Keyboard.dismiss();

		let reference = ref(db, "books/" + newISBN);

		let res;

		onValue(reference, (snapshot) => {
			res = snapshot.val();
		});

		if (res) {
			update(reference, {
				ARRIVED_QTE: increment(parseInt(newArrivedQuantity)),
			});
		} else {
			reference = ref(db, "notFound/" + newISBN);

			onValue(reference, (snapshot) => {
				res = snapshot.val();
			});

			if (res) {
				update(reference, {
					ARRIVED_QTE: increment(parseInt(newArrivedQuantity)),
				});
			} else {
				set(reference, {
					ISBN: newISBN,
					ARRIVED_QTE: parseInt(newArrivedQuantity),
				});
			}
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
							onChangeText={(e) => setNewArrivedQuantity(parseInt(e))}
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

			<Add onPress={() => setModalVisibility(true)}>
				<ButtonText size={2}>+</ButtonText>
			</Add>

			<Last>
				<Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
					{last}
				</Text>
			</Last>

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
							<Result>{book.TITLE}</Result>
						</Card>

						<Card>
							<Result size={2}>{book.ARRIVED_QTE + " / " + book.QTE}</Result>
						</Card>
					</MotiView>
				) : (
					// <Image
					// 	source={scanning}
					// 	style={{ width: 100, height: 100, alignSelf: "center" }}
					// />

					<Text>Scanning...</Text>
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

const Add = styled.Pressable`
	position: absolute;
	border-color: white;
	border-style: solid;
	border-width: 1px;
	top: 50px;
	right: 20px;
	border-radius: 50px;
	width: 50px;
	height: 50px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const Last = styled.View`
	position: absolute;
	border-color: white;
	border-style: solid;
	border-width: 1px;
	top: 50px;
	left: 20px;
	border-radius: 50px;
	width: 50px;
	height: 50px;
	display: flex;
	align-items: center;
	justify-content: center;
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
	font-size: ${(props) => (props.size ? props.size * 16 + "px" : "16px")};
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
