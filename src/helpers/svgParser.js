const validNameCharacters = /[a-zA-Z0-9:_-]/;
const whitespace = /[\s\t\r\n]/;
const quotemark = /['"]/;
function getLocator(source, options = {}) {
	const offsetLine = options.offsetLine || 0;
	const offsetColumn = options.offsetColumn || 0;

	const originalLines = source.split("\n");

	let start = 0;
	const lineRanges = originalLines.map((line, i) => {
		const end = start + line.length + 1;
		const range = { start, end, line: i };

		start = end;
		return range;
	});

	let i = 0;

	function rangeContains(range, index) {
		return range.start <= index && index < range.end;
	}

	function getLocation(range, index) {
		return {
			line: offsetLine + range.line,
			column: offsetColumn + index - range.start,
			character: index,
		};
	}

	function locate(search, startIndex) {
		if (typeof search === "string") {
			search = source.indexOf(search, startIndex || 0);
		}

		let range = lineRanges[i];
		const d = search >= range.end ? 1 : -1;

		while (range) {
			if (rangeContains(range, search)) return getLocation(range, search);

			i += d;
			range = lineRanges[i];
		}
	}

	return locate;
}

function locate(source, search, options) {
	if (typeof options === "number") {
		throw new Error(
			"locate takes a { startIndex, offsetLine, offsetColumn } object as the third argument",
		);
	}

	return getLocator(source, options)(search, options && options.startIndex);
}

function repeat(str, i) {
	let result = "";
	while (i--) result += str;
	return result;
}

export default function parse(source) {
	let header = "";
	const stack = [];

	let state = metadata;
	let currentElement = null;
	let root = null;

	function error(message) {
		const { line, column } = locate(source, i);
		const before = source.slice(0, i);
		const beforeLine = /(^|\n).*$/.exec(before)[0].replace(/\t/g, "  ");
		const after = source.slice(i);
		const afterLine = /.*(\n|$)/.exec(after)[0];

		const snippet = `${beforeLine}${afterLine}\n${repeat(
			" ",
			beforeLine.length,
		)}^`;

		throw new Error(
			`${message} (${line}:${column}) ERROR parsing svg ${snippet}`,
		);
	}

	function metadata() {
		while (
			(i < source.length && source[i] !== "<") ||
			!validNameCharacters.test(source[i + 1])
		) {
			header += source[i++];
		}

		return neutral();
	}

	function neutral() {
		let text = "";
		while (i < source.length && source[i] !== "<") text += source[i++];

		if (/\S/.test(text)) {
			currentElement.children.push({ type: "text", value: text });
		}

		if (source[i] === "<") {
			return tag;
		}

		return neutral;
	}

	function tag() {
		const char = source[i];

		if (char === "?") return neutral; // <?xml...

		if (char === "!") {
			if (source.slice(i + 1, i + 3) === "--") return comment;
			if (source.slice(i + 1, i + 8) === "[CDATA[") return cdata;
			if (/doctype/i.test(source.slice(i + 1, i + 8))) return neutral;
		}

		if (char === "/") return closingTag;

		const tagName = getName();

		const element = {
			type: "element",
			tagName,
			properties: {},
			children: [],
		};

		if (currentElement) {
			currentElement.children.push(element);
		} else {
			root = element;
		}

		let attribute;
		while (i < source.length && (attribute = getAttribute())) {
			element.properties[attribute.name] = attribute.value;
		}

		let selfClosing = false;

		if (source[i] === "/") {
			i += 1;
			selfClosing = true;
		}

		if (source[i] !== ">") {
			error("Expected >");
		}

		if (!selfClosing) {
			currentElement = element;
			stack.push(element);
		}

		return neutral;
	}

	function comment() {
		const index = source.indexOf("-->", i);
		if (!~index) error("expected -->");

		i = index + 2;
		return neutral;
	}

	function cdata() {
		const index = source.indexOf("]]>", i);
		if (!~index) error("expected ]]>");

		currentElement.children.push(source.slice(i + 7, index));

		i = index + 2;
		return neutral;
	}

	function closingTag() {
		const tagName = getName();

		if (!tagName) error("Expected tag name");

		if (tagName !== currentElement.tagName) {
			error(
				`Expected closing tag </${tagName}> to match opening tag <${currentElement.tagName}>`,
			);
		}

		allowSpaces();

		if (source[i] !== ">") {
			error("Expected >");
		}

		stack.pop();
		currentElement = stack[stack.length - 1];

		return neutral;
	}

	function getName() {
		let name = "";
		while (i < source.length && validNameCharacters.test(source[i]))
			name += source[i++];

		return name;
	}

	function getAttribute() {
		if (!whitespace.test(source[i])) return null;
		allowSpaces();

		const name = getName();
		if (!name) return null;

		let value = true;

		allowSpaces();
		if (source[i] === "=") {
			i += 1;
			allowSpaces();

			value = getAttributeValue();
			if (!isNaN(value) && value.trim() !== "") value = +value; // TODO whitelist numeric attributes?
		}

		return { name, value };
	}

	function getAttributeValue() {
		return quotemark.test(source[i])
			? getQuotedAttributeValue()
			: getUnquotedAttributeValue();
	}

	function getUnquotedAttributeValue() {
		let value = "";
		do {
			const char = source[i];
			if (char === " " || char === ">" || char === "/") {
				return value;
			}

			value += char;
			i += 1;
		} while (i < source.length);

		return value;
	}

	function getQuotedAttributeValue() {
		const quotemark = source[i++];

		let value = "";
		let escaped = false;

		while (i < source.length) {
			const char = source[i++];
			if (char === quotemark && !escaped) {
				return value;
			}

			if (char === "\\" && !escaped) {
				escaped = true;
			}

			value += escaped ? `\\${char}` : char;
			escaped = false;
		}
	}

	function allowSpaces() {
		while (i < source.length && whitespace.test(source[i])) i += 1;
	}

	let i = metadata.length;
	while (i < source.length) {
		if (!state) error("Unexpected character");
		state = state();
		i += 1;
	}

	if (state !== neutral) {
		error("Unexpected end of input");
	}

	if (root.tagName === "svg") root.metadata = header;
	return {
		type: "root",
		children: [root],
	};
}
