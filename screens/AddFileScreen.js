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

import {
	ref,
	set,
	remove,
	onValue,
	update,
	increment,
} from "firebase/database";
import { db, auth } from "../firebase";

const AddFileScreen = ({ navigation }) => {
	const [thereIsCachedFile, setThereIsCachedFile] = useState(false);

	const [existingFileModalVisibility, setExistingFileModalVisibility] =
		useState(false);

	useEffect(() => {
		const reference = ref(db, "books/");

		onValue(reference, (snapshot) => {
			const data = snapshot.val();

			data ? setThereIsCachedFile(true) : setThereIsCachedFile(false);
		});
	}, [thereIsCachedFile]);

	const handleExistingFileButton = async () => {
		navigation.navigate("Scanner");
	};

	const handleConsultButton = async () => {
		navigation.navigate("Consult");
	};

	return (
		<SContainer>
			<StatusBar hidden />

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
