export function displayToast(type, message) {
    if (!window.toastr) {
        console.error("Toastr is not loaded!");
        return;
    }

    switch (type) {
        case "success": window.toastr.success(message); break;
        case "error": window.toastr.error(message); break;
        case "warning": window.toastr.warning(message); break;
        case "info": window.toastr.info(message); break;
        default: console.warn("Invalid toast type:", type);
    }
}
