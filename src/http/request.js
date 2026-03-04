class YahRequest {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }
    async get() {
        const url = window.origin + this.endpoint;
        const response = await fetch(url);
        return response.text();
    }
}
