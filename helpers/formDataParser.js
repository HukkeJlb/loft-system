const formDataParser = (formData) => {
    const parsedData = JSON.parse(formData);
    return parsedData;
}

module.exports = formDataParser;