const API_BASE = "../../Backend/api/index.php";

export const API_URLS = {
    LOGIN:        API_BASE + "?route=login",
    REGISTER:     API_BASE + "?route=register",

    ADD_TASK:     API_BASE + "/tasks/add",
    LIST_TASKS:   API_BASE + "?route=tasks/list",
    UPDATE_TASK:  API_BASE + "?route=tasks/update",
    DELETE_TASK:  API_BASE + "?route=tasks/delete",
};
