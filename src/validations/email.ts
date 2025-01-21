export const dartmouthEmailPattern = /^([a-z]+)(?:\.([^@\d.]+))*(?:\.([^@\d.]+))?(?:\.(\d{2}|gr))?@dartmouth\.edu$/;

export function emailValidator(email: string) {
    // const dartmouthEmailPattern = /^[a-z]+(?:[-.][a-z]+)*(?:\.\d{2}|\.gr)?@dartmouth\.edu$/;

    return dartmouthEmailPattern.test(email.toLowerCase());
}