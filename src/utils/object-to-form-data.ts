function objectToFormData(object: any): FormData {
    const formData = new FormData();

    fillFormDataRecursively(formData, object);

    return formData;
}

function fillFormDataRecursively(formData: FormData, object: any, parentKey?: string) {
    if (object && typeof object === 'object' && !(object instanceof Date) && !(object instanceof File)) {
        Object.keys(object).forEach((key) => {
            fillFormDataRecursively(formData, object[key], parentKey ? `${parentKey}[${key}]` : key);
        });
    } else {
        const value = object == null ? '' : object;

        formData.append(parentKey ?? '', value);
    }
}

export default objectToFormData;