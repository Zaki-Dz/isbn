import { useState, useEffect } from "react";
import {
	StatusBar,
	AsyncStorage,
	Text,
	Alert,
	Modal,
	View,
	Pressable,
	Keyboard,
} from "react-native";
import styled from "styled-components/native";
import * as XLSX from "xlsx/xlsx";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import base64 from "base-64";
import "react-native-reanimated";
import { MotiView, MotiImage } from "moti";
import FaviconImage from "../assets/favicon.png";

const AddFileScreen = ({ navigation }) => {
	const [allBooks, setAllBooks] = useState();
	const [thereIsCachedFile, setThereIsCachedFile] = useState(false);
	const [thereIsNotFoundFile, setThereIsNotFoundFile] = useState(false);

	const [confirmModalVisibility, setConfirmModalVisibility] = useState(false);

	const [nameModalVisibility, setNameModalVisibility] = useState(false);
	const [name, setName] = useState(null);
	const [reference, setReference] = useState(null);

	const [nameNewModalVisibility, setNameNewModalVisibility] = useState(false);
	const [nameNew, setNameNew] = useState(null);
	const [referenceNew, setReferenceNew] = useState(null);

	const [existingFileModalVisibility, setExistingFileModalVisibility] =
		useState(false);

	const storeData = async (value) => {
		const jsonValue = JSON.stringify(value);

		await AsyncStorage.setItem("fileData", jsonValue);
	};

	const getData = async () => {
		const jsonValue = await AsyncStorage.getItem("fileData");

		return jsonValue != null ? JSON.parse(jsonValue) : null;
	};

	const storeNewData = async (value) => {
		const jsonValue = JSON.stringify(value);

		await AsyncStorage.setItem("newFileData", jsonValue);
	};

	const getNewData = async () => {
		const jsonValue = await AsyncStorage.getItem("newFileData");

		return jsonValue != null ? JSON.parse(jsonValue) : null;
	};

	useEffect(() => {
		getData().then((res) => res && setThereIsCachedFile(true));
	}, [thereIsCachedFile]);

	useEffect(() => {
		getNewData().then((res) => res && setThereIsNotFoundFile(true));
	}, [thereIsNotFoundFile]);

	// trigerred on click
	const handleFile = async () => {
		// get the uploaded file
		let path = await DocumentPicker.getDocumentAsync();

		// read the uploaded file as base64
		let fileContent = FileSystem.readAsStringAsync(path.uri, {
			encoding: FileSystem.EncodingType.Base64,
		});

		// get the uploaded file's content and set it to a state
		let res = await fileContent;

		// decode the base64 content and read it as excel
		let workbook = XLSX.read(base64.decode(res), {
			type: "binary",
		});

		// looping through every row of the excel file and convert it to json
		workbook.SheetNames.forEach((sheet) => {
			let rowObject = XLSX.utils.sheet_to_row_object_array(
				workbook.Sheets[sheet]
			);

			let finalData = rowObject;

			storeData(finalData);

			setAllBooks(finalData);

			setThereIsCachedFile(true);

			setThereIsNotFoundFile(true);

			storeNewData(null);

			navigation.navigate("Scanner", { allBooks: finalData });
		});
	};

	const handleNewFileButton = () => {
		setConfirmModalVisibility(true);
	};

	const handleExistingFileButton = async () => {
		let storedData;
		await getData().then((res) => (storedData = res));

		storedData == null
			? alert("Aucun fichier existant trouvé!")
			: await navigation.navigate("Scanner", { allBooks: storedData });
	};

	const handleConsultButton = async () => {
		let storedData;
		await getData().then((res) => (storedData = res));

		storedData == null
			? alert("Aucun fichier existant trouvé!")
			: await navigation.navigate("Consult", { allBooks: storedData });
	};

	// function to handle exporting
	const exportDataToExcel = async (data, name) => {
		// Created Sample data
		let sample_data_to_export = data;

		let wb = await XLSX.utils.book_new();
		let ws = await XLSX.utils.json_to_sheet(sample_data_to_export);
		await XLSX.utils.book_append_sheet(wb, ws, "Users");
		const wbout = await XLSX.write(wb, { type: "binary", bookType: "xlsx" });

		const uri = FileSystem.cacheDirectory + name + ".xlsx";

		FileSystem.writeAsStringAsync(uri, base64.encode(wbout), {
			encoding: FileSystem.EncodingType.Base64,
		});

		// Sharing file (code)
		await Sharing.shareAsync(uri, {
			mimeType:
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			dialogTitle: "Excel File",
			UTI: "com.microsoft.excel.xlsx",
		});
	};

	const handleConfirmDownload = async () => {
		if (!name || !reference) {
			alert("Nom ou Référence sont vide!");
		} else {
			let storedData;
			await getData().then((res) => (storedData = res));

			storedData == null
				? alert("Aucun fichier trouvé!")
				: exportDataToExcel(storedData, name + "-" + reference);
		}

		setName(null);
		setReference(null);
	};

	const handleDownload = () => {
		setNameModalVisibility(true);
	};

	const handleNotFoundBooksData = async () => {
		if (!nameNew || !referenceNew) {
			alert("Nom ou Référence sont vide!");
		} else {
			let storedData;
			await getNewData().then((res) => (storedData = res));

			storedData == null || storedData.length == 0
				? alert("Aucun fichier trouvé!")
				: exportDataToExcel(
						storedData,
						nameNew + "-" + referenceNew + "-Not-Found"
				  );
		}

		setNameNew(null);
		setReferenceNew(null);
	};

	const handleNewDownload = () => {
		setNameNewModalVisibility(true);
	};

	return (
		<SContainer>
			<StatusBar hidden />

			<Modal
				animationType="slide"
				transparent={true}
				visible={confirmModalVisibility}
			>
				<Pressable
					style={{ flex: 1 }}
					onPress={() => {
						setConfirmModalVisibility(false);
					}}
				>
					<ModalContainer>
						<SModal>
							<ModalTitle>Vous êtes certain ?</ModalTitle>

							<ModalDescription>
								Si il y a un fichier existant, il sera remplacé par le nouveau.
							</ModalDescription>

							<View>
								<SButton
									ok
									onPress={() => {
										setConfirmModalVisibility(false);
										handleFile();
									}}
								>
									<ButtonText ok>Ok</ButtonText>
								</SButton>

								<SButton onPress={() => setConfirmModalVisibility(false)}>
									<ButtonText>Annuler</ButtonText>
								</SButton>
							</View>
						</SModal>
					</ModalContainer>
				</Pressable>
			</Modal>

			<Modal
				animationType="slide"
				transparent={true}
				visible={nameModalVisibility}
			>
				<Pressable
					style={{ flex: 1 }}
					onPress={() => {
						setNameModalVisibility(false);
					}}
				>
					<ModalContainer>
						<Pressable onPress={() => Keyboard.dismiss()}>
							<SModal>
								<ModalTitle>
									Enter votre nom et la référence du conteneur:
								</ModalTitle>

								<SInput placeholder="Nom" onChangeText={(e) => setName(e)} />

								<SInput
									placeholder="Référence"
									onChangeText={(e) => setReference(e)}
								/>

								<View>
									<SButton
										ok
										onPress={() => {
											setNameModalVisibility(false);
											handleConfirmDownload();
										}}
									>
										<ButtonText>Ok</ButtonText>
									</SButton>

									<SButton
										onPress={() => {
											setNameModalVisibility(false);
										}}
									>
										<ButtonText>Annuler</ButtonText>
									</SButton>
								</View>
							</SModal>
						</Pressable>
					</ModalContainer>
				</Pressable>
			</Modal>

			<Modal
				animationType="slide"
				transparent={true}
				visible={nameNewModalVisibility}
			>
				<Pressable
					style={{ flex: 1 }}
					onPress={() => {
						setNameNewModalVisibility(false);
					}}
				>
					<ModalContainer>
						<Pressable onPress={() => Keyboard.dismiss()}>
							<SModal>
								<ModalTitle>
									Enter votre nom et la référence du conteneur:
								</ModalTitle>

								<SInput placeholder="Nom" onChangeText={(e) => setNameNew(e)} />

								<SInput
									placeholder="Référence"
									onChangeText={(e) => setReferenceNew(e)}
								/>

								<View>
									<SButton
										ok
										onPress={() => {
											setNameNewModalVisibility(false);
											handleNotFoundBooksData();
										}}
									>
										<ButtonText>Ok</ButtonText>
									</SButton>

									<SButton
										onPress={() => {
											setNameNewModalVisibility(false);
										}}
									>
										<ButtonText>Annuler</ButtonText>
									</SButton>
								</View>
							</SModal>
						</Pressable>
					</ModalContainer>
				</Pressable>
			</Modal>

			<Modal
				animationType="slide"
				transparent={true}
				visible={existingFileModalVisibility}
			>
				<Pressable
					style={{ flex: 1 }}
					onPress={() => {
						setExistingFileModalVisibility(false);
					}}
				>
					<ModalContainer>
						<SModal>
							<View>
								<SButton
									ok
									onPress={() => {
										setExistingFileModalVisibility(false);
										handleConsultButton();
									}}
								>
									<ButtonText ok>Consulter</ButtonText>
								</SButton>

								<SButton
									onPress={() => {
										setExistingFileModalVisibility(false);
										handleExistingFileButton();
									}}
								>
									<ButtonText>Receptionner</ButtonText>
								</SButton>
							</View>
						</SModal>
					</ModalContainer>
				</Pressable>
			</Modal>

			<ImagesContainer
				delay={1000}
				from={{ translateY: -50, opacity: 0 }}
				animate={{ translateY: 0, opacity: 1 }}
				transition={{
					type: "timing",
				}}
			>
				<SImage source={FaviconImage} />
			</ImagesContainer>

			<MotiView
				delay={1500}
				from={{ translateY: -50, opacity: 0 }}
				animate={{ translateY: 0, opacity: 1 }}
				transition={{
					type: "timing",
				}}
			>
				{thereIsCachedFile && (
					<SButton onPress={() => setExistingFileModalVisibility(true)}>
						<ButtonText>Fichier existant</ButtonText>
					</SButton>
				)}

				<SButton onPress={handleNewFileButton}>
					<ButtonText>Nouveau fichier</ButtonText>
				</SButton>

				{thereIsCachedFile && (
					<SButton onPress={handleDownload} success>
						<ButtonText>Exporter</ButtonText>
					</SButton>
				)}

				{thereIsNotFoundFile && (
					<SButton onPress={handleNewDownload} success>
						<ButtonText>Exporter (Not-Found)</ButtonText>
					</SButton>
				)}
			</MotiView>

			<SFooter
				delay={2000}
				from={{ translateY: 50, opacity: 0 }}
				animate={{ translateY: 0, opacity: 1 }}
				transition={{
					type: "timing",
				}}
			>
				<FooterText>
					© {new Date().getFullYear()} SARL Techno Sciences All Rights Reserved
				</FooterText>
			</SFooter>
		</SContainer>
	);
};

export default AddFileScreen;

const SContainer = styled.View`
	flex: 1;
	padding: 20px;
	align-items: center;
	justify-content: center;
`;

const ImagesContainer = styled(MotiView)`
	align-items: center;
	margin-bottom: 20px;
`;

const SImage = styled.Image`
	width: 100px;
	height: 100px;
	resize-mode: contain;
	margin: 20px;
`;

const SButton = styled.TouchableOpacity`
	background-color: ${(props) =>
		props.success ? "#46a0de" : props.ok ? "#1cc38f" : "#0e1f47"};
	padding-horizontal: 16px;
	padding-vertical: 8px;
	border-radius: 10px;
	margin-bottom: 8px;
	width: 200px;
`;

const ButtonText = styled.Text`
	color: white;
	text-align: center;
	text-transform: uppercase;
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
	color: #0e1f47;
`;

const ModalDescription = styled.Text`
	font-size: 20px;
	margin-bottom: 16px;
	text-align: center;
	color: #0e1f47;
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
	width: 200px;
`;

const SFooter = styled(MotiView)`
	position: absolute;
	bottom: 0;
	padding-bottom: 16px;
`;

const FooterText = styled.Text`
	text-align: center;
	font-size: 12px;
	color: #0e1f47;
`;
