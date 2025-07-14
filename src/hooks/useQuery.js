import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// Custom hook to get query parameters
export const useQuery = () => {
	const location = useLocation();
	const [query, setQuery] = useState(new URLSearchParams(location.search));

	useEffect(() => {
		setQuery(new URLSearchParams(location.search));
	}, [location.search]);

	return query;
};

// Function to set a query parameter
export const setQuery = (text, value) => {
	const url = new URL(window.location.href);
	url.searchParams.set(text, value);
	window.history.replaceState(null, null, url);
	window.dispatchEvent(new Event("popstate"));
};

// Function to remove a query parameter
export const removeQuery = (text) => {
	const url = new URL(window.location.href);
	url.searchParams.delete(text);
	window.history.replaceState(null, null, url);
	window.dispatchEvent(new Event("popstate"));
};

// Function to clear all query parameters
export const clearAllQueries = () => {
	const url = new URL(window.location.href);
	url.search = ""; // Clear all query parameters
	window.history.replaceState(null, "", url.href);
	window.dispatchEvent(new Event("popstate"));
};
