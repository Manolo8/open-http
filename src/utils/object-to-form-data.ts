function objectToFormData(object: any): FormData {
    const formData = new FormData();

    fillFormDataRecursively(formData, object, undefined, new Set<any>());

    return formData;
}

function fillFormDataRecursively(
    formData: FormData,
    object: any,
    parentKey: string | undefined,
    visited: Set<any>
) {
    const key = parentKey ?? '';

    if (object && typeof object === 'object' && !(object instanceof Date) && !(object instanceof Blob)) {
        if (visited.has(object)) throw new Error('objectToFormData: circular reference detected');

        visited.add(object);

        Object.keys(object).forEach((childKey) => {
            fillFormDataRecursively(
                formData,
                object[childKey],
                parentKey ? `${parentKey}[${childKey}]` : childKey,
                visited
            );
        });

        visited.delete(object);
    } else if (object instanceof Date) {
        formData.append(key, object.toISOString());
    } else if (object instanceof Blob) {
        // File extends Blob, so both are appended untouched.
        formData.append(key, object);
    } else {
        formData.append(key, object == null ? '' : String(object));
    }
}

export default objectToFormData;
