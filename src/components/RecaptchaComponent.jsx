import { useEffect, useRef, useState } from "react";

const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

const RecaptchaComponent = ({ setIsVerifyCode, setCaptchaToken, action }) => {
	const recaptchaRef = useRef(null);
	const [isScriptLoaded, setIsScriptLoaded] = useState(false);

	useEffect(() => {
		const script = document.createElement("script");
		script.src =
			"https://www.google.com/recaptcha/enterprise.js?render=explicit";
		script.async = true;
		script.defer = true;
		script.onload = () => setIsScriptLoaded(true);
		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	useEffect(() => {
		if (isScriptLoaded && recaptchaRef.current) {
			window.grecaptcha.enterprise.ready(() => {
				window.grecaptcha.enterprise.render(recaptchaRef.current, {
					sitekey: RECAPTCHA_SITE_KEY,
					theme: "light",
					action: action,
					callback: (token) => {
						// localStorage.setItem("recapToken", token)
						setIsVerifyCode(true);
						setCaptchaToken(token);
					},
					"expired-callback": () => {
						setIsVerifyCode(false);
						setCaptchaToken("");
					},
				});
			});
		}
	}, [isScriptLoaded]);

	return <div ref={recaptchaRef} />;
};

export default RecaptchaComponent;
