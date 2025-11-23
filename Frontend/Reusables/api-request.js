export const apiRequest = (url, method, data = null, isJson = true) => {
    return $.ajax({
        url,
        method,
        data: data ? JSON.stringify(data) : null,
        processData: false,
        contentType: "application/json",
        dataType: "json"
    });
};
