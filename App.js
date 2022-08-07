import HomeScreen from "./screens/HomeScreen";
import AddFileScreen from "./screens/AddFileScreen";
import ConsultScreen from "./screens/ConsultScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Permissions from "expo-permissions";

const App = () => {
	const Stack = createNativeStackNavigator();

	Permissions.askAsync(Permissions.CAMERA);

	Permissions.askAsync(Permissions.MEDIA_LIBRARY);

	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="Home">
				<Stack.Screen
					name="Home"
					component={AddFileScreen}
					options={{ headerShown: false }}
				/>

				<Stack.Screen
					name="Scanner"
					component={HomeScreen}
					options={{ headerShown: false }}
				/>

				<Stack.Screen
					name="Consult"
					component={ConsultScreen}
					options={{ headerShown: false }}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default App;
