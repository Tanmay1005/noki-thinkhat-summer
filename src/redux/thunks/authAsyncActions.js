import { createAsyncThunk } from "@reduxjs/toolkit";
import { auth, signOut } from "../../firebase-setup";
import { reset_state } from "../slices/authSlice";

export const resetStateAndSignOut = createAsyncThunk(
	"auth/resetStateAndSignOut",
	async (_, { dispatch }) => {
		try {
			await signOut(auth);
			localStorage?.clear();
			dispatch(reset_state());
		} catch (error) {
			console.error("Some issue in Firebase signout", error);
			throw error;
		}
	},
);
