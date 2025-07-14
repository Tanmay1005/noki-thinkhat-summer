const pointsMap = {
	"child-black-female": "child-black-female-points.svg",
	"child-female": "child-female-points.svg",
	"child-male": "child-male-points.svg",
	"elder-female": "elder-female-points.svg",
	"elder-male": "elder-male-points.svg",
	infant: "infant-generic-points.svg",
	"middle-age-female": "middle-age-female-points.svg",
	"middle-age-male": "middle-age-male-points.svg",
	"toddler-black-female": "toddler-black-female-points.svg",
	"toddler-female": "toddler-female-points.svg",
	"toddler-male": "toddler-male-points.svg",
};

function getAgeGroup(age) {
	if (age >= 0 && age <= 2) return "infant";
	if (age >= 3 && age <= 7) return "toddler";
	if (age >= 8 && age <= 15) return "child";
	if (age >= 16 && age <= 45) return "middle-age";
	return "elder";
}

function normalizeGender(genderInput) {
	const g = genderInput.toLowerCase();
	if (["girl", "woman", "female", "other"].includes(g)) return "female";
	if (["boy", "man", "male"].includes(g)) return "male";
	return null;
}

function getSvgFileInfo(age, origin, genderInput, isAvatar = false) {
	const ageGroup = getAgeGroup(age);
	const gender = normalizeGender(genderInput);
	const appearance = origin?.toLowerCase();
	if (!gender) {
		throw new Error(`Unrecognized gender: ${genderInput}`);
	}

	const base = `${ageGroup}-${appearance}-${gender}`;
	if (isAvatar) {
		return `${base}-avatar.svg`;
	}
	const baseName = `${base}.svg`;

	const pointsName =
		pointsMap[base] ||
		pointsMap[`${ageGroup}-${gender}`] ||
		pointsMap[ageGroup] ||
		null;

	return { base: baseName, points: pointsName };
}
export default getSvgFileInfo;
